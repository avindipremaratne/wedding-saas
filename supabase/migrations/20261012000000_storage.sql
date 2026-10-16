-- Public bucket for site photos, theme images and the envelope videos.
-- Files are readable by anyone through their public URL (the site is
-- public); only the service role key can upload, replace or delete, so
-- there are deliberately no write policies on storage.objects.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  52428800, -- 50 MB, the free plan's per-file limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/mp4']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
