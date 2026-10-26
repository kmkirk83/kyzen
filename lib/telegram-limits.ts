/**
 * Telegram update dedupe + per-chat quotas (in-memory for single instance).
 * Production should back these with Redis/DB uniqueness constraints.
 */

const processedUpdates = new Map<number, number>(); // update_id -> ts
const chatWindow = new Map<string, number[]>(); // chatId -> timestamps

const UPDATE_TTL_MS = 24 * 60 * 60 * 1000;
const CHAT_WINDOW_MS = 60 * 60 * 1000;
const CHAT_MAX_PER_WINDOW = 30;
const GLOBAL_MAX_PER_WINDOW = 200;
let globalHits: number[] = [];

function prune(map: Map<string, number[]>, windowMs: number) {
  const now = Date.now();
  for (const [k, arr] of map) {
    const next = arr.filter((t) => now - t < windowMs);
    if (next.length) map.set(k, next);
    else map.delete(k);
  }
}

export function isDuplicateTelegramUpdate(updateId: number): boolean {
  const now = Date.now();
  for (const [id, ts] of processedUpdates) {
    if (now - ts > UPDATE_TTL_MS) processedUpdates.delete(id);
  }
  if (processedUpdates.has(updateId)) return true;
  processedUpdates.set(updateId, now);
  return false;
}

export function checkTelegramQuota(chatId: string): { ok: true } | { ok: false; reason: string } {
  const now = Date.now();
  prune(chatWindow, CHAT_WINDOW_MS);
  globalHits = globalHits.filter((t) => now - t < CHAT_WINDOW_MS);

  if (globalHits.length >= GLOBAL_MAX_PER_WINDOW) {
    return { ok: false, reason: "Global Telegram quota exceeded" };
  }

  const hits = chatWindow.get(chatId) ?? [];
  if (hits.length >= CHAT_MAX_PER_WINDOW) {
    return { ok: false, reason: "Per-chat Telegram quota exceeded" };
  }

  hits.push(now);
  chatWindow.set(chatId, hits);
  globalHits.push(now);
  return { ok: true };
}

export function __resetTelegramLimits() {
  processedUpdates.clear();
  chatWindow.clear();
  globalHits = [];
}
