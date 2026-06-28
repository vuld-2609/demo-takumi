-- Migration 0002 — Kudos Live Board (/kudos)
-- Extends 0001 for the live board: 4-tier hero badges, kudos compose, board indexes.
-- Apply AFTER 0001. Idempotent / safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. Allow all four hero-badge tiers (0001 allowed only legend_hero/super_hero).
--    Tiers map to how many distinct people sent you Kudos:
--    new_hero (1–4), rising_hero (5–9), super_hero (10–20), legend_hero (>20).
-- ---------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_hero_badge_check;
alter table public.profiles
  add constraint profiles_hero_badge_check
  check (hero_badge is null or hero_badge in ('new_hero', 'rising_hero', 'super_hero', 'legend_hero'));

-- ---------------------------------------------------------------------------
-- 2. Missing INSERT policy on kudos: a user may post a kudos only AS THEMSELVES
--    (sender_id must map to the caller's own profile). Required by the compose flow.
-- ---------------------------------------------------------------------------
drop policy if exists kudos_insert_own on public.kudos;
create policy kudos_insert_own on public.kudos
  for insert to authenticated
  with check (sender_id in (select id from public.profiles where auth_user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- 3. Board filtering indexes: hashtag (array) + department.
-- ---------------------------------------------------------------------------
create index if not exists kudos_hashtags_idx on public.kudos using gin (hashtags);
create index if not exists profiles_department_idx on public.profiles (department);
