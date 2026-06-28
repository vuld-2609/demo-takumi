-- Migration 0003 — Write-Kudo modal fields (Viết Kudo)
-- Extends 0001/0002 for the redesigned compose modal:
--   * title          — required "Danh hiệu" shown as the kudos title
--   * is_anonymous   — "Gửi ẩn danh" toggle
--   * anonymous_name — custom display name used when sent anonymously
--   * message now stores sanitized rich-text HTML (no schema change; text is fine)
--   * kudos-images Storage bucket + policies for attachment uploads
-- Apply AFTER 0002. Idempotent / safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. New kudos columns. Defaults keep existing rows + the heart/board reads valid.
-- ---------------------------------------------------------------------------
alter table public.kudos
  add column if not exists title          text    not null default '',
  add column if not exists is_anonymous   boolean not null default false,
  add column if not exists anonymous_name text;

-- ---------------------------------------------------------------------------
-- 2. Storage bucket for kudos image attachments (max 5 per kudos, enforced in app).
--    Public bucket so getPublicUrl() serves thumbnails without signed URLs.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('kudos-images', 'kudos-images', true)
on conflict (id) do nothing;

-- Authenticated users may upload only into THEIR OWN profile-id folder
-- (path layout: '<profileId>/<file>'); anyone may read (public bucket).
drop policy if exists kudos_images_insert on storage.objects;
create policy kudos_images_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'kudos-images'
    and (storage.foldername(name))[1] in (
      select id::text from public.profiles where auth_user_id = auth.uid()
    )
  );

drop policy if exists kudos_images_select on storage.objects;
create policy kudos_images_select on storage.objects
  for select using (bucket_id = 'kudos-images');

-- An uploader may remove their own objects (path is prefixed with their profile id).
drop policy if exists kudos_images_delete_own on storage.objects;
create policy kudos_images_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'kudos-images' and owner = auth.uid());
