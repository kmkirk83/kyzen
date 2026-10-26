import {
  assertTelegramUpdateShape,
  isTelegramChatAllowed,
  parseAllowedTelegramChatIds,
} from "@/lib/telegram";

describe("telegram authorization", () => {
  it("fails closed when allowlist is missing or empty", () => {
    expect(parseAllowedTelegramChatIds(undefined).size).toBe(0);
    expect(parseAllowedTelegramChatIds("").size).toBe(0);
    expect(parseAllowedTelegramChatIds("   ").size).toBe(0);
    expect(isTelegramChatAllowed("123", parseAllowedTelegramChatIds(undefined))).toBe(false);
    expect(isTelegramChatAllowed("123", new Set())).toBe(false);
  });

  it("allows only listed chat ids", () => {
    const allowed = parseAllowedTelegramChatIds("111, 222");
    expect(isTelegramChatAllowed("111", allowed)).toBe(true);
    expect(isTelegramChatAllowed("222", allowed)).toBe(true);
    expect(isTelegramChatAllowed("333", allowed)).toBe(false);
  });

  it("rejects malformed updates", () => {
    expect(() => assertTelegramUpdateShape(null)).toThrow();
    expect(() => assertTelegramUpdateShape({})).toThrow();
    expect(
      assertTelegramUpdateShape({
        update_id: 1,
        message: { message_id: 1, chat: { id: 9, type: "private" }, text: "hi" },
      }).update_id,
    ).toBe(1);
  });
});
