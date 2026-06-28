# Phase 03 — UI: shared primitives (Track A)

**Status:** done

Build from [design-reference.md](./design-reference.md). Presentational; mock props; no data fetching.
Files in `app/kudos/_components/` unless noted.

- Extend `app/profile/_components/hero-badge.tsx` → 4 tiers (new_hero, rising_hero, super_hero, legend_hero),
  color-coded; accept optional `onMouseEnter`/children for tooltip wrapping. Keep backward compat.
- `hero-badge-tooltip.tsx` — wraps a badge; on hover shows count line + description (props: variant, count, desc).
- `campaign-chip.tsx` — "x2" flame chip + hover tooltip (campaign copy). Static.
- `avatar-hover-card.tsx` — hover popover (name, "Tên đơn vị", badge, Số Kudos nhận/đã gửi, "Gửi KUDO" btn).
  Props: HoverCardData + onSendKudo. Shows on hover of wrapped avatar/name (controlled open state).
- `filter-dropdown.tsx` — single-select dropdown (trigger pill + menu, active highlight). Props:
  label, options, value, onChange. Closes on outside click / Esc.
- `like-button.tsx` — heart + count, gray↔red, optimistic; props: count, liked, disabled, onToggle.
- `copy-link-button.tsx` + `toast` — copy to clipboard + transient toast "Link copied — ready to share!".

Out of scope: data wiring (done in Phase 06).

## Todo
- [x] hero-badge (4 tiers) + tooltip + campaign-chip — hero-badge.tsx extended to 4 tiers, hero-badge-tooltip.tsx, campaign-chip.tsx
- [x] avatar-hover-card — avatar-hover-card.tsx with HoverCardData display
- [x] filter-dropdown — filter-dropdown.tsx single-select with controlled open state
- [x] like-button, copy-link-button + toast — like-button.tsx optimistic toggle, copy-link-button.tsx with transient toast
