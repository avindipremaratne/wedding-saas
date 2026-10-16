import Image from "next/image";
import type { HeirloomDetails } from "@/lib/types";
import FadeIn from "./FadeIn";
import { DiamondDivider, displayHeading, glassCard } from "./Ornaments";

type AttireData = NonNullable<HeirloomDetails["attire"]>;

export default function Attire({
  attire,
  icons,
}: {
  attire: AttireData;
  icons: { ladies: string; gentlemen: string };
}) {
  const columns = [
    { title: "Ladies", text: attire.ladies, icon: icons.ladies },
    { title: "Gentlemen", text: attire.gentlemen, icon: icons.gentlemen },
  ];
  const body = "font-sans text-[0.88rem] font-light leading-[1.8] text-charcoal";

  return (
    <section id="attire" className="relative scroll-mt-24 border-t border-gold/20 py-24">
      <div className="container mx-auto max-w-3xl px-4">
        <FadeIn className="mb-10 text-center">
          <h2 className={`${displayHeading} mb-1 text-gold`}>Attire</h2>
          <DiamondDivider className="my-3" />
          <p className="mb-6 font-script text-[clamp(2rem,5vw,3rem)] leading-[1.3] text-ink">{attire.title}</p>
          <p className={`${body} mx-auto max-w-[520px] leading-[1.9] tracking-[0.04em]`}>{attire.intro}</p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className={`mb-10 grid grid-cols-2 overflow-hidden rounded-xl ${glassCard} bg-white/45`}>
            {columns.map((column, i) => (
              <div
                key={column.title}
                className={`flex flex-col items-center p-6 text-center md:p-8 ${i === 0 ? "border-r border-gold/20" : ""}`}
              >
                <Image src={column.icon} alt="" width={40} height={40} className="mb-4" />
                <h3 className="mb-3 font-serif text-[1.1rem] font-semibold uppercase tracking-[0.2em] text-ink">
                  {column.title}
                </h3>
                <p className={body}>{column.text}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        {attire.palette.length > 0 && (
          <FadeIn delay={0.4}>
            <div className={`rounded-xl p-6 text-center md:p-8 ${glassCard} bg-white/45`}>
              <DiamondDivider size="sm" className="mb-5" />
              <h3 className="mb-6 font-serif text-[0.95rem] font-semibold uppercase tracking-[0.25em] text-charcoal">
                Suggested Color Palette
              </h3>
              <ul className="mb-6 grid grid-cols-4 gap-3 md:grid-cols-8 md:gap-4">
                {attire.palette.map((swatch) => (
                  <li key={swatch.name} className="flex flex-col items-center gap-2">
                    <span
                      className="h-10 w-10 shrink-0 rounded-full border border-black/8"
                      style={{ backgroundColor: swatch.color }}
                      aria-hidden="true"
                    />
                    <span className="text-center font-serif text-[0.7rem] font-medium uppercase leading-[1.3] tracking-[0.08em] text-charcoal">
                      {swatch.name}
                    </span>
                  </li>
                ))}
              </ul>
              {attire.note && <p className={`${body} italic tracking-[0.03em]`}>{attire.note}</p>}
              <DiamondDivider size="sm" className="mt-5" />
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
