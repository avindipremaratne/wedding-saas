import Image from "next/image";
import type { Photo } from "@/lib/types";
import styles from "../heirloom.module.css";

// Server-rendered markup; the reveal is pure CSS, gated by body.intro-done.
export default function Hero({
  photo,
  tagline,
  kicker,
  coupleNames,
}: {
  photo: Photo;
  tagline: string;
  kicker: string;
  coupleNames: [string, string];
}) {
  return (
    <section
      id="home"
      className="relative flex h-screen max-h-screen min-h-[700px] w-full scroll-mt-24 flex-col items-center justify-start overflow-hidden pt-16 md:pt-32"
    >
      <div className="absolute inset-0 z-0">
        <Image src={photo.src} alt={photo.alt} fill preload sizes="100vw" className="object-cover object-[50%_30%]" />
      </div>

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center px-4 pt-10 text-center md:pt-0">
        <p className={`mb-6 font-sans text-sm uppercase tracking-widest text-white/80 md:text-base md:tracking-[-0.01em] ${styles.wipe1}`}>
          {tagline}
        </p>
        <p className={`mb-2 font-sans text-lg font-semibold tracking-wide text-white/90 md:text-2xl md:tracking-[-0.011em] ${styles.wipe2}`}>
          {kicker}
        </p>
        <h1 className={`mb-4 font-script text-6xl font-normal leading-tight text-white md:text-7xl md:leading-none lg:text-[100px] ${styles.heroFadeUp}`}>
          {coupleNames[0]} &amp; {coupleNames[1]}
        </h1>
      </div>
    </section>
  );
}
