import type { ComponentType } from "react";
import type { Site, ThemeId } from "@/lib/types";
import HeirloomSite from "./heirloom/HeirloomSite";

// Registry of available designs. The `themes` table's component_bundle_ref
// points at a key here; a new theme is a new folder plus one line below.
export const themes: Record<ThemeId, { name: string; Component: ComponentType<{ site: Site }> }> = {
  heirloom: { name: "Heirloom", Component: HeirloomSite },
};

export function getTheme(id: ThemeId) {
  return themes[id] ?? themes.heirloom;
}
