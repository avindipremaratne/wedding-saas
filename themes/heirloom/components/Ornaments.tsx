// Decorative pieces repeated across the theme. Server Components: no JS.

const DIAMOND_SIZES = {
  sm: { line: "w-[30px]", diamond: 6 },
  md: { line: "w-[40px]", diamond: 8 },
  lg: { line: "w-[60px]", diamond: 10 },
} as const;

export function DiamondDivider({
  size = "md",
  className = "",
}: {
  size?: keyof typeof DIAMOND_SIZES;
  className?: string;
}) {
  const { line, diamond } = DIAMOND_SIZES[size];
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <div className={`h-px bg-gold ${line}`} />
      <svg width={diamond} height={diamond} viewBox="0 0 10 10" fill="none">
        <rect x="5" y="0.5" width="6.36" height="6.36" rx="0.5" transform="rotate(45 5 0.5)" className="fill-gold" />
      </svg>
      <div className={`h-px bg-gold ${line}`} />
    </div>
  );
}

export function GoldRule({ className = "w-16" }: { className?: string }) {
  return <div className={`mx-auto h-px bg-gold ${className}`} aria-hidden="true" />;
}

/** Large uppercase serif heading used for Venue, Attire and RSVP. */
export const displayHeading =
  "font-serif font-semibold uppercase leading-none tracking-[0.25em] text-[clamp(2.5rem,8vw,5rem)]";

/** Glassy card surface used for section panels. */
export const glassCard = "border border-gold/20 bg-white/55 backdrop-blur-[8px]";
