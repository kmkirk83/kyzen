export type TelegramChat = {
  id: number;
  title?: string;
  type: string;
  username?: string;
};

export type TelegramUser = {
  first_name?: string;
  id: number;
  last_name?: string;
  username?: string;
};

export type TelegramMessage = {
  chat: TelegramChat;
  from?: TelegramUser;
  message_id: number;
  text?: string;
};

export type TelegramUpdate = {
  edited_message?: TelegramMessage;
  message?: TelegramMessage;
  update_id: number;
};

const TELEGRAM_MESSAGE_LIMIT = 4000;
const TELEGRAM_FETCH_TIMEOUT_MS = 10_000;

export function getTelegramTextMessage(update: TelegramUpdate) {
  const message = update.message ?? update.edited_message;
  const text = message?.text?.trim();

  if (!message || !text) {
    return null;
  }

  return {
    chatId: String(message.chat.id),
    chatLabel: message.chat.title || message.chat.username || String(message.chat.id),
    senderLabel: formatSender(message.from),
    text,
  };
}

/**
 * Parse allowlist. Empty/missing returns an empty Set (fail-closed),
 * never null. Callers must not treat "no config" as allow-all.
 */
export function parseAllowedTelegramChatIds(raw: string | undefined): Set<string> {
  if (!raw?.trim()) {
    return new Set();
  }

  const chatIds = raw
    .split(",")
    .map((chatId) => chatId.trim())
    .filter(Boolean);

  return new Set(chatIds);
}

/**
 * Authorization is fail-closed.
 * - Empty allowlist => deny all chats.
 * - Production should always set TELEGRAM_ALLOWED_CHAT_IDS when the bot is enabled.
 */
export function isTelegramChatAllowed(chatId: string, allowedChatIds: Set<string>) {
  if (!allowedChatIds || allowedChatIds.size === 0) {
    return false;
  }

  return allowedChatIds.has(chatId);
}

export function assertTelegramUpdateShape(payload: unknown): TelegramUpdate {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid Telegram update: not an object");
  }

  const update = payload as Record<string, unknown>;
  if (typeof update.update_id !== "number") {
    throw new Error("Invalid Telegram update: missing update_id");
  }

  const message = (update.message ?? update.edited_message) as Record<string, unknown> | undefined;
  if (message) {
    const chat = message.chat as Record<string, unknown> | undefined;
    if (!chat || typeof chat.id !== "number") {
      throw new Error("Invalid Telegram update: message.chat.id required");
    }
  }

  return payload as TelegramUpdate;
}

export async function sendTelegramChatAction({
  action,
  botToken,
  chatId,
}: {
  action: "typing";
  botToken: string;
  chatId: string;
}) {
  await callTelegramApi({
    botToken,
    method: "sendChatAction",
    payload: { action, chat_id: chatId },
  });
}

export async function sendTelegramMessage({
  botToken,
  chatId,
  text,
}: {
  botToken: string;
  chatId: string;
  text: string;
}) {
  await callTelegramApi({
    botToken,
    method: "sendMessage",
    payload: {
      chat_id: chatId,
      text: truncateTelegramMessage(text),
    },
  });
}

async function callTelegramApi({
  botToken,
  method,
  payload,
}: {
  botToken: string;
  method: string;
  payload: Record<string, string>;
}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TELEGRAM_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Telegram API request failed with status ${response.status}.`);
    }
  } finally {
    clearTimeout(timer);
  }
}

function formatSender(user: TelegramUser | undefined) {
  if (!user) {
    return "Telegram user";
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();

  return fullName || user.username || `Telegram user ${user.id}`;
}

function truncateTelegramMessage(text: string) {
  const normalized = text.trim();

  if (normalized.length <= TELEGRAM_MESSAGE_LIMIT) {
    return normalized;
  }

  return `${normalized.slice(0, TELEGRAM_MESSAGE_LIMIT - 3)}...`;
}
