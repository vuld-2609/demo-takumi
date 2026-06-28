# Design Reference — Sun* Kudos Live Board

Screen: `Sun* Kudos - Live board` (screenId MaZUn5xHXZ, file 9ypp4enmFmdK3YAFJLIu6C).
This file is the **visual source of truth** — MoMorph/Figma is not reachable from subagents.
All values below come from the design image + specs + the 4 user-provided interaction screenshots.

## Design tokens (reuse existing project conventions)
- Page background: `#00101A` (deep navy). Section panels: `#00070C` / `#0F0F0F` / `#0B0B0B`.
- Gold accent (titles, values, badges text): `#FFEA9E`, glow `text-shadow: 0 0 6px #FAE287`.
- Gold border: `#998C5F`. Card light bg (All Kudos posts): `#FFF8E1`. Card text dark: `#1A1A1A`.
- Hashtag red: `#DC2626`. Heart active red: `#D4271D`. Divider on dark: `#2E3940`; on light: `#E5D9B6`.
- Subtitle gold small text e.g. "Sun* Annual Awards 2025": `#FFEA9E` ~14px.
- Font: Montserrat (latin+vietnamese) like profile page; gold titles bold, uppercase for section titles.

## Page layout (top → bottom)
1. **SiteHeader** (reuse `@/app/_components/home/site-header`).
2. **Banner (A)** — keyvisual bg, big "KUDOS" wordmark + title "Hệ thống ghi nhận và cảm ơn".
   Below it, **input pill (A.1)**: pill text field, pencil icon left, placeholder
   "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?". Click → opens compose dialog.
   (Right of pill in design: a "Tìm kiếm profile Sunner" search pill — render static, non-priority.)
3. **HIGHLIGHT KUDOS (B)** — subtitle "Sun* Annual Awards 2025", title "HIGHLIGHT KUDOS" (gold, large).
   Top-right: two dropdown filters **"Hashtag" (B.1.1)** and **"Phòng ban" (B.1.2)**.
   Carousel of top-5 most-hearted kudos. **Center card prominent; the 2 side cards faded/blurred**
   (opacity ~0.4, slightly scaled down, non-interactive). Nav: round chevron-left/right arrows on the
   sides (disabled at first/last). Below center: pagination `‹  2/5  ›`.
4. **ALL KUDOS (C)** + **Sidebar (D)** — two columns.
   - Left (C): subtitle "Sun* Annual Awards 2025", title "ALL KUDOS"; vertical feed of post cards.
   - Right (D): stats panel + two leaderboards.
5. **SiteFooter** (reuse `@/app/_components/home/site-footer`).

## Highlight card (B.3) — dark card on the carousel
- Dark card (`#0B0B0B`/`#101010`), rounded ~20px, gold-ish hairline.
- Header row: **sender** (avatar 56–64px gold ring, name gold, rank/dept gray, hero-badge) →
  play/arrow glyph (`PlayIcon`, gold `#998C5F`) → **receiver** (same layout).
- Category label centered gold if present (e.g. "IDOL GIỜI TRẺ").
- Timestamp gray: format `HH:mm - MM/DD/YYYY` e.g. "10:00 - 10/30/2025".
- Message: max 3 lines, ellipsis (`line-clamp-3`).
- Hashtags: red `#DC2626`, max 1 line ellipsis, e.g. "#Dedicated #Inspring ...".
- Action bar: heart + count (gray inactive → red active), "Copy Link", "Xem chi tiết".

## All-Kudos post card (C.3) — light card
- Reuse the existing look of `app/profile/_components/kudos-card.tsx` (bg `#FFF8E1`, radius 24px).
- Same sender→receiver header, timestamp, message (max 5 lines), image gallery (max 5, 88px),
  hashtags red, footer: heart+count (left) and "Copy Link" (right).

## Filter dropdowns (B.1.1 / B.1.2) — see screenshot 1
- Trigger: dark pill button, label + chevron-down. Active state shows the selected value.
- Menu: dark rounded panel (`#0B0B0B`, gold hairline). Each option a row; the **active/selected option**
  has a lighter highlighted background with subtle gold glow, bold white text.
