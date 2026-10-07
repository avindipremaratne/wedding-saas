import { formatLongDate } from "@/lib/dates";
import type { Venue as VenueData } from "@/lib/types";
import FadeIn from "./FadeIn";
import { DiamondDivider, displayHeading } from "./Ornaments";

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  className: "stroke-gold",
  "aria-hidden": true,
};

export default function Venue({
  venue,
  weddingDate,
  timeZone,
  ceremonyTime,
  tagline,
  backgroundUrl,
}: {
  venue: VenueData;
  weddingDate: string;
  timeZone: string;
  ceremonyTime: string;
  tagline: string;
  backgroundUrl: string;
}) {
  const [month, rest] = formatLongDate(weddingDate, timeZone).split(/ (?=\d+,)/);
  const label = "font-sans text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-ink md:text-[0.62rem]";
  const value = "font-sans text-[0.68rem] leading-normal text-charcoal md:text-[0.75rem]";

  return (
    <section id="venue" className="relative flex min-h-screen scroll-mt-24 items-center overflow-hidden border-t border-gold/20 py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${backgroundUrl}')` }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-[rgba(15,15,25,0.55)]" aria-hidden="true" />

      <div className="container relative z-10 mx-auto w-full px-4">
        <FadeIn className="mb-8 text-center">
          <p className="font-script text-[2.5rem] leading-[1.2] text-gold">Join Us</p>
          <h2 className={`${displayHeading} text-white`}>The Venue</h2>
          <DiamondDivider className="my-4" />
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-white">{tagline}</p>
        </FadeIn>

        <FadeIn delay={0.2} className="mx-auto w-full max-w-sm px-2 md:max-w-xl md:px-0">
          <div className="w-full rounded-2xl border border-gold/25 bg-white/95 p-6 text-center shadow-[0_8px_48px_rgba(0,0,0,0.15)] md:p-10">
            <div className="mb-6 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/12">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="stroke-gold" aria-hidden="true">
                  <path d="M12 2v4M10 4h4" />
                  <path d="M5 10h14" />
                  <path d="M5 10v10h14V10" />
                  <path d="M9 20v-5h6v5" />
                  <path d="M5 10l7-4 7 4" />
                </svg>
              </div>
            </div>
            <p className="mb-3 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">Wedding Ceremony</p>
            <p className="mb-1 font-sans text-[0.95rem] font-bold uppercase tracking-[0.15em] text-ink">{venue.name}</p>
            <p className="mb-1 font-sans text-[0.78rem] uppercase tracking-[0.12em] text-charcoal">{venue.city}</p>
            <DiamondDivider size="sm" className="my-5" />
            {venue.description && (
              <p className="mb-8 whitespace-pre-line font-sans text-[0.88rem] font-light leading-[1.8] text-charcoal">
                {venue.description}
              </p>
            )}

            <div className="mb-8 grid grid-cols-3 gap-2 border-t border-gold/25 pt-6 md:gap-4">
              <div className="flex flex-col items-center gap-2">
                <svg {...iconProps}>
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <p className={label}>Date</p>
                <p className={value}>
                  {month}
                  <br />
                  {rest}
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 border-x border-gold/25">
                <svg {...iconProps}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
                <p className={label}>Time</p>
                <p className={`${value} whitespace-pre-line`}>{ceremonyTime.replace(" (", "\n(")}</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <svg {...iconProps}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                <p className={label}>Address</p>
                <p className={value}>
                  {venue.addressLines.map((line, i) => (
                    <span key={line}>
                      {i > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            <a
              href={venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-full bg-navy px-6 py-3.5 font-sans text-[0.72rem] font-medium uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-gold"
            >
              View Ceremony Location
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
