-- Footer credit on existing sites: "Website by Vindora Invites" with the
-- business email, replacing the owner's personal name, email and phone.
-- Only sites still carrying the old credit are changed. Safe to run twice.

update public.site_content
set theme_data = jsonb_set(
      theme_data,
      '{credit}',
      '{"name": "Vindora Invites", "email": "vindorainvites@gmail.com"}'::jsonb
    ),
    updated_at = now()
where theme_data -> 'credit' ->> 'email' = 'avindibuthmini@gmail.com';
