# Project Changelog

## [Unreleased]

### 2026-06-28

#### Added
- **Sun* Kudos Live Board** (`/kudos` — auth-gated, redirects to `/login`). Built from MoMorph design.
  - Sections: keyvisual banner + compose input pill; HIGHLIGHT KUDOS carousel (top-5 by hearts, center-focus with 2 flanking blurred cards); ALL KUDOS feed; right sidebar (viewer stats, two seeded leaderboards, placeholder Secret Box).
  - Filters: Hashtag + Phòng ban single-select dropdowns on the carousel; filter state propagated via URL `searchParams` and affects both sections.
  - Interactions: hover-avatar popover (name / unit / badge / kudos counts / Gửi KUDO button); 4-tier hero-badge hover tooltips + x2 campaign static chip; like toggle (optimistic UI, persisted, sender cannot like own kudos, one heart per user per kudos); copy-link toast; functional compose dialog (creates a real kudos row via server action).
  - **Out of scope (not yet built):** spotlight word-cloud; kudos detail page navigation; Secret Box backend; rank-up/gift event tables (leaderboard data is seeded); x2 campaign chip is static.
  - Files: `app/kudos/` (page + components); data layer `lib/kudos/{types,queries}.ts`; server actions `app/actions/kudos.ts` (`toggleHeart`, `createKudos`, `loadHoverCard`).
  - **i18n** — `kudos.*` namespace added to `messages/vi.json` and `messages/en.json`.

- **"Viết Kudo" compose modal redesign** — full rebuild of the kudos compose flow to the MoMorph light/cream design.
  - Recipient autocomplete (search by name).
  - Required "Danh hiệu" (title) text field.
  - Rich-text editor: Bold / Italic / Strikethrough / ordered + unordered lists / link / blockquote; @mention and hashtag support.
  - Hashtag chips: 1–5 tags, predefined set + free-form input.
  - Image upload: up to 5 images (jpg/png, 5 MB each) stored in Supabase Storage bucket `kudos-images` (public, uploader-scoped insert policy).
  - Anonymous send with optional custom display name; real sender identity never serialized to client (`lib/kudos/queries.ts` masks anonymous senders).
  - XSS protection: `lib/kudos/sanitize-html.ts` dependency-free allowlist sanitizer; output re-sanitized on render via `dangerouslySetInnerHTML`.
  - `next.config.ts` — Supabase Storage hostname added to `next/image` `remotePatterns`.

#### Changed
- **`lib/profile/types.ts` `HeroBadge`** — widened from 2 tiers to 4: `new_hero | rising_hero | super_hero | legend_hero`.

#### Database
- **Migration `supabase/migrations/0002_kudos_board.sql`** (apply after 0001):
  - `profiles_hero_badge_check` constraint widened to all 4 badge tiers.
  - New `kudos_insert_own` RLS policy: authenticated users may INSERT a kudos only when `sender_id` maps to their own profile (`auth_user_id = auth.uid()`).
  - GIN index `kudos_hashtags_idx` on `kudos.hashtags` (array column).
  - B-tree index `profiles_department_idx` on `profiles.department`.
- **`supabase/seed.sql`** extended with demo profiles across multiple departments and board-level kudos/hearts.
- **Migration `supabase/migrations/0003_kudos_compose_fields.sql`**:
  - `kudos` table: added `title` (text), `is_anonymous` (boolean), `anonymous_name` (text); `message` column now stores sanitized rich-text HTML.
  - New Supabase Storage bucket `kudos-images` (public) with INSERT policy restricting uploads to the uploader's own profile-id folder.

### 2026-06-27

#### Added
- **"Hệ thống giải" (Award System) page** (`/he-thong-giai` — auth-gated by existing middleware). Pixel-built from MoMorph design screen `zFYDgyj_pD`.
  - Sections: hero keyvisual, sticky scroll-spy category nav (6 award categories), 6 award cards, Sun* Kudos promo banner.
  - Files: `app/he-thong-giai/page.tsx`, `app/he-thong-giai/award-data.ts`, components in `app/he-thong-giai/_components/` (award-nav, award-card, award-icons, award-kudos-banner). Assets in `public/he-thong-giai/`.
  - **Header nav** — "Award Information" link in `app/_components/home/site-header.tsx` now points to `/he-thong-giai`.
  - **i18n** — `awardSystem.*` namespace added to `messages/vi.json` and `messages/en.json`.

### 2026-06-09

#### Added
- **Profile page** (`/profile` — authenticated, own profile only). Pixel-built from design; server-rendered with real Supabase data.
  - Hero section: avatar, display name, rank, hero-badge, placeholder icon-collection strip.
  - Stats card: real kudos received/sent counts + hearts received pulled from Supabase via anon key + RLS; secret-box counts are UI placeholders.
  - Kudos feed: paginated list with sent/received filter tabs.
  - Files: `app/profile/` (page + components); data layer `lib/profile/` (query functions, type definitions).
