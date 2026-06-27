# Design Spec — Profile Page & Profile Dropdowns

> Authoritative design reference. MoMorph MCP is unavailable to subagents, so this file +
> the saved frame images in `visuals/` are the single source of truth for the UI build.
> NEVER guess visual values — match the frame image; exact CSS tokens are appended at forge time.

## MoMorph refs
- Dropdown-profile (user): https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/z4sCl3_Qtk
- Dropdown-profile Admin: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/54rekaCHG1
- Profile bản thân: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/3FoIx6ALVb
- Visual refs: `visuals/profile-screen.png`, `visuals/dropdown-user.png`, `visuals/dropdown-admin.png` (saved at forge time)

## Shared palette (from existing homepage)
- Page bg dark: `#00101A` / panel `#00070C`
- Gold accent: `#FFEA9E` ; gold glow text-shadow: `0 0 6px #FAE287`
- Border gold/tan: `#998C5F` ; divider: `#2E3940`
- Alert red: `#D4271D` ; hashtag/spam red ~ `#DC2626`
- Kudos card cream bg: light beige (≈ `#FBF3DE`/`#FFF7E0` — confirm from frame at forge)
- Hero-badge pill: dark maroon bg + gold text ("Legend Hero" / "Super Hero")

## Fonts
Geist sans (already configured). Stat values & "KUDOS" heading are bold/large.

---

## Screen 1 — Profile dropdown (user) `z4sCl3_Qtk`
Dark rounded panel. Two items:
- **Profile** — active state: light/dark raised bg + gold glow; label "Profile" + user icon (right).
- **Logout** — text "Logout" + chevron-right icon. Hover highlight.

## Screen 2 — Profile dropdown (admin) `54rekaCHG1`
Same panel + a middle item:
- **Profile** (active, user icon) / **Dashboard** (grid/apps icon) / **Logout** (chevron-right).

### Dropdown build decision (CONFIRMED)
Restyle the EXISTING [header-controls.tsx](../../app/_components/home/header-controls.tsx) account menu — do NOT create a new component.
Current items already correct: Profile → `/profile`, Admin Dashboard → `/admin` (admin only), Sign out → `signOut()`.
Apply design: active-glow on Profile, user icon on Profile, grid icon on Dashboard, chevron-right on Logout.
Map: design "Logout" == existing "Sign out" (`signOut` action). i18n key `home.header.signOut` stays.

---

## Screen 3 — Profile bản thân `3FoIx6ALVb` (route: `/profile`)
Logged-in user's own profile. Structure top→bottom (from node tree `362:5037`):

### A. Hero (`mms_A_Info`, on colorful "Root Further" keyvisual banner)
- Keyvisual banner background (reuse homepage hero keyvisual asset).
- **Avatar** (circular, centered, ring) — `mms_A.1_Avatar`.
- **Name** large gold — `mms_A.2_Name` (sample: "Huỳnh Dương Xuân Nhật").
- **Department/rank** small (sample: "CEVC3") + **hero-badge pill** "Legend Hero" — `danh hiệu`.
- **Icon collection row** — `mms_A.3_Huy Hiệu`: 7 circular slots. Earned = icon, not-earned = gray. Caption "Bộ sưu tập icon của tôi". PLACEHOLDER (mock; no backend) — render 7 gray slots.

### B. Stats card (`mms_B_Thống kê`) — dark panel, gold border
Five label/value rows + a button:
1. Số Kudos bạn nhận được — REAL (kudos received count)
2. Số Kudos bạn đã gửi — REAL (kudos sent count)
3. Số tim bạn nhận được — REAL (hearts received across your kudos)
   — divider —
4. Số Secret Box bạn đã mở — PLACEHOLDER (mock value)
5. Số Secret Box chưa mở — PLACEHOLDER (mock value)
- **Button "Mở Secret Box"** (gold filled, dark text, gift icon) — `mms_B.6` — PLACEHOLDER, non-functional (disabled or shows "coming soon"; no backend).

### C. Section header (`mms_C`)
- Caption "Sun* Annual Awards 2025" (small) + big gold "KUDOS" title + gold underline rule.
- **Filter dropdown** "Đã gửi (5)" / "Đã nhận (N)" — `mms_C.3_Button` (chevron down). Toggles feed between sent/received; count in label.

### D. Kudos feed (`mms_D_Post all`) — list of kudos cards
Card variants seen: "KUDO spam" (Spam tag) and "KUDO" (category "IDOL GIỚI TRẺ"). One card (`KUDO` 1949:12834):
- **Header**: sender Info (avatar, name, rank "CECV2", hero-badge) → arrow/play IC → receiver Info (avatar, name, rank, hero-badge).
- Top-right: **"Spam"** red tag (spam variant) OR centered **category** label (e.g. "IDOL GIỚI TRẺ", gold) under header.
- **Timestamp** (sample "10:00 - 10/30/2025").
- **Message** text (multi-line, truncated …).
- **Image grid**: up to 5 thumbnails (`MM_MEDIA_Sample Image`).
- **Hashtags** red text ("#Dedicated #Inspring …").
- **Footer**: left hearts "1.000 ❤" (button tim), right "Copy Link 🔗" (button copylink).

### E. Footer
Reuse existing [site-footer.tsx](../../app/_components/home/site-footer.tsx).

---

## Media assets (download to `public/profile/` at forge — S3 URLs expire ~10min, re-fetch via get_media_files)
- Sender avatar: `b7a4539382becdcc995fc02b49eca375.png`
- Receiver avatar A: `c5d2f914e0f015e96f8d904382add9c2.png`
- Profile hero avatar: `b7a45393…` (same as sender sample) — for own profile use real OAuth avatar, fallback to this.
- Sample post image: `f4c11e1a2184ee01b622def7781bc11c.png` (one image, repeated in grid)
- Keyvisual banner + hero-badge images: reuse homepage assets in `public/homepage/` if present; else render with CSS gradient placeholder.
- Icons (user, chevron-right, grid/apps, heart, copy-link, gift, play/arrow): use inline SVG in `icons.tsx` pattern or existing `public/homepage/*.svg`.

## Exact tokens (from get_node_context — authoritative)
- Content column width: **680px** (stats card, kudos cards, post list all 680px wide, centered).
- **Kudos card**: bg `#FFF8E1` (rgba(255,248,225,1)) · border-radius `24px` · padding `40px 40px 16px 40px` · inner gap `16px`. Cards stacked with `24px` gap.
- Stats card (`mms_B`): flex column, gap `24px`, width 680px (dark panel w/ gold border — match `visuals/profile-screen.png`).
- Hero (`mms_A_Info`): centered column, gap `32px`, full-width over keyvisual banner.
- Frame canvas width 1440px (desktop). Avatars in kudos = 64px; post thumbnails = 88px square.
- Visual refs saved: `visuals/profile-screen.png` (1440×4660 full screen), `visuals/dropdown-user.png`, `visuals/dropdown-admin.png`.
- Downloaded assets in `public/profile/`: `kudos-avatar-1.png`, `kudos-avatar-2.png`, `kudos-sample-image.png`.

## Component reuse
- Header: `app/_components/home/site-header.tsx` + `header-controls.tsx` (restyle).
- Footer: `app/_components/home/site-footer.tsx`.
- Icons pattern: `app/_components/home/icons.tsx`.
- Auth: `getCurrentUser()` (`lib/auth/current-user.ts`), redirect to `/login` if null.
