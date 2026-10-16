// Date helpers shared by themes. Dates are stored as ISO strings with an
// offset, and always formatted in the wedding's own time zone so a guest in
// another country sees the couple's date, not a shifted one.

function parts(iso: string, timeZone: string) {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date(iso));
  const get = (type: string) => formatted.find((p) => p.type === type)?.value ?? "";
  return { day: get("day"), month: get("month"), year: get("year") };
}

/** "27 • 08 • 2026" style, with a custom separator. */
export function formatNumericDate(iso: string, timeZone: string, separator: string): string {
  const { day, month, year } = parts(iso, timeZone);
  return [day, month, year].join(separator);
}

/** "August 27, 2026" */
export function formatLongDate(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

/** A YYYY-MM-DD date has no time zone; format it as written. */
export function formatPlainDate(date: string, separator: string): string {
  const [year, month, day] = date.split("-");
  return [day, month, year].join(separator);
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Time remaining until `targetMs`, clamped at zero once the moment passes. */
export function timeUntil(targetMs: number, nowMs: number): TimeLeft {
  const distance = Math.max(0, targetMs - nowMs);
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance % 86_400_000) / 3_600_000),
    minutes: Math.floor((distance % 3_600_000) / 60_000),
    seconds: Math.floor((distance % 60_000) / 1000),
  };
}

/** Compact UTC timestamp Google Calendar expects, e.g. 20260827T180000Z. */
function toCalendarStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalendarUrl(event: {
  title: string;
  details: string;
  location?: string;
  start: string;
  end: string;
}): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.details,
    dates: `${toCalendarStamp(event.start)}/${toCalendarStamp(event.end)}`,
  });
  if (event.location) params.set("location", event.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
