import type { ScheduleItem } from "@/lib/types";
import FadeIn from "./FadeIn";
import { DiamondDivider, displayHeading, glassCard } from "./Ornaments";

// Order of the day, from site_content.schedule. The Wix build kept this on a
// separate unlinked page; here it is a section that only renders when the
// couple has added items.
export default function Schedule({ items }: { items: ScheduleItem[] }) {
  if (items.length === 0) return null;
  return (
    <section id="schedule" className="relative scroll-mt-24 border-t border-gold/20 py-24">
      <div className="container mx-auto max-w-3xl px-4">
        <FadeIn className="mb-12 text-center">
          <p className="font-script text-[2.5rem] leading-[1.2] text-gold">The Day</p>
          <h2 className={`${displayHeading} text-ink`}>Schedule</h2>
          <DiamondDivider className="my-4" />
        </FadeIn>

        <div className="space-y-6">
          {items.map((item, index) => (
            <FadeIn key={`${item.startTime}-${item.name}`} delay={index * 0.1}>
              <div className={`flex flex-col gap-4 rounded-2xl p-6 md:flex-row md:gap-8 md:p-8 ${glassCard}`}>
                <div className="shrink-0 md:w-36">
                  <p className="font-serif text-2xl font-semibold text-navy">{item.startTime}</p>
                  {item.endTime && <p className="font-sans text-xs uppercase tracking-[0.15em] text-charcoal">to {item.endTime}</p>}
                </div>
                <div>
                  <h3 className="mb-2 font-serif text-xl font-semibold uppercase tracking-[0.15em] text-ink">{item.name}</h3>
                  {item.description && (
                    <p className="mb-2 font-sans text-[0.88rem] font-light leading-[1.8] text-charcoal">{item.description}</p>
                  )}
                  {item.location && (
                    <p className="font-sans text-xs uppercase tracking-[0.12em] text-gold">{item.location}</p>
                  )}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
