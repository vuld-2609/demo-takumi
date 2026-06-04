# Code Review — Login + Supabase Google OAuth + next-intl

**Date:** 2026-06-04
**Scope:** Login page UI, Supabase OAuth (PKCE), next-intl i18n (vi/en), proxy middleware
**Files reviewed:** 17 (see list below)
**Build/lint/tsc:** all pass (verified)

---

## Scope

| Area | Files |
|------|-------|
| UI | `app/login/page.tsx`, `_components/login-{header,hero,footer}.tsx`, `_components/language-{switcher,dropdown}.tsx` |
| Auth actions | `app/actions/auth.ts`, `app/auth/callback/route.ts` |
| Supabase clients | `lib/supabase/{client,server,middleware}.ts` |
| i18n | `i18n/{request,locale}.ts`, `messages/{vi,en}.json`, `app/layout.tsx`, `next.config.ts` |
| Middleware | `proxy.ts` |

---

## Overall Assessment

Solid implementation. PKCE flow is correct, auth redirect logic is loop-free, i18n wiring works. Main concerns are a medium-severity header-injection vector in the OAuth redirectTo construction, two missing error-feedback paths for users, and minor accessibility gaps. No critical issues.

---

## Critical Issues

None.

---

## High Priority

### H1 — `Origin` header used as OAuth `redirectTo` without allowlist validation
**File:** `app/actions/auth.ts:20-23`

```ts
const rawOrigin = headerStore.get("origin");
const forwardedHost = headerStore.get("x-forwarded-host");
const origin = rawOrigin ?? (forwardedHost ? `https://${forwardedHost}` : "http://localhost:3000");
// ...
redirectTo: `${origin}/auth/callback`,
```

**Why it matters:** `Origin` and `X-Forwarded-Host` are request headers — in a server-to-server or curl context they are attacker-controlled. A crafted `Origin: https://attacker.com` would send `redirectTo: https://attacker.com/auth/callback` to Supabase. Supabase's redirect URI allowlist is the last line of defense. If the allowlist is ever misconfigured (e.g. wildcard `*`), this becomes an open redirect post-OAuth. It also enables DoS: an injected origin that isn't in the allowlist will cause Supabase to reject the OAuth initiation, showing `oauth_init_failed` to legitimate users.

**Fix:** Read the app URL from an environment variable, fall back to the request-derived value only in local dev.

```ts
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  rawOrigin ??
  (forwardedHost ? `https://${forwardedHost}` : "http://localhost:3000");
```

Add `NEXT_PUBLIC_APP_URL=https://your-domain.com` to `.env.local.example` and deployment env. This eliminates header injection entirely in production.

---

## Medium Priority

### M1 — Auth error states silently dropped; user sees blank login with no feedback
**Files:** `app/actions/auth.ts:35`, `app/auth/callback/route.ts:22`

Both failure paths redirect to `/login?error=oauth_init_failed` and `/login?error=auth_callback_failed` respectively. The login page (`page.tsx` and all `_components/`) never reads `searchParams` or `useSearchParams()`. The error param is discarded silently.

**Why it matters:** When OAuth fails (Supabase misconfigured, network error, callback exchange fails), the user lands on the login page with no indication of what happened. They can get stuck clicking the button repeatedly.

