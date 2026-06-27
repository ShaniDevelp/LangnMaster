-- Public bucket for course banner images.
-- Banners render via <img src={thumbnail_url}> across student/teacher/admin, so
-- the bucket is PUBLIC (read). Uploads go through a service-role signed upload
-- URL (see src/lib/admin/course-image-actions.ts), gated to admins in the
-- action, so no authenticated INSERT policy is required.

insert into storage.buckets (id, name, public)
values ('course-images', 'course-images', true)
on conflict (id) do update set public = true;

-- Public read.
drop policy if exists "course images public read" on storage.objects;
create policy "course images public read" on storage.objects
  for select
  using (bucket_id = 'course-images');
