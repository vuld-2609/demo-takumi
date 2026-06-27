# Code Review — Homepage SAA 2025

**Branch:** feat/homepage  
**Date:** 2026-06-04

---

## Scope

- `app/page.tsx` + `app/_components/home/*.tsx` (11 files)
- `lib/auth/current-user.ts`, `lib/countdown.ts`
- `lib/supabase/middleware.ts` (patch only)
- `messages/{en,vi}.json`

---

## Overall Assessment

Implementation is solid. The auth boundary is correctly drawn at the server component level (getCurrentUser in SiteHeader RSC), hydration hazard is handled, and the middleware patch is safe. Two medium issues and one low worth fixing before merge; nothing critical.

---

## Critical Issues

None.

---

## High Priority

None.

---

## Medium Priority

### M1 — `user_metadata.role` fallback in current-user.ts is a privilege-escalation vector

`lib/auth/current-user.ts` lines 23-24: if `app_metadata.role` is absent, the code falls back to `user_metadata.role`. `user_metadata` is writable by the authenticated user via `supabase.auth.updateUser()`; a regular user can set their own `user_metadata.role = "admin"` and gain the Admin Dashboard link.

The fallback should be removed. If the admin flag must also live in user_metadata for legacy reasons, add an explicit Supabase RLS policy that prevents users from writing to `user_metadata.role`, and document the dependency here.

Fix:
```ts
const role = user.app_metadata?.role as string | undefined;
// Remove user_metadata fallback entirely.
```

### M2 — Notification badge always visible regardless of actual notifications

`header-controls.tsx` line 51: the red dot (`bg-[#D4271D]`) is hardcoded and always rendered, even though the panel shows "No notifications yet." Anonymous users never see this (correct), but authenticated users will always see a false positive badge. When the notification backend lands this will need a data-driven check; right now it creates a misleading affordance. Low-risk in isolation but will surface user complaints on day one if notifications ship.

Not strictly a bug given the shell is acknowledged, but flag for pre-launch backlog.

---

## Low Priority

### L1 — `suppressHydrationWarning` scope is one level too narrow

`home-countdown.tsx` line 84: `suppressHydrationWarning` is placed on the inner `<span>` (the LED digit text node). React's `suppressHydrationWarning` suppresses mismatch warnings only on the **direct** element's **text content** and does not propagate to parent elements. Since the server renders an initial `Date.now()` value and the client recomputes on mount, the mismatch is on that exact text node — so the placement is technically correct. However, the parent `<div role="img" aria-label="...">` also encodes the digit value in its `aria-label` (constructed from `twoDigits(value)` at server render time), and `suppressHydrationWarning` is NOT on that element. In practice React does not warn on attribute-only mismatches on non-text nodes, so this is safe today, but is fragile — if the aria-label ever moves to a text node it will start emitting warnings. Acceptable as-is; document the assumption.

### L2 — Menu items lack keyboard arrow-key navigation

`header-controls.tsx` and `widget-button.tsx`: menus use `role="menu"` / `role="menuitem"` (correct ARIA), and Escape is handled. However WCAG/ARIA menu pattern requires Up/Down arrows to move focus between menuitems. Without it, keyboard users must Tab through the entire document to reach the second item. Given the shell nature of these menus, acceptable for this task, but should be filed before accessibility audit.

### L3 — `NEXT_PUBLIC_EVENT_DATETIME` undocumented in `.env.local.example`

`lib/countdown.ts` reads `process.env.NEXT_PUBLIC_EVENT_DATETIME` but the `.env.local.example` still references only `NEXT_PUBLIC_COUNTDOWN_TARGET` (the reserved/unused variable from the prior countdown page). The new var has a sensible fallback so the page never crashes, but operators deploying this won't know the knob exists.

