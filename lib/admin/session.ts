import { createHmac, timingSafeEqual } from "node:crypto";

// The admin session is a signed, expiring token in an httpOnly cookie:
// "<expiry ms>.<HMAC>". The signing key mixes ADMIN_SESSION_SECRET with the
// admin password, so changing either one signs everyone out. No Next.js
// imports here, so it can be unit tested.

export const SESSION_COOKIE = "admin_session";
export const SESSION_DAYS = 14;

function signature(expires: string, secret: string, password: string): string {
  return createHmac("sha256", `${secret}\u0000${password}`).update(`admin:${expires}`).digest("base64url");
}

export function createSessionToken(secret: string, password: string, now = Date.now()): { token: string; expires: Date } {
  const expires = new Date(now + SESSION_DAYS * 86_400_000);
  const stamp = String(expires.getTime());
  return { token: `${stamp}.${signature(stamp, secret, password)}`, expires };
}

export function verifySessionToken(token: string | undefined, secret: string, password: string, now = Date.now()): boolean {
  if (!token || !secret || !password) return false;
  const [stamp, sig, extra] = token.split(".");
  if (!stamp || !sig || extra !== undefined || !/^\d+$/.test(stamp)) return false;
  if (Number(stamp) <= now) return false;
  const expected = Buffer.from(signature(stamp, secret, password));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** Constant-time password check (hashing first evens out the lengths). */
export function passwordMatches(given: string, expected: string): boolean {
  if (!expected) return false;
  const a = createHmac("sha256", "admin-password").update(given).digest();
  const b = createHmac("sha256", "admin-password").update(expected).digest();
  return timingSafeEqual(a, b);
}
