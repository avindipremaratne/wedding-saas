// Converting between a wall-clock time in the wedding's time zone (what the
// admin form shows, e.g. "2026-08-27T15:00") and an exact instant (what the
// database stores). Kept free of Next.js imports so it can be unit tested.

const LOCAL_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

function wallClock(ms: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(ms));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute"), second: get("second") };
}

/** How far the zone's clock is ahead of UTC at the instant `ms`, in ms. */
function offsetAt(ms: number, timeZone: string): number {
  const c = wallClock(ms, timeZone);
  return Date.UTC(c.year, c.month - 1, c.day, c.hour, c.minute, c.second) - Math.floor(ms / 1000) * 1000;
}

/** "2026-08-27T15:00" in America/Halifax → "2026-08-27T18:00:00.000Z". Null if invalid. */
export function zonedLocalToIso(local: string, timeZone: string): string | null {
  const match = LOCAL_PATTERN.exec(local.trim());
  if (!match || !isValidTimeZone(timeZone)) return null;
  const [, y, mo, d, h, mi] = match.map(Number);
  const asUtc = Date.UTC(y, mo - 1, d, h, mi);
  // The offset depends on the instant, which depends on the offset; two
  // passes settle it, including across daylight-saving changes.
  let ms = asUtc - offsetAt(asUtc, timeZone);
  ms = asUtc - offsetAt(ms, timeZone);
  const check = new Date(ms);
  return Number.isNaN(check.getTime()) ? null : check.toISOString();
}

/** The inverse: an instant shown as "YYYY-MM-DDTHH:mm" in the zone. */
export function isoToZonedLocal(iso: string, timeZone: string): string {
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms) || !isValidTimeZone(timeZone)) return "";
  const c = wallClock(ms, timeZone);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${c.year}-${pad(c.month)}-${pad(c.day)}T${pad(c.hour)}:${pad(c.minute)}`;
}
