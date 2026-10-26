import { NextRequest, NextResponse } from "next/server";

import { readAppEnv } from "@/lib/env";
import {
  assertTelegramUpdateShape,
  getTelegramTextMessage,
  isTelegramChatAllowed,
  parseAllowedTelegramChatIds,
} from "@/lib/telegram";
import { handleTelegramCopilot } from "@/lib/telegram-copilot";

export async function POST(request: NextRequest) {
  const env = readAppEnv();
  if (!env.success) {
    return NextResponse.json({ error: "Invalid environment" }, { status: 500 });
  }

  const {
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_WEBHOOK_SECRET,
    TELEGRAM_ALLOWED_CHAT_IDS,
  } = env.data;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Telegram not configured" }, { status: 503 });
  }

  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let update;
  try {
    update = assertTelegramUpdateShape(payload);
  } catch {
    return NextResponse.json({ error: "Malformed update" }, { status: 400 });
  }

  const message = getTelegramTextMessage(update);
  if (!message) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const allowed = parseAllowedTelegramChatIds(TELEGRAM_ALLOWED_CHAT_IDS);
  if (!isTelegramChatAllowed(message.chatId, allowed)) {
    return NextResponse.json({ error: "Chat not allowed" }, { status: 403 });
  }

  try {
    await handleTelegramCopilot({
      botToken: TELEGRAM_BOT_TOKEN,
      chatId: message.chatId,
      text: message.text,
      env: env.data,
    });
  } catch {
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
