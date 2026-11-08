import { describe, expect, it } from "vitest";
import { moveDuration, nextStop, parseAutoscroll, travelled } from "@/lib/autoscroll";

describe("parseAutoscroll", () => {
  it("is off without the parameter or when switched off", () => {
    expect(parseAutoscroll("")).toBeNull();
    expect(parseAutoscroll("?rsvp=1")).toBeNull();
    expect(parseAutoscroll("?autoscroll=off")).toBeNull();
    expect(parseAutoscroll("?autoscroll=0")).toBeNull();
  });

  it("reads presets and pixel speeds", () => {
    expect(parseAutoscroll("?autoscroll")?.speed).toBe(200);
    expect(parseAutoscroll("?autoscroll=slow")?.speed).toBe(140);
    expect(parseAutoscroll("?autoscroll=FAST")?.speed).toBe(280);
    expect(parseAutoscroll("?autoscroll=250")?.speed).toBe(250);
  });

  it("clamps silly speeds and ignores junk", () => {
    expect(parseAutoscroll("?autoscroll=5")?.speed).toBe(40);
    expect(parseAutoscroll("?autoscroll=99999")?.speed).toBe(1000);
    expect(parseAutoscroll("?autoscroll=zoom")?.speed).toBe(200);
  });
});

describe("travelled", () => {
  const speed = 100;
  const ramp = 1;

  it("starts and ends exactly at the stops", () => {
    expect(travelled(0, 1000, speed, ramp)).toBe(0);
    expect(travelled(moveDuration(1000, speed, ramp), 1000, speed, ramp)).toBe(1000);
    expect(travelled(999, 1000, speed, ramp)).toBe(1000);
  });

  it("cruises at a steady speed between the ramps", () => {
    const a = travelled(3, 1000, speed, ramp);
    const b = travelled(4, 1000, speed, ramp);
    const c = travelled(5, 1000, speed, ramp);
    expect(b - a).toBeCloseTo(100);
    expect(c - b).toBeCloseTo(100);
  });

  it("never moves backwards and has no jumps", () => {
    for (const distance of [30, 100, 2500]) {
      const total = moveDuration(distance, speed, ramp);
      let previous = 0;
      for (let t = 0; t <= total + 0.02; t += 1 / 60) {
        const now = travelled(t, distance, speed, ramp);
        expect(now).toBeGreaterThanOrEqual(previous - 1e-9);
        expect(now - previous).toBeLessThanOrEqual(speed / 60 + 1e-6);
        previous = now;
      }
      expect(previous).toBeCloseTo(distance);
    }
  });
});

describe("nextStop", () => {
  it("skips stops that are too close and finishes at the bottom", () => {
    const stops = [500, 560, 1200];
    expect(nextStop(stops, 0, 3000)).toBe(500);
    expect(nextStop(stops, 500, 3000)).toBe(1200);
    expect(nextStop(stops, 1200, 3000)).toBe(3000);
    expect(nextStop(stops, 3000, 3000)).toBeNull();
  });

  it("clamps stops past the bottom of the page", () => {
    expect(nextStop([5000], 0, 3000)).toBe(3000);
  });
});
