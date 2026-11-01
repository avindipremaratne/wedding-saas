-- RSVP options a couple can choose from (the admin page manages them):
--   1. An email for every RSVP (existing notification_email), now with an
--      on/off switch.
--   2. A spreadsheet the admin downloads and sends (no column needed).
--   3. A private link that shows the couple their RSVP list without a login.
--      rsvp_share_token is the secret part of that link; null means off.
-- Neither column is granted to anon or authenticated: the column-level
-- SELECT grant on sites (see the init migration) lists columns explicitly,
-- so new columns stay readable only with the service role key.

alter table public.sites
  add column rsvp_email_enabled boolean not null default true,
  add column rsvp_share_token text unique
    check (rsvp_share_token is null or char_length(rsvp_share_token) >= 32);
