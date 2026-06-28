# Plan — Sun* Kudos Live Board (`/kudos`)

MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
Refs: [clarifications.md](./clarifications.md) · [design-reference.md](./design-reference.md)

## Goal
Build the `/kudos` page: **Highlight carousel + All Kudos feed + sidebar**, wired to Supabase,
with fully-working interactions (hashtag/department filters, center-focus carousel, hover-avatar
popover, hero-badge tooltips, like toggle, copy-link toast, functional compose dialog).
Out of scope: Spotlight word-cloud, Secret Box backend, real navigation to a kudos detail page.

## Two-track structure (MoMorph)
Track A (UI) and Track B (backend) are parallel-runnable; they meet at the Integration phase.

## Phases
| # | Phase | Track | Status | Depends |
|---|-------|-------|--------|---------|
| 01 | [Backend: schema + seed](./phase-01-backend-schema-seed.md) | B | done | — |
| 02 | [Backend: types + queries + actions](./phase-02-backend-queries-actions.md) | B | done | 01 |
| 03 | [UI: shared primitives (badge, hover-card, badge-tooltip, dropdown, like, copy, toast)](./phase-03-ui-shared-primitives.md) | A | done | — |
| 04 | [UI: Highlight section (carousel center-focus + filters)](./phase-04-ui-highlight-section.md) | A | done | — |
| 05 | [UI: All Kudos feed + sidebar + banner + compose dialog](./phase-05-ui-feed-sidebar-banner.md) | A | done | — |
| 06 | [Integration: page assembly + wire data/actions + i18n](./phase-06-integration.md) | A+B | done | 01-05 |
| 07 | [Temper + Inspect: tests, visual validation, review](./phase-07-test-review.md) | — | done | 06 |

## Key decisions
- Reuse existing tokens/components (`hero-badge`, `kudos-card` look, `icons`, `ProfileStatsCard`, SiteHeader/Footer).
- Extend `HeroBadge` type+component from 2 → 4 tiers (`new_hero`,`rising_hero`,`super_hero`,`legend_hero`).
- New backend in `lib/kudos/` (types.ts, queries.ts) + `app/actions/kudos.ts`; migration `0002_kudos_board.sql`.
- Filters single-select; affect both sections; reset carousel page to 1.
- Like persists via existing `kudos_hearts` RLS; compose needs new `kudos` INSERT policy.
- i18n: new `kudos` namespace in `messages/en.json` + `messages/vi.json`.

## Out of Scope (Deferred)
- **Spotlight word-cloud**: design visualized but backend data aggregation deferred.
- **Kudos detail-page navigation**: "Xem chi tiết" button is visual only; no dynamic navigation wired.
- **Secret Box backend**: gift/reward table schema not implemented; leaderboards static seeded.
- **Rank-up/gift event tables**: leaderboards ("thăng hạng", "nhận quà") populated from seeded profiles only.
- **Campaign x2 logic**: campaign-chip rendered as static visual; no tier-based multiplier logic.

## Risks (Mitigated)
- Carousel center-focus/blur math + responsive — validated via visual review.
- RLS for compose: sender_id = own profile enforced at action level.
- Subagents mitigated via design-reference.md pre-fetch.
