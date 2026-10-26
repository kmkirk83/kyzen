import { NextRequest, NextResponse } from "next/server";

import { readAppEnv } from "@/lib/env";
import { processTelegramCopilotUpdate } from "@/lib/telegram-copilot";
import {
  assertTelegramUpdateShape,
  getTelegramTextMessage,
  isTelegramChatAllowed,
  parseAllowedTelegramChatIds,
} from "@/lib/telegram";
import { checkTelegramQuota, isDuplicateTelegramUpdate } from "@/lib/telegram-limits";

export async function POST(request: NextRequest) {
  const envResult = readAppEnv();

  if (!envResult.success) {
    return NextResponse.json({ error: "Invalid environment configuration." }, { status: 500 });
  }

  const env = envResult.data;

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Telegram connector is not configured." }, { status: 503 });
  }

  if (request.headers.get("x-telegram-bot-api-secret-token") !== env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  let update;
  try {
    update = assertTelegramUpdateShape(payload);
  } catch {
    return NextResponse.json({ error: "Malformed Telegram update." }, { status: 400 });
  }

  if (isDuplicateTelegramUpdate(update.update_id)) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const message = getTelegramTextMessage(update);
  if (message) {
    const allowed = parseAllowedTelegramChatIds(env.TELEGRAM_ALLOWED_CHAT_IDS);
    if (!isTelegramChatAllowed(message.chatId, allowed)) {
      return NextResponse.json({ error: "Chat not allowed." }, { status: 403 });
    }

    const quota = checkTelegramQuota(message.chatId);
    if (!quota.ok) {
      return NextResponse.json({ error: quota.reason }, { status: 429 });
    }
  }

  await processTelegramCopilotUpdate({ env, update });

  return NextResponse.json({ ok: true });
}
