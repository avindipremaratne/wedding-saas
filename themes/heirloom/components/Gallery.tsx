import Image from "next/image";
import type { Photo } from "@/lib/types";
import FadeIn from "./FadeIn";
import { GoldRule } from "./Ornaments";

// Fallback intrinsic size when a photo has no stored dimensions. The image
// is drawn at width 100% / height auto, so this only shapes the placeholder.
const DEFAULT_SIZE = { width: 1200, height: 1500 };

export default function Gallery({ photos, storyText }: { photos: Photo[]; storyText?: string }) {
  if (photos.length === 0) return null;
  const lastIndex = photos.length - 1;
  // An odd photo out spans both columns on mobile, matching the Wix layout.
  const spanLast = photos.length % 2 === 1;

  return (
    <section id="gallery" className="scroll-mt-24 border-t border-gold/20 py-24">
      <div className="container mx-auto px-4">
        <FadeIn className="mb-16 text-center">
          <h2 className="mb-4 font-script text-6xl text-ink md:text-8xl">Our Journey Together</h2>
          <GoldRule className="mb-6 mt-2 w-16" />
          {storyText && (
            <p className="font-sans text-[0.88rem] font-light leading-[1.8] tracking-[0.08em] text-charcoal">{storyText}</p>
          )}
        </FadeIn>

        <div className="relative mx-auto max-w-5xl">
          <div className="grid grid-cols-2 items-start gap-4 md:grid-cols-3">
            {photos.map((photo, index) => (
              <FadeIn
                key={photo.src}
                delay={index * 0.1}
                className={`group relative overflow-hidden rounded-lg ${spanLast && index === lastIndex ? "col-span-2" : ""}`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width ?? DEFAULT_SIZE.width}
                  height={photo.height ?? DEFAULT_SIZE.height}
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="block h-auto w-full rounded-lg transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 rounded-lg bg-black/0 transition-colors duration-300 group-hover:bg-black/20" aria-hidden="true" />
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
