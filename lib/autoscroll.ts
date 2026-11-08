// Pure helpers for the ?autoscroll demo mode (see
// themes/heirloom/components/AutoScroll.tsx). Kept free of the DOM so they
// can be unit tested.

export type AutoscrollOptions = {
  /** Cruising speed in CSS pixels per second. */
  speed: number;
  /** Seconds spent speeding up from a stop, and slowing down into one. */
  ramp: number;
  /** Seconds to rest at each section before moving on. */
  pause: number;
  /** Seconds to wait on the hero after the envelope closes. */
  startDelay: number;
};

const PRESETS: Record<string, number> = { slow: 140, normal: 200, fast: 280 };
const MIN_SPEED = 40;
const MAX_SPEED = 1000;

/**
 * Reads the autoscroll setting from a URL query string. Returns null when
 * the mode is off. Accepts `?autoscroll`, `?autoscroll=slow|normal|fast`
 * or a speed in pixels per second, e.g. `?autoscroll=250`.
 */
export function parseAutoscroll(search: string): AutoscrollOptions | null {
  const params = new URLSearchParams(search);
  if (!params.has("autoscroll")) return null;
  const raw = (params.get("autoscroll") ?? "").trim().toLowerCase();
  if (raw === "0" || raw === "off" || raw === "false") return null;

  let speed = PRESETS.normal;
  if (raw in PRESETS) speed = PRESETS[raw];
  else if (raw !== "" && Number.isFinite(Number(raw))) {
    speed = Math.min(MAX_SPEED, Math.max(MIN_SPEED, Number(raw)));
  }
  return { speed, ramp: 0.8, pause: 1.8, startDelay: 2.5 };
}

/**
 * How far (in pixels) a move of `distance` has travelled after `elapsed`
 * seconds, cruising at `speed` with an even speed-up and slow-down of
 * `ramp` seconds at each end. Short moves that never reach full speed
 * accelerate and brake at the same rate.
 */
export function travelled(elapsed: number, distance: number, speed: number, ramp: number): number {
  if (distance <= 0 || elapsed <= 0) return 0;
  const total = moveDuration(distance, speed, ramp);
  if (elapsed >= total) return distance;
  if (ramp <= 0) return speed * elapsed;

  const accel = speed / ramp;
  if (distance < speed * ramp) {
    // Never reaches cruising speed: accelerate to the midpoint, then brake.
    const half = total / 2;
    return elapsed < half ? 0.5 * accel * elapsed ** 2 : distance - 0.5 * accel * (total - elapsed) ** 2;
  }
  if (elapsed < ramp) return 0.5 * accel * elapsed ** 2;
  if (elapsed > total - ramp) return distance - 0.5 * accel * (total - elapsed) ** 2;
  return 0.5 * speed * ramp + speed * (elapsed - ramp);
}

/** Seconds a move of `distance` takes with the profile in `travelled`. */
export function moveDuration(distance: number, speed: number, ramp: number): number {
  if (distance <= 0) return 0;
  if (ramp <= 0) return distance / speed;
  if (distance < speed * ramp) return 2 * Math.sqrt((distance * ramp) / speed);
  return distance / speed + ramp;
}

/**
 * The next place to rest after `current`: the first stop at least
 * `minGap` pixels further down, or the bottom of the page. Stops past the
 * bottom are clamped to it. Returns null when already at the bottom.
 */
export function nextStop(stops: number[], current: number, maxScroll: number, minGap = 120): number | null {
  const candidates = [...stops.map((s) => Math.min(s, maxScroll)), maxScroll].sort((a, b) => a - b);
  for (const stop of candidates) {
    if (stop - current >= minGap) return stop;
  }
  return maxScroll - current > 1 ? maxScroll : null;
}
