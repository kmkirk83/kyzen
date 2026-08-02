import { NextRequest } from "next/server";

import { POST } from "@/app/api/integrations/telegram/route";
import * as telegramCopilot from "@/lib/telegram-copilot";

const originalEnv = process.env;

describe("POST /api/integrations/telegram", () => {
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      TELEGRAM_BOT_TOKEN: "telegram-token",
      TELEGRAM_WEBHOOK_SECRET: "webhook-secret",
      OPENAI_API_KEY: "openai-key",
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env = originalEnv;
  });

  it("rejects requests with an invalid Telegram webhook secret", async () => {
    const processSpy = jest
      .spyOn(telegramCopilot, "processTelegramCopilotUpdate")
      .mockResolvedValue({ outcome: "ignored" });

    const request = new NextRequest("http://localhost/api/integrations/telegram", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-telegram-bot-api-secret-token": "wrong-secret",
      },
      body: JSON.stringify({ update_id: 1 }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(processSpy).not.toHaveBeenCalled();
  });
});
