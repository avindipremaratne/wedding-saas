"use client";

import { useEffect, useRef, useState } from "react";
import EnvelopeIntro from "./EnvelopeIntro";
import MusicPlayer, { type MusicPlayerHandle } from "./MusicPlayer";

// Coordinates the two browser-only pieces that sit above the page:
// the envelope intro and the background music. When the envelope closes it
// adds body.intro-done (which starts the hero CSS animations) and unmutes
// the music.
export default function IntroController({
  envelopeVideos,
  musicVideoId,
}: {
  envelopeVideos?: { desktop: string; mobile: string };
  musicVideoId: string | null;
}) {
  const [showIntro, setShowIntro] = useState(Boolean(envelopeVideos));
  const musicRef = useRef<MusicPlayerHandle>(null);

  // No envelope for this site: start the hero animations straight away.
  useEffect(() => {
    if (!envelopeVideos) document.body.classList.add("intro-done");
    return () => document.body.classList.remove("intro-done");
  }, [envelopeVideos]);

  // The first tap anywhere (in practice, the envelope tap) is the user
  // gesture browsers require before audio. Use it to prime the player muted.
  useEffect(() => {
    if (!musicVideoId) return;
    const start = () => {
      musicRef.current?.startMuted();
      document.removeEventListener("click", start);
      document.removeEventListener("touchstart", start);
    };
    document.addEventListener("click", start, { once: true });
    document.addEventListener("touchstart", start, { once: true });
    return () => {
      document.removeEventListener("click", start);
      document.removeEventListener("touchstart", start);
    };
  }, [musicVideoId]);

  const handleIntroComplete = () => {
    setShowIntro(false);
    document.body.classList.add("intro-done");
    musicRef.current?.unmute();
  };

  return (
    <>
      {showIntro && envelopeVideos && (
        <EnvelopeIntro videos={envelopeVideos} onComplete={handleIntroComplete} />
      )}
      {musicVideoId && <MusicPlayer ref={musicRef} videoId={musicVideoId} />}
    </>
  );
}
