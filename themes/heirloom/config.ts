import type { ThemeColors } from "@/lib/types";
import assets from "./assets.json";

// Theme 1, the Amali & Ashen design. Colours become CSS variables on the
// site wrapper, so a couple's palette_override only has to replace the
// values it changes. Fonts are loaded once in app/layout.tsx.
export const heirloomColors: ThemeColors = {
  gold: "#C8A96A",
  navy: "#1F2A44",
  ivory: "#F5ECD7",
  linen: "#FAF6F0",
  silk: "#F7F3EE",
  ink: "#1C1C1C",
  charcoal: "#3A3A3A",
  porcelain: "#FCFAF7",
};

// Design assets that belong to the theme rather than to a couple. Each has
// its original Wix URL and a path in the Supabase Storage bucket (see
// assets.json). Once `npm run media:migrate` has copied them, setting
// NEXT_PUBLIC_MEDIA_URL serves them from Supabase instead of Wix.
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL?.replace(/\/+$/, "");

function asset(key: keyof typeof assets): string {
  const { source, path } = assets[key];
  return MEDIA_URL ? `${MEDIA_URL}/${path}` : source;
}

export const heirloomAssets = {
  pageBackground: asset("pageBackground"),
  venueBackground: asset("venueBackground"),
  footerFloral: asset("footerFloral"),
  flourish: asset("flourish"),
  ladiesIcon: asset("ladiesIcon"),
  gentlemenIcon: asset("gentlemenIcon"),
  envelope: {
    desktop: asset("envelopeDesktop"),
    mobile: asset("envelopeMobile"),
  },
};

export function themeStyleVars(override?: Partial<ThemeColors>): Record<string, string> {
  const colors = { ...heirloomColors, ...override };
  return Object.fromEntries(
    Object.entries(colors).map(([name, value]) => [`--color-${name}`, value]),
  );
}