- Hashtag options example: `#Dedicated` (active), `#Inspring`, `#Dedicated`, `#Dedicated`, `#Inspring`, `#Inspring`.
- Phòng ban options example: `CEVC2` (active), `CEVC3`, `CEVC4`, `CEVC1`, `OPD`, `Infra`.
- Single-select. Includes a "clear/all" affordance. Selecting filters BOTH Highlight + All Kudos and
  resets carousel pagination to 1.

## Hover avatar popover (B.3.1/C.3.1) — see screenshot 2
Appears on hover of any avatar/name. Dark rounded card (`#101010`, gold hairline, shadow), ~360px:
- Name (gold, bold, ~20px): e.g. "Huỳnh Dương Xuân Nhật".
- "Tên đơn vị: {department full path}" gray, e.g. "Culture & Communication Executive/C&C Line/HRD Unit/OPD Center".
- Hero badge graphic (e.g. "Legend Hero").
- Divider.
- "Số Kudos nhận được:  {n}" (label white, value gold bold).
- "Số Kudos đã gửi:  {n}".
- Gold button full-width "✏ Gửi KUDO" → opens compose dialog targeted at this person.

## Hero-badge tiers + tooltips (hover các danh hiệu) — see screenshot 3
Four tiers (color-coded pill/badge). On hover show a tooltip with count line + description.
Copy already exists in i18n `home.rules.tier*` (EN) and vi.json (VI):
- **New Hero** — "Có 1–4 người gửi Kudos cho bạn" — desc tierNewDesc. Neutral/silver tone.
- **Rising Hero** — "Có 5-9 người gửi Kudos cho bạn" — tierRisingDesc. Green accent.
- **Super Hero** — "Có 10–20 người gửi Kudos cho bạn" — tierSuperDesc. Red accent.
- **Legend Hero** — "Có hơn 20 người gửi Kudos cho bạn" — tierLegendDesc. Gold/flame accent.
- **Campaign x2** (hover the x2 flame chip) — title "Ngày x2 tim – lan tỏa gấp đôi yêu thương!",
  body "Từ XX:XX ngày XX/12 đến XX:XX ngày XX/12, tất cả tim bạn nhận được đều được nhân đôi."
  (campaign is a static/admin-config placeholder; render the chip + tooltip only.)

## Sidebar (D)
- Stats panel (reuse `ProfileStatsCard` look): "Số Kudos bạn nhận được", "Số Kudos bạn đã gửi",
  "Số tim bạn nhận được", "Số Secret Box đã mở", "Số Secret Box chưa mở", "Mở Secret Box" (disabled placeholder).
- Leaderboard "10 SUNNER NHẬN QUÀ MỚI NHẤT": rows of avatar + name + small gift desc ("Nhận được 1 áo phông SAA").
  (Design also names "10 SUNNER CÓ SỰ THĂNG HẠNG MỚI NHẤT" — render both; data from seeded profiles.)
- Empty states: feed "Hiện tại chưa có Kudos nào.", leaderboard "Chưa có dữ liệu".

## Behaviors (functional)
- Carousel: prev/next move center; arrows disabled at ends; pagination "current/total"; center-focus + side blur.
- Filters: single-select hashtag + department; filtering both sections; reset pagination to 1; empty-state handling.
- Like: toggle heart, optimistic count ±1, color gray↔red. Rules: 1 like/user/kudos; sender cannot like own kudos
  (disabled). Persists via `kudos_hearts` (RLS already allows own insert/delete).
- Copy Link: copy `/kudos?k={id}` (or detail URL) to clipboard, toast "Link copied — ready to share!".
- Compose: dialog with message + optional hashtags, inserts a kudos (needs new INSERT RLS policy), feed refreshes.
- Auth: unauthenticated → clicking profile/detail redirects to /login (page itself requires auth like /profile).
