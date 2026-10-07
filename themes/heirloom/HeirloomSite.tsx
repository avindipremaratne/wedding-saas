import { formatPlainDate, googleCalendarUrl } from "@/lib/dates";
import type { Site } from "@/lib/types";
import { youtubeVideoId } from "@/lib/youtube";
import Attire from "./components/Attire";
import Countdown from "./components/Countdown";
import FadeIn from "./components/FadeIn";
import Footer from "./components/Footer";
import Gallery from "./components/Gallery";
import Header, { type NavItem } from "./components/Header";
import Hero from "./components/Hero";
import IntroController from "./components/IntroController";
import Invitation from "./components/Invitation";
import { DiamondDivider, displayHeading, GoldRule } from "./components/Ornaments";
import RsvpForm from "./components/RsvpForm";
import Schedule from "./components/Schedule";
import Venue from "./components/Venue";
import { heirloomAssets, themeStyleVars } from "./config";
import styles from "./heirloom.module.css";

// Theme 1 entry point. A Server Component that turns a Site's data into the
// page; only the interactive pieces (intro, music, header, countdown, RSVP
// form, fade-ins) are Client Components.
export default function HeirloomSite({ site }: { site: Site }) {
  const { content } = site;
  const { details } = content;
  const names = content.coupleNames;

  const navItems: NavItem[] = [
    { label: "Home", id: "home" },
    { label: "Venue", id: "venue" },
    ...(details.attire ? [{ label: "Attire", id: "attire" }] : []),
    ...(content.schedule.length > 0 ? [{ label: "Schedule", id: "schedule" }] : []),
    ...(content.galleryPhotos.length > 0 ? [{ label: "Gallery", id: "gallery" }] : []),
    { label: "RSVP", id: "rsvp" },
  ];

  const weddingEnd =
    content.weddingEnd ?? new Date(new Date(content.weddingDate).getTime() + 5 * 3_600_000).toISOString();
  const calendarUrl = googleCalendarUrl({
    title: `${names[0]} and ${names[1]} Wedding`,
    details: "Join us to celebrate our wedding day!",
    location: [content.venue.name, ...content.venue.addressLines].join(" "),
    start: content.weddingDate,
    end: weddingEnd,
  });

  // Without JavaScript the envelope would never open and fade-ins would
  // never appear, so show the page as-is.
  const noScriptCss = `.envelope-intro{display:none}.${styles.fadeIn}{opacity:1;transform:none}.${styles.wipe1},.${styles.wipe2},.${styles.heroFadeUp}{animation-play-state:running}`;

  return (
    <div
      className="relative min-h-screen w-full max-w-[100vw] overflow-x-hidden font-sans text-stone-800 selection:bg-navy/20 selection:text-navy"
      style={themeStyleVars(content.paletteOverride)}
    >
      <noscript>
        <style>{noScriptCss}</style>
      </noscript>

      <IntroController envelopeVideos={heirloomAssets.envelope} musicVideoId={youtubeVideoId(content.musicTrackUrl)} />

      <div
        className={`pointer-events-none fixed inset-0 z-0 h-screen w-screen overflow-hidden ${styles.pageBackground}`}
        style={{ backgroundImage: `url('${heirloomAssets.pageBackground}')` }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <Header items={navItems} logoUrl={details.logoUrl} logoAlt={`${names[0]} & ${names[1]}`} />

        <main>
          <Hero photo={content.heroPhoto} tagline={details.tagline} kicker={details.heroKicker} coupleNames={names} />

          <Invitation verse={details.verse} invitation={details.invitation} coupleNames={names} />

          <section className="relative border-t border-gold/20 py-12 md:py-24">
            <div className="container mx-auto flex flex-col items-center px-4">
              <FadeIn className="mb-12 text-center">
                <h2 className="mb-8 font-script text-6xl text-ink md:text-8xl">Counting Down to Forever!</h2>
                <Countdown target={content.weddingDate} />
              </FadeIn>
              <GoldRule className="mb-12 w-24" />
            </div>
          </section>

          <Venue
            venue={content.venue}
            weddingDate={content.weddingDate}
            timeZone={content.timeZone}
            ceremonyTime={content.ceremonyTime}
            tagline={details.tagline}
            backgroundUrl={heirloomAssets.venueBackground}
          />

          {details.attire && (
            <Attire
              attire={details.attire}
              icons={{ ladies: heirloomAssets.ladiesIcon, gentlemen: heirloomAssets.gentlemenIcon }}
            />
          )}

          <Schedule items={content.schedule} />

          <Gallery photos={content.galleryPhotos} storyText={content.storyText} />

          <section id="rsvp" className="relative scroll-mt-24 border-t border-gold/20 py-12 md:py-16">
            <div className="container mx-auto max-w-2xl px-4">
              <FadeIn className="mb-10 text-center">
                <p className="font-script text-[2.5rem] leading-[1.2] text-gold">Kindly</p>
                <h2 className={`${displayHeading} text-ink`}>RSVP</h2>
                <DiamondDivider className="my-4" />
                <p className="font-sans text-[0.88rem] leading-[1.8] tracking-[0.04em] text-charcoal">{details.rsvpPrompt}</p>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="rounded-2xl border border-gold/25 bg-white/65 p-6 shadow-[0_8px_48px_rgba(0,0,0,0.08)] backdrop-blur-[8px] md:p-12">
                  {content.rsvpDeadline && (
                    <div className="mb-8 text-center">
                      <p className="mb-1 font-sans text-[0.88rem] uppercase tracking-[0.22em] text-charcoal">Kindly Reply By</p>
                      <p className="font-sans text-base font-light tracking-[0.22em] text-gold">
                        {formatPlainDate(content.rsvpDeadline, " . ")}
                      </p>
                    </div>
                  )}
                  <RsvpForm siteSlug={site.slug} calendarUrl={calendarUrl} flourishUrl={heirloomAssets.flourish} />
                </div>
              </FadeIn>
            </div>
          </section>
        </main>

        <Footer
          coupleNames={names}
          weddingDate={content.weddingDate}
          timeZone={content.timeZone}
          tagline={details.footerTagline}
          credit={details.credit}
          floralUrl={heirloomAssets.footerFloral}
        />
      </div>
    </div>
  );
}
