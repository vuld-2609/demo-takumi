# Phase 05 — UI: All Kudos feed + sidebar + banner + compose (Track A)

**Status:** done

Build from [design-reference.md](./design-reference.md) §ALL KUDOS, §Sidebar, §Banner, §Compose. Mock props.
Files in `app/kudos/_components/`.

- `kudos-post-card.tsx` — light post card (reuse look of `app/profile/_components/kudos-card.tsx`:
  bg #FFF8E1, radius 24px). sender→receiver header, timestamp, message line-clamp-5, image gallery (max 5),
  hashtags red, footer like + Copy Link. Uses Phase-03 primitives + avatar-hover-card.
- `all-kudos-feed.tsx` — section header ("Sun* Annual Awards 2025" / "ALL KUDOS") + vertical list of cards.
  Empty → "Hiện tại chưa có Kudos nào.".
- `kudos-banner.tsx` — KV banner + title "Hệ thống ghi nhận và cảm ơn" + KUDOS wordmark + input pill
  (placeholder "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?") → opens compose dialog.
- `kudos-sidebar.tsx` — stats panel (reuse ProfileStatsCard look) + leaderboards
  ("10 SUNNER CÓ SỰ THĂNG HẠNG MỚI NHẤT", "10 SUNNER NHẬN QUÀ MỚI NHẤT"). Empty → "Chưa có dữ liệu".
- `compose-dialog.tsx` (client) — modal: optional preselected receiver, message textarea, hashtags input,
  submit → calls createKudos action; validation (message required); close on success.

## Todo
- [x] kudos-post-card — light card with sender→receiver, message, image gallery, hashtags, like + copy-link
- [x] all-kudos-feed — vertical feed with section header and empty state
- [x] kudos-banner (+ input pill) — KV banner with title, wordmark, input trigger for compose
- [x] kudos-sidebar (stats + leaderboards) — stats panel + two leaderboard lists ("thăng hạng", "nhận quà")
- [x] compose-dialog — modal with receiver selector, message textarea, hashtags input, submit to createKudos
