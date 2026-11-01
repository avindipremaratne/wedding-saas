import { describe, expect, it } from "vitest";
import { createSessionToken, passwordMatches, verifySessionToken } from "@/lib/admin/session";

describe("admin session tokens", () => {
  const now = Date.UTC(2026, 10, 1);

  it("accepts its own token until it expires", () => {
    const { token, expires } = createSessionToken("secret", "pw", now);
    expect(verifySessionToken(token, "secret", "pw", now + 1000)).toBe(true);
    expect(verifySessionToken(token, "secret", "pw", expires.getTime())).toBe(false);
  });

  it("rejects tampered tokens and tokens signed with another secret or password", () => {
    const { token } = createSessionToken("secret", "pw", now);
    const [stamp, sig] = token.split(".");
    expect(verifySessionToken(`${Number(stamp) + 1}.${sig}`, "secret", "pw", now)).toBe(false);
    expect(verifySessionToken(token, "other", "pw", now)).toBe(false);
    expect(verifySessionToken(token, "secret", "new-password", now)).toBe(false);
    expect(verifySessionToken(`${token}.x`, "secret", "pw", now)).toBe(false);
    expect(verifySessionToken(undefined, "secret", "pw", now)).toBe(false);
    expect(verifySessionToken(token, "", "", now)).toBe(false);
  });

  it("checks the password", () => {
    expect(passwordMatches("pw", "pw")).toBe(true);
    expect(passwordMatches("PW", "pw")).toBe(false);
    expect(passwordMatches("", "")).toBe(false);
  });
});
