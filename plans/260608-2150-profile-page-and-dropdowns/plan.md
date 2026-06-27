# Plan — Profile Page & Profile Dropdowns

Branch: `feat/profile-page` (stacked on `feat/homepage`). Route: `/profile`.
Refs: [clarifications.md](clarifications.md) · [design-spec.md](design-spec.md)

## Goal
Build the logged-in user's `/profile` page (hero, stats, kudos feed) backed by REAL Supabase
tables (profiles, kudos, kudos_hearts), and restyle the existing header account dropdown to match
the MoMorph design (user + admin variants). Secret-box / icon-collection / badges = visual placeholder.
Labels localized EN + VI.

## Architecture
- **Backend**: SQL migrations (tables + RLS + trigger + seed) the user applies via Supabase Dashboard;
  app reads via anon key + RLS. Typed server query layer in `lib/profile/`.
- **Frontend**: `app/profile/page.tsx` server component → `getCurrentUser()` (redirect `/login` if none)
  → fetch profile + stats + kudos → render `app/profile/_components/*`. Filter toggle is a client component.
- **Dropdown**: restyle existing `header-controls.tsx` (no new component).

## Tracks (Track A ⟂ Track B run in parallel)
| Phase | Track | Title | Depends on |
|-------|-------|-------|-----------|
| [01](phase-01-supabase-schema.md) | B | Supabase schema: migrations, RLS, trigger, seed, README | — |
| [02](phase-02-data-layer-and-types.md) | B | Types + server query layer (`lib/profile/`) | 01 (schema shape) |
| [03](phase-03-profile-page-ui.md) | A | Profile page UI components (mock props) | — |
| [04](phase-04-header-dropdown-restyle.md) | A | Restyle header account dropdown (user/admin) | — |
| [05](phase-05-integration-and-i18n.md) | — | Wire real data into page; EN/VI i18n | 02, 03 |
| [06](phase-06-tests-review-delivery.md) | — | Typecheck, tests, review, docs, deliver | 05, 04 |

No `blocks` between Track A and Track B. Integration (05) is the join point.

## Status
- [x] 01 Supabase schema (Track B)
- [x] 02 Data layer + types (Track B)
- [x] 03 Profile page UI (Track A)
- [x] 04 Header dropdown restyle (Track A)
- [x] 05 Integration + i18n
- [x] 06 Tests + review + delivery

## Key constraints
- MCP unavailable in subagents → orchestrator pre-fetches design + assets (done; see design-spec.md).
- No DB access (anon key only) → migrations delivered as SQL files for user to apply; cannot auto-run.
- Bash `node_modules` blocked in subagents → orchestrator runs typecheck/lint/build centrally.
- Next 16: `proxy.ts` (not middleware), async `cookies()`/`headers()`. Read `node_modules/next/dist/docs/` before code.
- Files < 200 lines; kebab-case; YAGNI/KISS/DRY.

## Out of scope
Secret-box open logic, badge/icon-collection earning logic, kudos creation UI, notifications backend,
viewing other users' profiles, `/admin` & `/secret-box` pages.

## Outcome
**Build Status**: COMPLETE
All 6 phases built and verified. Compile gates: `npx tsc --noEmit` ✓, `npm run lint` ✓ (feature scope), `npm run build` ✓.
Reviewer verdict 7/10; fixes applied: Number() coercion on heart-count, scalable hearts via inner join, 'use client' on kudos-card, profiles insert RLS policy, unused department field removed.

**User Action Required**: Apply Supabase migrations + seed via Supabase Dashboard SQL Editor (or CLI `supabase db push`). Routes:
- Run `supabase/migrations/0001_profiles_kudos.sql` (schema + RLS + trigger + backfill)
- Run `supabase/seed.sql` (sample data)
  
Page renders empty-state (zero kudos, zero hearts, zero stats) until migrations/seed applied. Once applied, fetches real data from Supabase.
