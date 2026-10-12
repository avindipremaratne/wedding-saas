// Copies the theme assets and every site's photos from Wix to the Supabase
// Storage bucket, then points the database at the copies.
//
//   npm run media:migrate -- --dry-run   # show what would happen
//   npm run media:migrate                # do it
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
// .env.local. Safe to re-run: files are overwritten in place and rows that
// no longer point at Wix are left alone.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import {
  BUCKET,
  contentTypeFor,
  mediaBaseUrl,
  planSite,
  planThemeAssets,
} from "./media/plan.mjs";

const dryRun = process.argv.includes("--dry-run");
const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!projectUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

const mediaBase = mediaBaseUrl(projectUrl);
const supabase = createClient(new URL(projectUrl).origin, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function ensureBucket() {
  const { data } = await supabase.storage.getBucket(BUCKET);
  if (data) return;
  console.log(`Creating public bucket "${BUCKET}"…`);
  if (dryRun) return;
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 52428800,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "video/mp4"],
  });
  if (error) throw new Error(`Could not create bucket: ${error.message}`);
}

async function copy({ source, path }) {
  if (dryRun) {
    console.log(`  would copy ${source}\n          → ${path}`);
    return;
  }
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Download failed (${response.status}) for ${source}`);
  const body = Buffer.from(await response.arrayBuffer());
  const contentType = contentTypeFor(path, response.headers.get("content-type"));
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, body, { contentType, upsert: true, cacheControl: "31536000" });
  if (error) throw new Error(`Upload failed for ${path}: ${error.message}`);
  console.log(`  copied ${path} (${(body.length / 1024 / 1024).toFixed(1)} MB)`);
}

async function main() {
  console.log(dryRun ? "Dry run: nothing will be changed.\n" : "");
  await ensureBucket();

  // 1. Theme assets (backgrounds, icons, envelope videos).
  const themeAssets = JSON.parse(
    readFileSync(new URL("../themes/heirloom/assets.json", import.meta.url), "utf8"),
  );
  console.log("Theme assets (heirloom):");
  for (const upload of planThemeAssets(themeAssets)) await copy(upload);

  // 2. Each site's hero, gallery and logo, then its database row.
  const { data: rows, error } = await supabase
    .from("site_content")
    .select("site_id, hero_photo_url, gallery_photo_urls, theme_data, sites!inner(slug)");
  if (error) throw new Error(`Could not read sites: ${error.message}`);

  for (const row of rows) {
    const slug = row.sites.slug;
    const { uploads, update } = planSite({ ...row, slug }, mediaBase);
    console.log(`\nSite "${slug}":`);
    if (!update) {
      console.log("  already migrated, nothing to do");
      continue;
    }
    for (const upload of uploads) await copy(upload);
    if (dryRun) {
      console.log(`  would update site_content for "${slug}"`);
      continue;
    }
    const { error: updateError } = await supabase
      .from("site_content")
      .update(update)
      .eq("site_id", row.site_id);
    if (updateError) throw new Error(`Could not update "${slug}": ${updateError.message}`);
    console.log(`  updated site_content for "${slug}"`);
  }

  if (dryRun) {
    console.log("\nDry run finished. Run again without --dry-run to copy the files.");
    return;
  }
  console.log(`\nDone. To serve the theme assets from Supabase too, add this line to .env.local:\n`);
  console.log(`NEXT_PUBLIC_MEDIA_URL=${mediaBase}\n`);
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
