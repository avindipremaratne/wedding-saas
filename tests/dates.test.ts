import { describe, expect, it } from "vitest";
import { formatLongDate, formatNumericDate, formatPlainDate, googleCalendarUrl, timeUntil } from "@/lib/dates";

describe("date formatting", () => {
  const iso = "2026-08-27T15:00:00-03:00";

  it("formats in the wedding's time zone, not the viewer's", () => {
    expect(formatNumericDate(iso, "America/Halifax", " • ")).toBe("27 • 08 • 2026");
    // 23:30 in Halifax is already the next day in UTC.
    expect(formatNumericDate("2026-08-27T23:30:00-03:00", "America/Halifax", "/")).toBe("27/08/2026");
    expect(formatNumericDate("2026-08-27T23:30:00-03:00", "UTC", "/")).toBe("28/08/2026");
  });

  it("formats long dates", () => {
    expect(formatLongDate(iso, "America/Halifax")).toBe("August 27, 2026");
  });

  it("formats plain dates as written", () => {
    expect(formatPlainDate("2026-08-20", " . ")).toBe("20 . 08 . 2026");
  });
});

describe("timeUntil", () => {
  it("splits the remaining time", () => {
    const now = 0;
    const target = ((2 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000;
    expect(timeUntil(target, now)).toEqual({ days: 2, hours: 3, minutes: 4, seconds: 5 });
  });

  it("stops at zero once the date has passed", () => {
    expect(timeUntil(1000, 5000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});

describe("googleCalendarUrl", () => {
  it("converts local times with offsets to UTC stamps", () => {
    const url = new URL(
      googleCalendarUrl({
        title: "Amali and Ashen Wedding",
        details: "Join us",
        location: "St. Thomas Aquinas Church",
        start: "2026-08-27T15:00:00-03:00",
        end: "2026-08-27T20:00:00-03:00",
      }),
    );
    expect(url.origin + url.pathname).toBe("https://calendar.google.com/calendar/render");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("text")).toBe("Amali and Ashen Wedding");
    expect(url.searchParams.get("dates")).toBe("20260827T180000Z/20260827T230000Z");
    expect(url.searchParams.get("location")).toBe("St. Thomas Aquinas Church");
  });
});
