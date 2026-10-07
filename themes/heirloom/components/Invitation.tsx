import type { HeirloomDetails } from "@/lib/types";
import FadeIn from "./FadeIn";
import { DiamondDivider, GoldRule } from "./Ornaments";

export default function Invitation({
  verse,
  invitation,
  coupleNames,
}: {
  verse?: HeirloomDetails["verse"];
  invitation: HeirloomDetails["invitation"];
  coupleNames: [string, string];
}) {
  const nameClass = "font-script text-[clamp(2.5rem,6vw,4rem)] leading-[1.3] text-ink";
  return (
    <section className="relative py-24">
      <div className="container mx-auto flex max-w-3xl flex-col items-center px-4 text-center">
        <FadeIn className="w-full">
          <div className="mx-auto w-full rounded-2xl border border-gold/20 bg-white/55 px-8 py-12 shadow-[0_8px_48px_rgba(0,0,0,0.06)] backdrop-blur-[8px] md:px-16 md:py-16">
            <DiamondDivider size="lg" className="mb-12" />

            {verse && (
              <>
                <p className="mb-2 font-script text-[clamp(1.6rem,4vw,2.4rem)] leading-[1.6] text-ink">{verse.text}</p>
                <p className="mb-12 font-sans text-[0.78rem] font-medium uppercase tracking-[0.2em] text-gold">
                  {verse.reference}
                </p>
                <GoldRule className="mb-12 w-16" />
              </>
            )}

            <p className="mb-3 font-sans text-[0.95rem] font-light leading-loose tracking-[0.08em] text-charcoal">
              {invitation.lead}
            </p>
            <p className="mb-3 font-sans text-[0.95rem] leading-loose tracking-[0.1em] text-ink">
              {invitation.hosts.map((host, i) => (
                <span key={host}>
                  {i > 0 && (
                    <>
                      <br />&amp;<br />
                    </>
                  )}
                  {host}
                </span>
              ))}
            </p>
            <p className="mb-8 font-sans text-[0.85rem] font-light leading-loose tracking-[0.04em] text-charcoal">
              {invitation.inviteLine}
            </p>

            <p className={nameClass}>{coupleNames[0]}</p>
            <p className="my-1 font-script text-[clamp(1.5rem,4vw,2.5rem)] text-gold">&amp;</p>
            <p className={nameClass}>{coupleNames[1]}</p>

            <DiamondDivider size="lg" className="mt-12" />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
