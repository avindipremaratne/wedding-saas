import { afterEach, describe, expect, it, vi } from "vitest";

async function load(env: { media?: string; supabase?: string }) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_MEDIA_URL", env.media ?? "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", env.supabase ?? "");
  return import("@/lib/media");
}

afterEach(() => vi.unstubAllEnvs());

const BUCKET = "https://abc.supabase.co/storage/v1/object/public/site-media";

describe("mediaUrl", () => {
  it("derives the bucket URL from the Supabase project URL", async () => {
    const { mediaUrl } = await load({ supabase: "https://abc.supabase.co/rest/v1/" });
    expect(mediaUrl("sites/amali-ashen/hero.jpeg")).toBe(`${BUCKET}/sites/amali-ashen/hero.jpeg`);
  });

  it("prefers NEXT_PUBLIC_MEDIA_URL when set", async () => {
    const { mediaUrl } = await load({ media: "https://cdn.example.com/media/", supabase: "https://abc.supabase.co" });
    expect(mediaUrl("/themes/heirloom/flourish.png")).toBe("https://cdn.example.com/media/themes/heirloom/flourish.png");
  });

  it("passes absolute URLs through unchanged", async () => {
    const { mediaUrl } = await load({ supabase: "https://abc.supabase.co" });
    expect(mediaUrl(`${BUCKET}/sites/a/hero.jpeg`)).toBe(`${BUCKET}/sites/a/hero.jpeg`);
  });

  it("returns an unresolved local path when Supabase is not configured", async () => {
    const { mediaUrl } = await load({});
    expect(mediaUrl("sites/a/hero.jpeg")).toBe("/site-media/sites/a/hero.jpeg");
  });
});

describe("bundled content", () => {
  it("never points at Wix", async () => {
    await load({ supabase: "https://abc.supabase.co" });
    const { heirloomReferenceSite: site } = await import("@/content/sites/heirloom-reference");
    const { heirloomAssets } = await import("@/themes/heirloom/config");
    const urls = [
      site.content.heroPhoto.src,
      ...site.content.galleryPhotos.map((p) => p.src),
      site.content.details.logoUrl,
      ...Object.values(heirloomAssets).flatMap((v) => (typeof v === "string" ? [v] : Object.values(v))),
    ];
    expect(urls.every((u) => u?.startsWith(`${BUCKET}/`))).toBe(true);
    expect(site.content.galleryPhotos.map((p) => p.src)).toEqual(
      [1, 2, 3, 4, 5].map((n) => `${BUCKET}/sites/amali-ashen/gallery-0${n}.jpg`),
    );
  });
});
