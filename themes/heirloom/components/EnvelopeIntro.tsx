"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "../heirloom.module.css";

type Variant = "desktop" | "mobile";

const MOBILE_QUERY = "(max-width: 767px)";
const STALL_MS = 10_000;
// Pause on the video's last frame before the page fades in.
const HOLD_MS = 2_000;

function subscribe(onChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// null on the server: the video is only chosen once we know the viewport.
function useVariant(): Variant | null {
  return useSyncExternalStore<Variant | null>(
    subscribe,
    () => (window.matchMedia(MOBILE_QUERY).matches ? "mobile" : "desktop"),
    () => null,
  );
}

// Full-screen envelope video the guest taps to open. Ported from the Wix
// build with its iOS Safari fixes intact:
//  1. play() then pause() on mount, to force the video to load and decode
//     its first frame even when Safari ignores preload (Low Data Mode).
//  2. Seek to 0.01s on loadedmetadata so a poster frame is painted.
//  3. Lock body scroll while showing, so a tiny drag on the seal can't
//     collapse Safari's toolbars and resize the overlay.
// Only one <video> is rendered (chosen by viewport width) instead of three
// hidden ones, so phones don't download the desktop file too.
export default function EnvelopeIntro({
  videos,
  onComplete,
}: {
  videos: { desktop: string; mobile: string };
  onComplete: () => void;
}) {
  const variant = useVariant();
  const [playing, setPlaying] = useState(false);
  const [closing, setClosing] = useState(false);
  // Frozen at the tap, so rotating a phone mid-animation can't swap the file.
  const [lockedVariant, setLockedVariant] = useState<Variant | null>(null);
  const shownVariant = lockedVariant ?? variant;
  const videoRef = useRef<HTMLVideoElement>(null);
  const playingRef = useRef(false);
  const closedRef = useRef(false);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fix 1: force fetch/decode. Falls back to the loadedmetadata seek if
  // autoplay is blocked outright.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !variant || playingRef.current) return;
    video.load();
    video
      .play()
      .then(() => {
        video.pause();
        video.currentTime = 0.01;
      })
      .catch(() => {});
  }, [variant]);

  // Fix 3: scroll lock.
  useEffect(() => {
    const { overflow, touchAction } = document.body.style;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.touchAction = touchAction;
    };
  }, []);

  useEffect(() => () => {
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
  }, []);

  // holdMs keeps the last frame on screen first; failures close at once.
  const close = (holdMs = 0) => {
    if (closedRef.current) return;
    closedRef.current = true;
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    setTimeout(() => {
      setClosing(true);
      setTimeout(onComplete, 400);
    }, holdMs);
  };

  const handleTap = () => {
    if (playing) return;
    setPlaying(true);
    setLockedVariant(variant);
    playingRef.current = true;
    // Never trap the guest behind the envelope: open the page if playback
    // fails, or if the video still hasn't started after STALL_MS.
    watchdogRef.current = setTimeout(close, STALL_MS);
    videoRef.current?.play().catch(() => close());
  };

  return (
    <div
      className={`${styles.envelope} envelope-intro`}
      data-closing={closing}
      onClick={handleTap}
      role="button"
      tabIndex={0}
      aria-label="Open the invitation"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleTap();
        }
      }}
      style={{ cursor: playing ? "default" : "pointer" }}
    >
      {shownVariant && (
        <video
          ref={videoRef}
          src={videos[shownVariant]}
          playsInline
          preload="auto"
          onLoadedMetadata={(e) => {
            // Fix 2: paint a poster frame.
            e.currentTarget.currentTime = 0.01;
          }}
          onPlaying={() => {
            if (playingRef.current && watchdogRef.current) clearTimeout(watchdogRef.current);
          }}
          onEnded={() => close(HOLD_MS)}
          onError={() => playingRef.current && close()}
          className={styles.envelopeVideo}
        />
      )}

      {!playing && (
        <div className={styles.tapHint}>
          <div className={styles.tapRing} />
          <p className="m-0 whitespace-nowrap rounded-full bg-silk/70 px-4 py-1.5 font-sans text-[0.72rem] font-medium uppercase tracking-[0.3em] text-ink">
            Tap to Open
          </p>
        </div>
      )}
    </div>
  );
}
