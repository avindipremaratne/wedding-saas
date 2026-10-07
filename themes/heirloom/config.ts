import type { ThemeColors } from "@/lib/types";

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

const WIX_MEDIA = "https://static.wixstatic.com/media";
const WIX_VIDEO = "https://video.wixstatic.com/video";

// Design assets that belong to the theme rather than to a couple.
export const heirloomAssets = {
  pageBackground: `${WIX_MEDIA}/b5e630_962afd5611af40a0b1d4e6917aaabb81~mv2.png`,
  venueBackground: `${WIX_MEDIA}/b5e630_93f75fc0cd3443e88029e35fbc854b5f~mv2.jpg`,
  footerFloral: `${WIX_MEDIA}/b5e630_bf488c1f65c446f1aa985e7b5c076cf5~mv2.jpg`,
  flourish: `${WIX_MEDIA}/b5e630_e17db2bd3b5947b5b7436d2000a22d10~mv2.png`,
  ladiesIcon: `${WIX_MEDIA}/b5e630_5f87fbae0e4344b3873a6f7494e10bb1~mv2.png`,
  gentlemenIcon: `${WIX_MEDIA}/b5e630_8fb083ad32d944d5b67d7d2135f0b248~mv2.png`,
  envelope: {
    desktop: `${WIX_VIDEO}/b5e630_060e92b416ae4ef8bdcc302ad3e7661e/1080p/mp4/file.mp4`,
    mobile: `${WIX_VIDEO}/b5e630_180ed74c68224f17a504be8691c2ed82/1080p/mp4/file.mp4`,
  },
};

export function themeStyleVars(override?: Partial<ThemeColors>): Record<string, string> {
  const colors = { ...heirloomColors, ...override };
  return Object.fromEntries(
    Object.entries(colors).map(([name, value]) => [`--color-${name}`, value]),
  );
}
