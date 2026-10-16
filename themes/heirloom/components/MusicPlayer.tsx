"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";

// Minimal typing for the parts of the YouTube IFrame API used here.
interface YTPlayer {
  mute(): void;
  unMute(): void;
  setVolume(volume: number): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  destroy(): void;
}
interface YTNamespace {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars: Record<string, number | string>;
      events: { onReady: (event: { target: YTPlayer }) => void };
    },
  ) => YTPlayer;
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface MusicPlayerHandle {
  /** Start playback muted. Safe to call from a user gesture before the player is ready. */
  startMuted: () => void;
  /** Restart from the top, audibly. Called when the envelope intro closes. */
  unmute: () => void;
}

const VOLUME = 50;

// Hidden YouTube player plus a floating mute button. Browsers only allow
// audio after a user gesture, so the first tap (the envelope tap) calls
// startMuted(), which plays-then-pauses muted to register that gesture with
// the player. unmute() later starts the song for real.
export default function MusicPlayer({ videoId, ref }: { videoId: string; ref: Ref<MusicPlayerHandle> }) {
  // Only set once YouTube reports the player ready. Before that its methods
  // don't exist yet, so every call below checks this first.
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingStartRef = useRef(false);
  const pendingUnmuteRef = useRef(false);
  const shouldBePlayingRef = useRef(false);
  const [isMuted, setIsMuted] = useState(true);

  const runUnmute = () => {
    const player = playerRef.current;
    if (!player) return;
    player.seekTo(0, true);
    player.unMute();
    player.setVolume(VOLUME);
    player.playVideo();
    setIsMuted(false);
    shouldBePlayingRef.current = true;
  };

  const primeMuted = () => {
    const player = playerRef.current;
    if (!player) return;
    player.mute();
    player.playVideo();
    player.pauseVideo();
  };

  // Mobile browsers pause iframe media when the tab loses focus (e.g. the
  // guest opens the venue in Maps) and don't resume it. Nudge it back when
  // the tab is visible again, unless the guest muted it themselves.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && shouldBePlayingRef.current) {
        playerRef.current?.playVideo();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let player: YTPlayer | null = null;
    // YouTube replaces the element it is given with an iframe, so give it a
    // fresh host inside a wrapper each time; removing the wrapper removes the
    // iframe too. In development React runs this effect twice, and the
    // cleanup below throws the first player away so only one ever exists.
    const wrapper = document.createElement("div");
    const host = document.createElement("div");
    wrapper.appendChild(host);
    containerRef.current?.appendChild(wrapper);

    function createPlayer() {
      if (cancelled || !window.YT?.Player) return;
      player = new window.YT.Player(host, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          loop: 1,
          playlist: videoId, // required by YouTube for loop=1 on a single video
          modestbranding: 1,
          rel: 0,
          fs: 0,
        },
        events: {
          onReady: (event) => {
            if (cancelled) {
              event.target.destroy();
              return;
            }
            playerRef.current = event.target;
            // Replay whichever cue fired before the player finished loading.
            if (pendingUnmuteRef.current) {
              pendingUnmuteRef.current = false;
              pendingStartRef.current = false;
              runUnmute();
            } else if (pendingStartRef.current) {
              pendingStartRef.current = false;
              primeMuted();
            }
          },
        },
      });
    }

    if (window.YT?.Player) {
      createPlayer();
    } else {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        createPlayer();
      };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
    }

    return () => {
      cancelled = true;
      playerRef.current = null;
      // destroy() only exists once the player is ready; until then, removing
      // the wrapper is enough, and onReady above will not adopt it.
      if (typeof player?.destroy === "function") player.destroy();
      wrapper.remove();
    };
  }, [videoId]);

  useImperativeHandle(ref, () => ({
    startMuted: () => {
      if (playerRef.current) primeMuted();
      else pendingStartRef.current = true;
    },
    unmute: () => {
      if (playerRef.current) runUnmute();
      else pendingUnmuteRef.current = true;
    },
  }));

  const toggleMute = () => {
    const player = playerRef.current;
    if (!player) return;
    if (isMuted) {
      player.unMute();
      player.setVolume(VOLUME);
      player.playVideo();
      setIsMuted(false);
      shouldBePlayingRef.current = true;
    } else {
      player.mute();
      setIsMuted(true);
      shouldBePlayingRef.current = false;
    }
  };

  return (
    <>
      {/* Kept in the DOM (not display:none) so browsers initialise it. */}
      <div aria-hidden="true" className="pointer-events-none fixed bottom-0 right-0 h-px w-px overflow-hidden opacity-0">
        <div ref={containerRef} />
      </div>

      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute background music" : "Mute background music"}
        className="fixed bottom-5 right-5 z-[9998] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-gold/60 bg-navy/85 text-lg leading-none tracking-normal text-gold"
      >
        {isMuted ? "🔇" : "🔊"}
      </button>
    </>
  );
}

