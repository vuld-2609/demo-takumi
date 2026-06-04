# Project Changelog

## [Unreleased]

### 2026-06-04

#### Added
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