**Fix:** In `login/page.tsx`, accept `searchParams` (it's a Server Component — use the `searchParams` prop) and pass an error message down to `LoginHero`, or render a small error banner at the top of the page.

```tsx
// page.tsx
export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  // pass `error` to LoginHero or render inline alert
}
```

### M2 — `open` prop on `LanguageDropdown` is dead code
**File:** `app/login/_components/language-dropdown.tsx:11,29,31`

The prop exists with default `true` and an early-return guard (`if (!open) return <></>`). The caller (`language-switcher.tsx:77`) always passes `open` explicitly AND gates the entire render with `{open && <LanguageDropdown ... open />}` — the guard inside the component is unreachable.

**Why it matters:** Dead interface surface that misleads future maintainers into thinking controlled open/close state is handled inside the component. Violates KISS.

**Fix:** Remove the `open` prop and its early-return from `LanguageDropdown`. The parent already controls visibility via conditional rendering.

### M3 — `aria-haspopup="listbox"` with no matching `listbox` role
**File:** `app/login/_components/language-switcher.tsx:39`

The trigger button declares `aria-haspopup="listbox"`, but the popup is a `<div>` containing `<button>` elements — there is no `role="listbox"` on the container and no `role="option"` on the items.

**Why it matters:** Screen readers announce "has popup: listbox" but then encounter a plain div with buttons, breaking the contract. NVDA/JAWS users will not identify the dropdown as a listbox and won't use the expected keyboard navigation (up/down arrows).

**Fix:** Either change `aria-haspopup="listbox"` to `aria-haspopup="true"` (generic popup), OR restructure the dropdown to use `role="listbox"` / `role="option"` semantics. Simplest fix: `aria-haspopup="true"`.

### M4 — No keyboard dismissal for dropdown (Escape key)
**Files:** `app/login/_components/language-switcher.tsx`, `language-dropdown.tsx`

The dropdown has a click-away overlay for mouse users but no `onKeyDown` handler for `Escape`. Keyboard-only users who open the dropdown with Enter/Space cannot close it without selecting an item.

**Fix:** Add to the trigger button in `language-switcher.tsx`:

```tsx
onKeyDown={(e) => {
  if (e.key === "Escape" && open) {
    e.preventDefault();
    setOpen(false);
  }
}}
```

### M5 — `lib/supabase/server.ts` and `middleware.ts` silently pass empty strings; no dev warning
**Files:** `lib/supabase/server.ts:10`, `lib/supabase/middleware.ts:26`

`lib/supabase/client.ts` emits a `console.warn` when env vars are missing. The server and middleware clients silently pass `""` with no warning. Any server-side Supabase call will fail with a cryptic network error instead of a clear "missing env vars" message.

**Fix:** Mirror the `client.ts` pattern — add a module-level guard with `console.warn` (or `console.error`) in both `server.ts` and `middleware.ts`:

```ts
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("[supabase/server] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}
```

---

## Low Priority

### L1 — `langName` message key defined in both catalogs but never consumed
**Files:** `messages/vi.json:7`, `messages/en.json:7`

`"langName": "VN"` / `"langName": "EN"` exist in the i18n catalogs. No component calls `t("login.langName")` — `language-switcher.tsx` hardcodes the label (`locale === "vi" ? "VN" : "EN"`).

**Fix:** Either remove the `langName` key from both JSON files, or use it in `language-switcher.tsx` (`const label = t("langName")`). The latter is more correct i18n practice.

### L2 — `next` query param in `/auth/callback` is unused infrastructure
**File:** `app/auth/callback/route.ts:8-16`

The callback reads a `next` param and validates it (`startsWith("/")`), but `signInWithGoogle` never sets `?next=...` on the `redirectTo` URL. The feature is dead.

**Why it matters:** The code implies the app supports post-auth deep-linking, but it doesn't. If a future dev adds `?next=/profile` to the redirect, it will work but was never tested. Not a bug but misleading.

**Fix:** Remove the `next` param handling (simplify to always redirect to `/`) OR document it as intentional reserved behavior. Prefer removal per YAGNI.

### L3 — `getUserLocale()` called twice per request in `app/layout.tsx`
**File:** `app/layout.tsx:28-29`

```ts
const locale = await getUserLocale();  // reads cookie
const messages = await getMessages();  // triggers i18n/request.ts → getUserLocale() again
```

`getMessages()` calls `getUserLocale()` internally via `getRequestConfig`. Two cookie reads per layout render.

**Fix:** Next.js `cookies()` is cached per request in the React cache, so this is not a correctness issue and has negligible performance impact. Optional cleanup: use `getLocale()` from `next-intl/server` for the `html lang=` attribute instead of calling `getUserLocale()` directly, eliminating the duplicate.

### L4 — Hardcoded `80px` header height creates invisible coupling
**File:** `app/login/page.tsx:50`

```ts
style={{ padding: "96px 144px", paddingTop: "calc(80px + 96px)" }}
```

The `80px` matches the header's `height: "80px"` in `login-header.tsx`. Changing the header height without updating this calc will break the layout silently.

**Fix:** Extract to a shared CSS custom property (e.g., `--header-height: 80px` in `globals.css`) and reference it in both places. Low impact on a page-only design.

### L5 — Unnecessary `as string` cast on `data.url`
**File:** `app/actions/auth.ts:39`

The guard at line 34 (`if (error || !data.url)`) ensures `data.url` is non-null at line 39, but TypeScript does not narrow past the `redirect()` throw. The cast `redirect(data.url as string)` is harmless and the comment explains it, but could be avoided by extracting the URL before the guard: `const url = data.url; if (!url || error) { redirect(...) } redirect(url);`.

---

## Edge Cases Found (Scouting Phase)

- **Authed user + `/login?error=...`:** Middleware (`pathname === "/login"`) redirects authenticated users to `/`. Error param is silently discarded. Acceptable UX — an authenticated user shouldn't see auth errors — but worth documenting. (Covered under M1.)
- **Supabase unreachable in middleware:** `getUser()` returns `{user: null}` on network error, causing unauthenticated treatment. All requests to protected routes get bounced to `/login` when Supabase is down — safe fail-closed behavior.
- **Locale cookie tampered to invalid value:** `getUserLocale()` validates strictly (`value === "vi" || value === "en"`) and falls back to `"vi"`. The dynamic `import(`../messages/${locale}.json`)` is safe — no arbitrary file inclusion possible.
- **`/auth/callback` without `?code`:** Handled — falls through to the error redirect. Correct.
- **Double-click on login button:** `useTransition` + `disabled={isLoading}` prevents concurrent action calls. Correct.

---

## Positive Observations

- PKCE flow is implemented correctly: server client generates the code verifier, `exchangeCodeForSession` completes the exchange. Cookie mutation in middleware (`setAll` on `supabaseResponse`) follows the official `@supabase/ssr` pattern exactly.
- `isPublicPath` correctly gates `/auth/callback` as public so the callback handler isn't auth-blocked.
- `async cookies()` / `async headers()` are correctly awaited — no Next 15+ compatibility issues.
- Middleware authed-on-`/login` redirect uses `pathname === "/login"` (not `startsWith`) — intentional; `/login?error=...` query string is not in `pathname`, so no loop when error redirect lands on login.
- `useTransition` wrapping the server action in `LoginHero` is the correct pattern for React 19 — `pending` state drives the spinner, and navigation-on-redirect is handled correctly.
- Locale cookie guard in `getUserLocale()` (validates exact strings) prevents path traversal in the dynamic `import()`.
- `server.ts` `setAll` silently ignores throws in non-mutable contexts (Server Components) — correct pattern per official Supabase SSR docs.
- `login-footer.tsx` correctly uses `useTranslations` as a Server Component (no `"use client"` needed in next-intl v4).

---

## Recommended Actions (Prioritized)

1. **(H1)** Add `NEXT_PUBLIC_APP_URL` env var and use it as the OAuth `redirectTo` base.
2. **(M1)** Read `searchParams.error` in `login/page.tsx` and render a visible error message.
3. **(M3)** Fix `aria-haspopup` value to match actual DOM structure.
4. **(M4)** Add Escape key handler to close dropdown.
5. **(M5)** Add `console.warn` for missing env vars in `server.ts` and `middleware.ts`.
6. **(M2)** Remove dead `open` prop from `LanguageDropdown`.
7. **(L1)** Remove unused `langName` keys or consume them.
8. **(L2)** Remove unused `next` param logic from `/auth/callback` per YAGNI.

---

## Metrics

- Type Coverage: 100% (strict, no `any`)
- Linting Issues (feature files): 0
- TSC errors: 0
- Test Coverage: Playwright E2E (visual + i18n flow) — no unit tests

---

## Unresolved Questions

1. Is `next` param in `/auth/callback` intentionally reserved for future deep-link use, or can it be removed?
2. Should the login page display error messages for `?error=oauth_init_failed` / `?error=auth_callback_failed`, and if so, what copy?
3. Is the `langName` i18n key planned for future use (e.g., accessible label), or safe to delete?