Fix: add to `.env.local.example`:
```
# ISO-8601 datetime for the homepage countdown (defaults to 2026-12-26T18:30:00+07:00 if unset).
NEXT_PUBLIC_EVENT_DATETIME=2026-12-26T18:30:00+07:00
```

### L4 — Translation keys `signatureCreator` and `mvp` have copy-paste placeholder text

`messages/en.json` lines for `awards.items.signatureCreator` and `awards.items.mvp` are identical to `bestManager`'s description: "Honoring managers with strong management skills who lead their teams." Same in `vi.json`. The awards page will display wrong descriptions for two of the six cards.

---

## Edge Cases Found

- **Clock skew on server vs client (countdown):** `TARGET_MS` is module-level, resolved once when the client chunk loads. `Date.now()` in the initial `useState` and in the `useEffect` both call the real clock; the `update()` call inside `useEffect` fires before the first interval tick, so the displayed value is always fresh after mount. Pattern is sound.
- **Middleware exact-match for `/`:** `pathname === "/"` is strict. Paths like `//` (double-slash) are normalised by Next.js before reaching the proxy, so no bypass risk there. The existing prefix-match for `/login`, `/auth`, `/countdown` is unchanged and unaffected.
- **`signOut` server action in `<form action={signOut}>`:** Next 16 App Router supports passing a server action directly as the `action` prop of a `<form>` from a client component. The compiled output confirms the action reference is serialised as a server reference ID. This is correct.
- **`useTranslations` in RSC (hero-section, awards-section, etc.):** next-intl v4 supports `useTranslations` in both RSC and client components via its plugin. The absence of `"use client"` on these files is intentional and correct — they are server components that use the RSC-compatible path of `useTranslations`. Verified via docs pattern and build output.
- **XSS:** No `dangerouslySetInnerHTML` anywhere. Translation values are rendered as React children (escaped). The `t("p1").split("\n")` pattern produces plain strings, not HTML.
- **Auth leak to anonymous:** `getCurrentUser()` returns `null` on no session; `SiteHeader` renders the Login link branch. `HeaderControls` (which contains bell, account menu, signOut) is never rendered for anonymous users. The isAdmin prop only controls the Admin Dashboard link within the already-authenticated branch. No leak path.

---

## Positive Observations

- `app_metadata` checked first before `user_metadata` — correct trust ordering.
- `getUser()` used (not `getSession()`) in middleware and current-user — correct per Supabase SSR docs.
- `setInterval` cleanup via returned function is correct; no timer leak.
- Click-away overlay + Escape key on both menus; `aria-expanded` toggled correctly.
- `aria-hidden` on decorative images, `aria-label` on icon-only buttons — good accessibility hygiene.
- `twoDigits()` clamps at 99 consistently with the two-box design constraint.
- `isPublicPath` exact-matches `/` with a clear comment — future maintainers won't accidentally open sub-routes.

---

## Recommended Actions (priority order)

1. **[M1 — fix before merge]** Remove `user_metadata.role` fallback in `current-user.ts`. Rely solely on `app_metadata.role`.
2. **[L4 — fix before merge]** Correct copy-paste award descriptions for `signatureCreator` and `mvp` in both `en.json` and `vi.json`.
3. **[L3 — fix before merge]** Add `NEXT_PUBLIC_EVENT_DATETIME` to `.env.local.example`.
4. **[M2 — backlog]** Drive notification badge from real data when backend lands.
5. **[L2 — backlog]** Add arrow-key navigation to ARIA menus before accessibility audit.

---

## Metrics

- Type Coverage: no `any` usages in changed files
- Linting: reported clean (per task context)
- Build: reported passing (per task context)
- Test Coverage: n/a (no tests in scope for this task)

---

## Unresolved Questions

- Is `user_metadata.role` used anywhere else in the app that would break if the fallback is removed? Grep shows only `current-user.ts` reads it.
- Are the correct award descriptions available from the design spec for `signatureCreator` and `mvp`? (Cannot confirm from code alone.)
