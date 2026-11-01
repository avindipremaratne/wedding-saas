import { describe, expect, it } from "vitest";
import { isoToZonedLocal, isValidTimeZone, zonedLocalToIso } from "@/lib/zoned";

describe("zonedLocalToIso / isoToZonedLocal", () => {
  it("converts a Halifax summer time to UTC and back", () => {
    expect(zonedLocalToIso("2026-08-27T15:00", "America/Halifax")).toBe("2026-08-27T18:00:00.000Z");
    expect(isoToZonedLocal("2026-08-27T18:00:00.000Z", "America/Halifax")).toBe("2026-08-27T15:00");
    expect(isoToZonedLocal("2026-08-27T15:00:00-03:00", "America/Halifax")).toBe("2026-08-27T15:00");
  });

  it("handles winter time, zones ahead of UTC and half-hour offsets", () => {
    expect(zonedLocalToIso("2026-01-10T15:00", "America/Halifax")).toBe("2026-01-10T19:00:00.000Z");
    expect(zonedLocalToIso("2026-12-05T10:30", "Asia/Colombo")).toBe("2026-12-05T05:00:00.000Z");
    expect(zonedLocalToIso("2026-06-01T00:15", "Europe/London")).toBe("2026-05-31T23:15:00.000Z");
  });

  it("handles a time on the day the clocks change", () => {
    // Clocks go forward at 2:00 AM on 8 March 2026 in Halifax.
    expect(zonedLocalToIso("2026-03-08T12:00", "America/Halifax")).toBe("2026-03-08T15:00:00.000Z");
    expect(zonedLocalToIso("2026-11-01T12:00", "America/Halifax")).toBe("2026-11-01T16:00:00.000Z");
  });

  it("rejects bad input", () => {
    expect(zonedLocalToIso("27/08/2026 3pm", "America/Halifax")).toBeNull();
    expect(zonedLocalToIso("2026-08-27T15:00", "Mars/Olympus")).toBeNull();
    expect(isoToZonedLocal("not a date", "UTC")).toBe("");
    expect(isValidTimeZone("America/Halifax")).toBe(true);
    expect(isValidTimeZone("")).toBe(false);
  });
});
