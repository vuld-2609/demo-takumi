# Plan — Login Page + Supabase Google Auth

**Status: COMPLETE**

**Feature:** SAA 2025 Login screen (Figma/MoMorph) with Supabase Google OAuth + VN/EN i18n.
**Stack:** Next.js 16.2.7 (App Router), React 19, Tailwind v4, TypeScript, @supabase/ssr, next-intl (cookie-based).
**Screens:** Login `GzbNeVGJHz`, Language Dropdown `hUyaaugye2` (file `9ypp4enmFmdK3YAFJLIu6C`).

## Decisions
See [clarifications.md](./clarifications.md). Key: scaffold Supabase (no project yet) + `.env.local.example`; post-login → `/`; full next-intl (vi default + en) via cookie, no URL routing; proxy.ts (Next 16 renamed) refreshes session + redirects authed↔unauthed; PKCE callback at `/auth/callback`.

## Two-Track Execution (MoMorph protocol — A and B run concurrently, no blocking)

### Track A — UI (parallel `implementer` agents, design-authoritative)
- [x] **A1 — Login screen UI** — `app/login/page.tsx` + `_components/{login-header,login-hero,login-footer}.tsx`
- [x] **A2 — Language dropdown UI** — `app/login/_components/language-dropdown.tsx`

### Track B — Backend (orchestrator-led, delegated to `implementer`)
- [x] **B1 — Supabase + i18n + proxy infra** — `lib/supabase/{client,server,proxy}.ts`, `app/auth/callback/route.ts`, `app/actions/{auth,locale}.ts`, `i18n/{request,locale}.ts`, `messages/{vi,en}.json`, edits to `app/layout.tsx` + `next.config.ts`, `.env.local.example`

### Integration (orchestrator — no hard merge point, incremental)
- [x] **INT — Wire UI ↔ backend** — login button → `signInWithGoogle` server action with `useTransition`; language switcher ↔ `language-dropdown` client component + `setLocale` action; all strings via `useTranslations('login')`; error handling from `?error` searchParams

## Quality gates
- [x] Typecheck/lint clean
- [x] Production build clean
- [x] Live visual validation vs MoMorph (Playwright: login page + dropdown open + locale switch VN→EN)
- [x] Reviewer DONE_WITH_CONCERNS → H1, M1, M3/M4 fixed; L1-L4, M2/M5 deferred as low-priority

## Delivered / Limitations
- Decorative background artwork: not exportable via MoMorph MCP (get_figma_image 500s); user supplied `public/login/bg-keyvisual.png` (1440×1022), wired as a CSS background layer under the gradients
- Login button label corrected to 22px/28px Montserrat 700 (was 14px) with icon 8px after text
- Unit test harness not set up (project has no test framework; verified via build/typecheck/lint/visual)
- Validation screenshots in `reports/validation/`

## Assets & design data
- Assets: `public/login/` (saa-logo, flag-vn, flag-en, chevron-down, google-icon, root-further)
- Design spec: [reports/design-spec.md](./reports/design-spec.md) · refs: `reports/login-reference.png`, `reports/dropdown-reference.png`
