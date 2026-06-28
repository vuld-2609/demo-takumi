# Supabase schema — Profile & Kudos

The app reads these tables with the **public anon key** under Row Level Security.
There is no service key / DB connection in the repo, so **you must apply the SQL yourself.**

## Tables
- `profiles` — one row per user. Linked to `auth.users` via nullable `auth_user_id`
  (so sample/seed profiles can exist without a login). Auto-created on signup by a trigger.
- `kudos` — recognition posts (`sender_id` → `receiver_id`), with `message`, `images[]`,
  `hashtags[]`, `category`, `is_spam`.
- `kudos_hearts` — "tim" reactions, one per `(kudos_id, user_id)`.

## Apply (Supabase Dashboard)
1. Open your project → **SQL Editor** → **New query**.
2. Paste the contents of `migrations/0001_profiles_kudos.sql`, **Run**.
3. Paste the contents of `migrations/0002_kudos_board.sql`, **Run**. *(Must follow 0001; idempotent / safe to re-run.)*
4. (Optional, for demo data) paste `seed.sql`, **Run**.

Or with the Supabase CLI: `supabase db push` (migrations) then run `seed.sql`.

## Link your account to the seeded demo data (optional)
Seeded profiles have `auth_user_id = NULL`, so they won't show on *your* profile page.
After you have signed in at least once (which creates your own profile via the trigger),
run this to adopt the demo subject's kudos as your own:

```sql
-- 1. find your auth uid
select id, email from auth.users order by created_at desc;

-- 2. point the demo subject profile at your account
--    (first detach your trigger-created profile to free the unique link)
update public.profiles set auth_user_id = null
  where auth_user_id = '<YOUR_AUTH_UID>';
update public.profiles set auth_user_id = '<YOUR_AUTH_UID>'
  where id = '11111111-1111-1111-1111-111111111111';
```

Reload `/profile` — you'll see 2 received + 2 sent kudos with hearts.

## Migration 0002 — Kudos Live Board (`/kudos`)

Extends 0001 for the live board. Must be applied **after** 0001. Idempotent / safe to re-run.

| Change | Detail |
|---|---|
| `profiles_hero_badge_check` widened | Allows all 4 tiers: `new_hero`, `rising_hero`, `super_hero`, `legend_hero` (0001 only allowed `super_hero` / `legend_hero`). |
| `kudos_insert_own` RLS policy | INSERT on `kudos` only allowed when `sender_id` maps to the caller's own profile (`auth_user_id = auth.uid()`). Required by the compose flow. |
| `kudos_hashtags_idx` | GIN index on `kudos.hashtags` (array column). Speeds up hashtag filter on the board. |
| `profiles_department_idx` | B-tree index on `profiles.department`. Speeds up Phòng ban filter. |

## Notes
- The profile page renders correctly **before** you apply this (empty/zero states); applying it
  just populates real data.
- Secret-box counts, the icon collection and badges are visual placeholders — no tables for them.
- RLS: profiles/kudos/hearts are readable by any authenticated user; you can only update your own
  profile and add/remove your own hearts.
- The `/kudos` board leaderboards use seeded demo data — no rank-up / gift event tables exist yet.
