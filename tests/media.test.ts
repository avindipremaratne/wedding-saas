import { afterEach, describe, expect, it, vi } from "vitest";

async function load(mediaUrl: string | undefined) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_MEDIA_URL", mediaUrl ?? "");
  return import("@/lib/media");
}

afterEach(() => vi.unstubAllEnvs());

describe("mediaUrl", () => {
  it("serves from the bucket when NEXT_PUBLIC_MEDIA_URL is set", async () => {
    const { mediaUrl } = await load("https://abc.supabase.co/storage/v1/object/public/site-media/");
    expect(mediaUrl("sites/amali-ashen/hero.jpeg", "https://static.wixstatic.com/media/x.jpg")).toBe(
      "https://abc.supabase.co/storage/v1/object/public/site-media/sites/amali-ashen/hero.jpeg",
    );
  });

  it("falls back to the original URL when it is not set", async () => {
    const { mediaUrl } = await load(undefined);
    expect(mediaUrl("sites/a/hero.jpeg", "https://static.wixstatic.com/media/x.jpg")).toBe(
      "https://static.wixstatic.com/media/x.jpg",
    );
  });
});

describe("reference site photos", () => {
  it("match the paths media:migrate uploads to", async () => {
    await load("https://abc.supabase.co/storage/v1/object/public/site-media");
    const { heirloomReferenceSite: site } = await import("@/content/sites/heirloom-reference");
    const base = "https://abc.supabase.co/storage/v1/object/public/site-media/sites/amali-ashen";
    expect(site.content.heroPhoto.src).toBe(`${base}/hero.jpeg`);
    expect(site.content.galleryPhotos.map((p) => p.src)).toEqual(
      [1, 2, 3, 4, 5].map((n) => `${base}/gallery-0${n}.jpg`),
    );
    expect(site.content.details.logoUrl).toBe(`${base}/logo.png`);
  });
});
