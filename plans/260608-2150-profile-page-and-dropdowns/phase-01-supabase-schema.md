# Phase 01 — Supabase Schema (Track B)

**Priority**: High · **Status**: Complete · Track B (parallel with Track A)
Context: [plan.md](plan.md) · [clarifications.md](clarifications.md)

## Goal
Author SQL the user applies in the Supabase Dashboard SQL Editor to create the profile/kudos
schema with RLS, an auto-profile trigger, and seed data. App reads via anon key.

## Files to create
- `supabase/migrations/0001_profiles_kudos.sql`
- `supabase/seed.sql`
- `supabase/README.md` (how to apply: paste into Dashboard SQL Editor, or `supabase db push`)

## Schema
**profiles** (1:1 with `auth.users`)
- `id uuid PK references auth.users(id) on delete cascade`
- `display_name text`, `avatar_url text`, `department text`
- `rank text default 'CEVC1'`, `hero_badge text` (e.g. 'legend_hero' | 'super_hero' | null)
- `created_at timestamptz default now()`

**kudos**
- `id uuid PK default gen_random_uuid()`
- `sender_id uuid references profiles(id)`, `receiver_id uuid references profiles(id)`
- `message text`, `images text[] default '{}'`, `hashtags text[] default '{}'`
- `category text` (e.g. 'idol_gioi_tre' | null), `is_spam boolean default false`
- `created_at timestamptz default now()`
- indexes on `receiver_id`, `sender_id`, `created_at`

**kudos_hearts** (reaction)
- `kudos_id uuid references kudos(id) on delete cascade`
- `user_id uuid references profiles(id) on delete cascade`
- `created_at timestamptz default now()` · PK `(kudos_id, user_id)` · index on `kudos_id`

## Trigger
`handle_new_user()` → on `auth.users` insert, insert profile row with
`display_name`/`avatar_url` from `raw_user_meta_data` (Google: `full_name`/`name`, `avatar_url`/`picture`).
`security definer`. Plus a one-time backfill insert for existing users.

## RLS (enable on all 3)
- profiles: SELECT for `authenticated`; UPDATE only `auth.uid() = id`.
- kudos: SELECT for `authenticated`.
- kudos_hearts: SELECT for `authenticated`; INSERT/DELETE only `auth.uid() = user_id`.

## Seed (supabase/seed.sql)
Sample profiles (ranks CEVC2/CEVC3, hero_badge legend_hero/super_hero), ~5 kudos posts
(mix of `is_spam` and `category='idol_gioi_tre'`, images=Figma sample, hashtags), and hearts rows.
Use fixed UUIDs so seed is idempotent (`on conflict do nothing`). Content from design-spec.

## Todo
- [x] Write migration SQL (tables, indexes, RLS, trigger, backfill)
- [x] Write seed.sql (idempotent)
- [x] Write README with apply steps + note: app needs these applied to show data

## Success criteria
Valid PostgreSQL (Supabase) DDL; RLS prevents cross-user writes; trigger auto-creates profiles;
seed renders a populated profile when applied.

## Security
RLS on every table; role/auth never trusted from client; `security definer` trigger scoped to insert only.
