import { describe, expect, it } from "vitest";
import assets from "@/themes/heirloom/assets.json";
import { contentTypeFor, extensionOf, isWixUrl, mediaBaseUrl, planSite, planThemeAssets } from "@/scripts/media/plan.mjs";

const BASE = "https://abc.supabase.co/storage/v1/object/public/site-media";

describe("media plan helpers", () => {
  it("recognises Wix URLs only", () => {
    expect(isWixUrl("https://static.wixstatic.com/media/x~mv2.jpg")).toBe(true);
    expect(isWixUrl("https://video.wixstatic.com/video/x/1080p/mp4/file.mp4")).toBe(true);
    expect(isWixUrl(`${BASE}/sites/a/hero.jpg`)).toBe(false);
    expect(isWixUrl("https://evilwixstatic.com/x.jpg")).toBe(false);
    expect(isWixUrl(undefined)).toBe(false);
  });

  it("reads file extensions, ignoring Wix's ~mv2 suffix", () => {
    expect(extensionOf("https://static.wixstatic.com/media/b5e630_abc~mv2.jpeg")).toBe("jpeg");
    expect(extensionOf("https://static.wixstatic.com/media/b5e630_abc~mv2.PNG")).toBe("png");
    expect(extensionOf("https://video.wixstatic.com/video/id/1080p/mp4/file.mp4")).toBe("mp4");
  });

  it("builds the public bucket URL from any project URL form", () => {
    expect(mediaBaseUrl("https://abc.supabase.co/rest/v1/")).toBe(BASE);
  });

  it("picks a content type from the header, falling back to the extension", () => {
    expect(contentTypeFor("a.jpg", "image/jpeg; charset=binary")).toBe("image/jpeg");
    expect(contentTypeFor("a.mp4", "application/octet-stream")).toBe("video/mp4");
    expect(contentTypeFor("a.png", null)).toBe("image/png");
  });

  it("lists every theme asset with a unique bucket path", () => {
    const uploads = planThemeAssets(assets);
    expect(uploads).toHaveLength(Object.keys(assets).length);
    expect(new Set(uploads.map((u: { path: string }) => u.path)).size).toBe(uploads.length);
    expect(uploads.every((u: { source: string }) => isWixUrl(u.source))).toBe(true);
  });
});

describe("planSite", () => {
  const row = {
    slug: "amali-ashen",
    hero_photo_url: "https://static.wixstatic.com/media/hero~mv2.jpeg",
    gallery_photo_urls: [
      "https://static.wixstatic.com/media/one~mv2.jpg",
      "https://static.wixstatic.com/media/two~mv2.png",
    ],
    theme_data: { tagline: "Hi", logoUrl: "https://static.wixstatic.com/media/logo~mv2.png" },
  };

  it("maps each Wix file to a tidy bucket path and rewrites the row", () => {
    const { uploads, update } = planSite(row, BASE);
    expect(uploads.map((u: { path: string }) => u.path)).toEqual([
      "sites/amali-ashen/hero.jpeg",
      "sites/amali-ashen/gallery-01.jpg",
      "sites/amali-ashen/gallery-02.png",
      "sites/amali-ashen/logo.png",
    ]);
    expect(update).toEqual({
      hero_photo_url: `${BASE}/sites/amali-ashen/hero.jpeg`,
      gallery_photo_urls: [`${BASE}/sites/amali-ashen/gallery-01.jpg`, `${BASE}/sites/amali-ashen/gallery-02.png`],
      theme_data: { tagline: "Hi", logoUrl: `${BASE}/sites/amali-ashen/logo.png` },
    });
  });

  it("keeps the gallery order", () => {
    const { update } = planSite(row, BASE);
    expect(update!.gallery_photo_urls[0]).toContain("gallery-01");
  });

  it("is a no-op once everything is migrated", () => {
    const { update } = planSite(row, BASE);
    const again = planSite({ ...row, ...update }, BASE);
    expect(again).toEqual({ uploads: [], update: null });
  });

  it("only moves the files still on Wix", () => {
    const partial = { ...row, hero_photo_url: `${BASE}/sites/amali-ashen/hero.jpeg` };
    const { uploads, update } = planSite(partial, BASE);
    expect(uploads).toHaveLength(3);
    expect(update!.hero_photo_url).toBe(`${BASE}/sites/amali-ashen/hero.jpeg`);
  });
});
