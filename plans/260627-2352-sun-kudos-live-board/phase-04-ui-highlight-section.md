# Phase 04 — UI: Highlight section (Track A)

**Status:** done

Build from [design-reference.md](./design-reference.md) §HIGHLIGHT KUDOS + §Highlight card. Mock props.
Files in `app/kudos/_components/`.

- `highlight-card.tsx` — dark highlight kudos card (sender→arrow→receiver, category, timestamp,
  message line-clamp-3, hashtags red, action bar: like + Copy Link + Xem chi tiết). Uses Phase-03 primitives.
- `highlight-carousel.tsx` (client) — **center card prominent, 2 sides faded/blurred** (opacity ~0.4,
  scale-down, non-interactive), round chevron-left/right arrows (disabled at ends), pagination "n/total".
  Props: items (BoardKudos[]), viewer context callbacks. Empty → "Hiện tại chưa có Kudos nào.".
- `highlight-section.tsx` (client) — header (subtitle + "HIGHLIGHT KUDOS") + the two `filter-dropdown`s
  (Hashtag, Phòng ban) on the right + the carousel. Holds selected filters; calls up to page to refilter.

## Todo
- [x] highlight-card — dark card with sender→receiver, category, message, hashtags, actions
- [x] highlight-carousel (center-focus/blur + nav + pagination) — center card prominent, side cards blurred, chevron nav, pagination display
- [x] highlight-section (filters wired to carousel) — hashtag + department filters, carousel with reset on filter change
