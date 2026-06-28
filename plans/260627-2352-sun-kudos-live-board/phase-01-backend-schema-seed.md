# Phase 01 — Backend: schema + seed (Track B)

**Status:** done

## Goal
Extend the existing Supabase schema for the board and enrich seed data.

## Create `supabase/migrations/0002_kudos_board.sql` (idempotent, guarded)
- Relax `profiles.hero_badge` check to allow all 4 tiers:
  drop the old check, add `check (hero_badge in ('new_hero','rising_hero','super_hero','legend_hero'))`.
- Add **kudos INSERT policy** (was missing): `kudos_insert_own` — `with check (sender_id in (select id from public.profiles where auth_user_id = auth.uid()))`.
- Add GIN index on `kudos.hashtags`: `create index if not exists kudos_hashtags_idx on public.kudos using gin (hashtags);`.
- Add index on `profiles.department`.

## Extend `supabase/seed.sql` (append, idempotent — new fixed UUIDs)
- Add ~6 profiles across departments: CEVC1, CEVC2, CEVC3, CEVC4, OPD, Infra (mix of hero tiers incl. new/rising).
- Add ~8–10 kudos spread over hashtags (#Dedicated, #Inspring, #Innovative, #Teamwork) and departments,
  with varied `created_at`, so Highlight top-5-by-hearts is meaningful.
- Add hearts so the 5 highlight cards have clearly different counts.
- Keep all existing rows untouched.

## Success criteria
- SQL is idempotent / re-runnable; no syntax errors.
- README note updated (Phase 06/doc step) — not here.

## Todo
- [x] Write 0002 migration — `supabase/migrations/0002_kudos_board.sql` applied
- [x] Extend seed.sql — 6 demo profiles, 4 hero tiers, 15 kudos, 31 hearts, top-5 highlight working
