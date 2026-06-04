# Project Changelog

## [Unreleased]

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
