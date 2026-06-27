# Phase 03 — Profile Page UI (Track A)

**Priority**: High · **Status**: Complete · Track A (parallel with Track B; no backend dependency)
Context: [plan.md](plan.md) · [design-spec.md](design-spec.md) · visuals in `visuals/`
Built by background `implementer` subagent via `momorph-implement-design`. Use design content as mock data — do NOT invent data.

## Goal
Pixel-faithful presentational UI for `/profile` (screen `3FoIx6ALVb`), wired to MOCK props.
Orchestrator replaces mock with real data in phase 05.

## Files to create
- `app/profile/page.tsx` — server page (mock data initially; real wiring in P05).
- `app/profile/_components/profile-hero.tsx` — banner + avatar + name + rank + hero-badge + icon-collection row (7 gray slots, placeholder).
- `app/profile/_components/profile-stats-card.tsx` — 5 stat rows + "Mở Secret Box" placeholder button.
- `app/profile/_components/kudos-section.tsx` — "KUDOS" header + sent/received filter dropdown (client component for toggle).
- `app/profile/_components/kudos-card.tsx` — one kudos post (sender→receiver, badges, spam/category tag, time, message, image grid, hashtags, hearts, copy-link).
- `app/profile/_components/hero-badge.tsx` — reusable "Legend Hero"/"Super Hero" pill.
- Add any needed icons to `app/_components/home/icons.tsx` (chevron-right, grid, heart, copy-link, gift, play/arrow, user).

## Contract (props the orchestrator will fill in P05)
- Page renders from: `profile: Profile`, `stats: ProfileStats`, `kudos: KudosWithUsers[]` (both sent+received fetched; client filters).
- Match `lib/profile/types.ts` shapes (phase 02). Keep components presentational; no direct DB calls in components.

## Constraints
- Match `visuals/profile-screen.png` exactly; shared palette in design-spec.
- Reuse `site-header`, `site-footer`. Each file < 200 lines. kebab-case.
- Visual validation loop (momorph-implement-design Step 7) against the frame.

## Todo
- [x] profile-hero, stats-card, kudos-section, kudos-card, hero-badge
- [x] page.tsx renders full layout with mock data
- [x] icons added; visual parity check

## Out of scope
Real data fetching (P05), i18n keys (P05), secret-box/badge logic.
