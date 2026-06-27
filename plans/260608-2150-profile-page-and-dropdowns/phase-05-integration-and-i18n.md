# Phase 05 — Integration + i18n

**Priority**: High · **Status**: Complete · Join point (depends on [phase-02](phase-02-data-layer-and-types.md) + [phase-03](phase-03-profile-page-ui.md))
Context: [plan.md](plan.md)

## Goal
Replace mock props in the profile page with real Supabase data, and localize all labels EN + VI.

## Steps
1. `app/profile/page.tsx`: `getCurrentUser()` → if null `redirect('/login')`; else call
   `getProfile`, `getProfileStats`, `getKudosFeed(userId,'received')` + `'sent'`; pass to components.
2. Kudos filter: pass both feeds; client `kudos-section` toggles sent/received and shows count in label.
3. i18n: add `profile.*` namespace to `messages/en.json` + `messages/vi.json` — stat labels, section
   titles ("KUDOS", caption), filter ("Đã gửi"/"Đã nhận"), "Mở Secret Box", "Bộ sưu tập icon của tôi",
   "Copy Link", empty states. Mock seed content (names/messages) stays as-is. Use `useTranslations`/`getTranslations`.
4. Empty/zero states: zero counts, empty feed message, missing avatar fallback, not-earned icon slots.
5. Auth gate: ensure `/profile` requires login (page redirect; confirm `proxy.ts` matcher covers it or rely on page guard).

## Files to modify
- `app/profile/page.tsx`, `app/profile/_components/*` (swap mock → props/i18n)
- `messages/en.json`, `messages/vi.json`

## Todo
- [x] Real data wired; filter works; redirect when unauthenticated
- [x] EN + VI keys complete; no hardcoded UI labels
- [x] Empty/zero/fallback states
- [x] `npx tsc --noEmit` clean

## Success criteria
`/profile` shows real seeded data when DB applied; zeros/empties otherwise; both locales correct.

## Risks
Seed not yet applied by user → page must still render (zeros/empty), not crash. Server/client boundary for filter.
