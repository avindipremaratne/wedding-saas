// Pure planning logic for scripts/migrate-media.mjs: works out which Wix
// files to copy, where they go in the bucket, and how each database row
// changes. No network access here, so it can be unit tested.

export const BUCKET = "site-media";

export function isWixUrl(url) {
  if (typeof url !== "string") return false;
  try {
    const host = new URL(url).hostname;
    return host === "wixstatic.com" || host.endsWith(".wixstatic.com");
  } catch {
    return false;
  }
}

/** "…/b5e630_abc~mv2.jpeg" → "jpeg", "…/1080p/mp4/file.mp4" → "mp4". */
export function extensionOf(url) {
  const last = new URL(url).pathname.split("/").pop() ?? "";
  const match = last.replace(/~mv2/g, "").match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "bin";
}

/** Public URL base for the bucket, e.g. https://<ref>.supabase.co/storage/v1/object/public/site-media */
export function mediaBaseUrl(projectUrl) {
  return `${new URL(projectUrl).origin}/storage/v1/object/public/${BUCKET}`;
}

/** Theme assets from themes/<theme>/assets.json that still need copying. */
export function planThemeAssets(assets) {
  return Object.values(assets).map(({ source, path }) => ({ source, path }));
}

/**
 * For one site_content row, list the uploads and the updated column values.
 * Only Wix URLs are touched, so running it again after a migration is a no-op.
 */
export function planSite(row, mediaBase) {
  const prefix = `sites/${row.slug}`;
  const uploads = [];
  const move = (url, name) => {
    if (!isWixUrl(url)) return url;
    const path = `${prefix}/${name}.${extensionOf(url)}`;
    uploads.push({ source: url, path });
    return `${mediaBase}/${path}`;
  };

  const hero = move(row.hero_photo_url, "hero");
  const gallery = (row.gallery_photo_urls ?? []).map((url, i) =>
    move(url, `gallery-${String(i + 1).padStart(2, "0")}`),
  );
  const themeData = { ...(row.theme_data ?? {}) };
  if (themeData.logoUrl) themeData.logoUrl = move(themeData.logoUrl, "logo");

  if (uploads.length === 0) return { uploads, update: null };
  return {
    uploads,
    update: { hero_photo_url: hero, gallery_photo_urls: gallery, theme_data: themeData },
  };
}

const MIME_BY_EXTENSION = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  mp4: "video/mp4",
};

export function contentTypeFor(path, headerValue) {
  const fromHeader = headerValue?.split(";")[0].trim();
  if (fromHeader && fromHeader !== "application/octet-stream") return fromHeader;
  return MIME_BY_EXTENSION[path.split(".").pop()] ?? "application/octet-stream";
}
