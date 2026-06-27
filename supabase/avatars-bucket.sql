-- Public bucket for profile pictures (avatars).
-- Avatars are shown directly via <img src={avatar_url}> across the app (chat,
-- public teacher pages), so the bucket is PUBLIC (read). Uploads go through a
-- service-role signed upload URL (see src/lib/profile/avatar-actions.ts), so no
-- authenticated INSERT policy is required.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Public read (covers the public bucket; explicit policy for clarity).
drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects
  for select
  using (bucket_id = 'avatars');

-- Allow a user to overwrite/delete their own avatar objects (path is prefixed
-- with their user id: "<uid>/<file>"). Uploads use signed URLs, but this lets
-- cleanup/replace work for the authenticated owner too.
drop policy if exists "avatars owner write" on storage.objects;
create policy "avatars owner write" on storage.objects
  for all to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
