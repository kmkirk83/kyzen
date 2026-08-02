import { processTelegramCopilotUpdate } from "@/lib/telegram-copilot";
import type { AppEnv } from "@/lib/env";
import type { TelegramUpdate } from "@/lib/telegram";

const baseEnv: AppEnv = {
  NODE_ENV: "test",
  APP_URL: undefined,
  DATABASE_URL: undefined,
  AUTH_SECRET: undefined,
  AUTH_TRUST_HOST: undefined,
  OPENAI_API_KEY: "openai-key",
  OPENAI_MODEL: undefined,
  ANTHROPIC_API_KEY: undefined,
  ANTHROPIC_MODEL: undefined,
  STRIPE_SECRET_KEY: undefined,
  STRIPE_WEBHOOK_SECRET: undefined,
  SENTRY_DSN: undefined,
  CLARION_API_BASE_URL: undefined,
  TELEGRAM_BOT_TOKEN: "telegram-token",
  TELEGRAM_WEBHOOK_SECRET: "webhook-secret",
  TELEGRAM_ALLOWED_CHAT_IDS: undefined,
  TELEGRAM_COPILOT_SYSTEM_PROMPT: undefined,
};

const update: TelegramUpdate = {
  update_id: 1,
  message: {
    message_id: 2,
    chat: {
      id: 123,
      type: "private",
      username: "clarion-user",
    },
    from: {
      id: 456,
      first_name: "Casey",
      last_name: "Jones",
      username: "casey",
    },
    text: "Summarize the release blockers",
  },
};

describe("processTelegramCopilotUpdate", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("routes Telegram messages through the configured OpenAI provider", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "Here are the current release blockers." } }],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const result = await processTelegramCopilotUpdate({ env: baseEnv, update });

    expect(result).toEqual({ outcome: "replied", chatId: "123", provider: "openai" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://api.telegram.org/bottelegram-token/sendChatAction",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "https://api.telegram.org/bottelegram-token/sendMessage",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("blocks unauthorized chats when TELEGRAM_ALLOWED_CHAT_IDS is configured", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const result = await processTelegramCopilotUpdate({
      env: { ...baseEnv, TELEGRAM_ALLOWED_CHAT_IDS: "999,1000" },
      update,
    });

    expect(result).toEqual({ outcome: "blocked", chatId: "123" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.telegram.org/bottelegram-token/sendMessage",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("returns the help text for Telegram bot commands", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const result = await processTelegramCopilotUpdate({
      env: baseEnv,
      update: {
        ...update,
        message: {
          ...update.message!,
          text: "/help",
        },
      },
    });

    expect(result).toEqual({ outcome: "help", chatId: "123" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("sends a fallback error message when the provider call fails", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "boom" }), { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const result = await processTelegramCopilotUpdate({ env: baseEnv, update });

    expect(result).toEqual({ outcome: "error", chatId: "123" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
