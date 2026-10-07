import { formatNumericDate } from "@/lib/dates";
import type { HeirloomDetails } from "@/lib/types";

export default function Footer({
  coupleNames,
  weddingDate,
  timeZone,
  tagline,
  credit,
  floralUrl,
}: {
  coupleNames: [string, string];
  weddingDate: string;
  timeZone: string;
  tagline: string;
  credit?: HeirloomDetails["credit"];
  floralUrl: string;
}) {
  return (
    <footer className="relative overflow-hidden border-t border-gold/20 py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-bottom bg-no-repeat"
        style={{ backgroundImage: `url('${floralUrl}')` }}
        aria-hidden="true"
      />
      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="mb-4 h-px w-16 bg-gold" aria-hidden="true" />
          <span className="font-script text-4xl text-ink md:text-5xl">
            {coupleNames[0]} &amp; {coupleNames[1]}
          </span>
          <p className="font-sans text-sm uppercase tracking-widest text-charcoal">{tagline}</p>
          <p className="font-sans text-base font-medium tracking-widest text-gold">
            {formatNumericDate(weddingDate, timeZone, " • ")}
          </p>
          <div className="mt-4 h-px w-16 bg-gold" aria-hidden="true" />
          {credit && (
            <p className="font-sans text-[0.65rem] font-light leading-[1.8] tracking-[0.08em] text-charcoal/50">
              Website by <span className="font-normal">{credit.name}</span>
              {credit.email && (
                <>
                  {" · "}
                  <a href={`mailto:${credit.email}`}>{credit.email}</a>
                </>
              )}
              {credit.phone && (
                <>
                  {" · "}
                  <a href={`tel:${credit.phone}`}>{formatPhone(credit.phone)}</a>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}

/** "+15197313490" → "+1 519 731 3490" for North American numbers; others unchanged. */
function formatPhone(phone: string): string {
  const match = phone.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  return match ? `+1 ${match[1]} ${match[2]} ${match[3]}` : phone;
}
