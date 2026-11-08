"use client";

import { useEffect } from "react";
import { moveDuration, nextStop, travelled, type AutoscrollOptions } from "@/lib/autoscroll";

// Matches the sections' scroll-mt-24, so each rests just below the header.
const HEADER_OFFSET = 96;

// Demo mode for screen recordings: when the page is opened with
// ?autoscroll, it glides down at a steady speed once the envelope closes,
// rests briefly at each section and stops at the footer. Any touch, wheel
// or key press hands control back to the viewer.
export default function AutoScroll({ options, start }: { options: AutoscrollOptions; start: boolean }) {
  // Hides the floating music button for the whole recording.
  useEffect(() => {
    document.body.classList.add("autoscroll");
    return () => document.body.classList.remove("autoscroll");
  }, []);

  useEffect(() => {
    if (!start) return;
    let frame = 0;
    let stopped = false;
    let move: { from: number; to: number; startedAt: number; duration: number } | null = null;
    let restUntil = performance.now() + options.startDelay * 1000;

    const sectionStops = () =>
      Array.from(document.querySelectorAll<HTMLElement>("main section"))
        .filter((section) => section.id !== "home" && !section.parentElement?.closest("section"))
        .map((section) => section.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET);

    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

    const stop = () => {
      stopped = true;
      cancelAnimationFrame(frame);
      for (const type of ["wheel", "touchstart", "keydown", "mousedown"]) {
        window.removeEventListener(type, stop);
      }
    };

    const tick = (now: number) => {
      if (stopped) return;
      if (!move) {
        if (now < restUntil) {
          frame = requestAnimationFrame(tick);
          return;
        }
        // Positions are re-read before every move, in case photos loading
        // further down have changed the page height.
        const from = window.scrollY;
        const to = nextStop(sectionStops(), from, maxScroll());
        if (to === null) return stop();
        move = { from, to, startedAt: now, duration: moveDuration(to - from, options.speed, options.ramp) };
      }

      const elapsed = (now - move.startedAt) / 1000;
      const y = move.from + travelled(elapsed, move.to - move.from, options.speed, options.ramp);
      // "instant" overrides the page's CSS smooth scrolling, which would
      // otherwise animate every frame's small step.
      window.scrollTo({ top: y, behavior: "instant" });

      if (elapsed >= move.duration) {
        move = null;
        restUntil = now + options.pause * 1000;
      }
      frame = requestAnimationFrame(tick);
    };

    for (const type of ["wheel", "touchstart", "keydown", "mousedown"]) {
      window.addEventListener(type, stop, { passive: true });
    }
    frame = requestAnimationFrame(tick);
    return stop;
  }, [start, options]);

  return null;
}