- **Supabase schema — three new tables** (migrations in `supabase/migrations/`; applied manually by developer):
  - `profiles` — one row per user, nullable `auth_user_id` FK; auto-created on first login via a Postgres `INSERT` trigger on `auth.users`.
  - `kudos` — kudo posts with sender/recipient FK to `profiles`.
  - `kudos_hearts` — heart reactions on kudos (composite PK `kudos_id + user_id`).
  - All three tables protected by Row-Level Security. Seed data in `supabase/seed.sql`; setup instructions in `supabase/README.md`.
  - **Note:** app reads data via the Supabase anon key + RLS policies. No DB credentials in the app. SQL migrations must be applied manually (`supabase/README.md`).
- **Header account dropdown restyle** — redesigned to match updated design: items are Profile / Dashboard (admin-only, gated on `app_metadata.role === "admin"`) / Logout; visual style updated to match MoMorph spec.
- **i18n** — `profile.*` key namespace added to `messages/en.json` and `messages/vi.json`.

### 2026-06-08

#### Added
- **"Thể lệ" (Rules) modal** on SAA 2025 homepage — right-anchored scrollable dark modal, portal-rendered with focus trap and scroll lock. Describes 4-tier Kudos Hero badge system, 6 collectible icons, and National Kudos prize. Built from MoMorph design screen `b1Filzi9i6`.
  - Files: `app/_components/home/rules-modal.tsx`; badge/hero assets in `public/homepage/rules/` (10 images).
  - i18n keys under `home.rules.*` added to `messages/vi.json` and `messages/en.json`.
- **Floating widget button (WidgetButton) redesign** — rebuilt to match FAB design: collapsed pill expands to two option pills ("Thể lệ" + a second action) with a red close button. "Thể lệ" action opens the Rules modal. Shared `PenIcon` and `CloseIcon` extracted to `app/_components/home/icons.tsx`.
- **Homepage made fully public** — `/` added to `PUBLIC_PATHS` in middleware so unauthenticated users can access the homepage without being redirected to login.

### 2026-06-04

#### Added
- **Homepage SAA** (`/` — public, no auth required). Pixel-built from the MoMorph/Figma design.
  - Now public (added `/` to `PUBLIC_PATHS` in `lib/supabase/middleware.ts`); header controls adapt to auth state.
  - Sections: fixed header (logo + nav + language switcher; notification bell + account menu when signed in), keyvisual hero with **real env-date countdown** (`NEXT_PUBLIC_EVENT_DATETIME`, ISO-8601; hides "Coming soon" and shows `00 00 00` at the deadline; safe fallback on invalid value), event info, two CTAs, "Root Further" content, 6-card awards grid (links to `/awards#<slug>`), Sun* Kudos promo, floating quick-action widget, and footer.
  - Account menu shows Admin Dashboard only when the Supabase user's `app_metadata.role === "admin"` (role read from `app_metadata` only — never user-writable `user_metadata`).
  - Real signOut wired; notification panel + widget menu are UI shells (no notification backend yet). Nav targets `/awards`, `/kudos`, `/profile`, `/admin`, `/standards` are stub routes for later.
  - Assets in `public/homepage/`; components in `app/_components/home/`; shared helpers `lib/countdown.ts`, `lib/auth/current-user.ts`. Reuses the existing `LanguageSwitcher`.
  - Responsive (mobile/tablet/desktop) with hover/focus states; next-intl `home` namespace (vi/en).
- **Countdown / Prelaunch page** (`/countdown` — public, no auth required).
  - Full-screen decorative background with dark gradient overlay.
  - Client-side countdown timer (DAYS / HOURS / MINUTES, two-digit, days capped at 99, no seconds). Self-decrementing: starts at 99 days and ticks down one minute per 60s interval, looping back to 99 days at zero. `NEXT_PUBLIC_COUNTDOWN_TARGET` is reserved for a future real-date mode (not currently used).
  - Self-hosted DSEG7-Classic LED font (`public/fonts/DSEG7Classic-Bold.ttf`, `@font-face` in `globals.css`) for digit display.
  - next-intl `countdown.title` key added (vi/en).
  - Files: `app/countdown/page.tsx`, `app/countdown/_components/countdown-timer.tsx`.
- **Login + Google OAuth + i18n** — first feature in the repo.
  - Supabase Google OAuth via PKCE full-page redirect (`app/actions/auth.ts`, `app/auth/callback/route.ts`).
  - Route protection in `proxy.ts` (Next.js 16 interceptor convention): unauthenticated → `/login`, authenticated → `/`.
  - Cookie-based locale switching (vi/en) via next-intl; no URL routing (`i18n/`, `messages/`).
  - Server actions: `signInWithGoogle`, `signOut`, `setLocale`.
  - See `docs/auth-and-i18n.md` for setup instructions.

#### Fixed
- **Font assets intercepted by auth proxy** — `proxy.ts` matcher now excludes font file extensions (`woff`, `woff2`, `ttf`, `otf`, `eot`). Previously, self-hosted fonts on public pages were 307-redirected to `/login` for unauthenticated users.
