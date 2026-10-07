"use client";

import { useEffect, useState } from "react";
import { timeUntil, type TimeLeft } from "@/lib/dates";
import styles from "../heirloom.module.css";

const LABELS: [keyof TimeLeft, string][] = [
  ["days", "Days"],
  ["hours", "Hours"],
  ["minutes", "Minutes"],
  ["seconds", "Seconds"],
];

// Client Component: it ticks every second. It renders zeros on the server
// and fills in after hydration, so server and browser HTML always match.
export default function Countdown({ target }: { target: string }) {
  const [left, setLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const targetMs = new Date(target).getTime();
    const update = () => setLeft(timeUntil(targetMs, Date.now()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <div className="flex items-center justify-center gap-2 md:gap-12" role="timer" aria-live="off">
      {LABELS.map(([key, label]) => {
        const value = left?.[key] ?? 0;
        return (
          <div key={key} className={`flex w-[72px] flex-col items-center md:w-28 ${styles.countdownCell}`}>
            <span key={value} className={`font-sans text-5xl tracking-tighter text-navy md:text-7xl ${styles.tick}`}>
              {String(value).padStart(2, "0")}
            </span>
            <div className="mx-auto my-1.5 h-px w-5 bg-gold" aria-hidden="true" />
            <span className="block font-sans text-[0.58rem] font-bold uppercase tracking-[0.3em] text-gold">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
