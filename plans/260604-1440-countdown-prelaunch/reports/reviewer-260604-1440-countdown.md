---
reviewer: reviewer-agent
date: 2026-06-04
scope: app/countdown/page.tsx, app/countdown/_components/countdown-timer.tsx, app/globals.css, proxy.ts, lib/supabase/middleware.ts, messages/{en,vi}.json, .env.local.example
build: tsc --noEmit EXIT:0, eslint EXIT:0
---

# Code Review — Countdown / Prelaunch Page

## Scope
- Files: 7 (listed above)
- Focus: countdown correctness, hydration, proxy security, a11y, architecture

---

## Overall Assessment

Implementation is solid. TypeScript and ESLint pass clean. Core countdown logic is correct for all spec'd edge cases. Two medium-priority issues (a11y gap, `value > 0` code smell) and one suggestion (days-overflow doc). No critical or high-severity issues.

---

## Critical Issues

None.

---

## High Priority

None.

---

## Medium Priority

### M1 — Accessibility: no aria-label on CountdownUnit digits
**File:** `app/countdown/_components/countdown-timer.tsx` lines 87–108

Screen readers will announce each `DigitBox` char individually ("9", "9") and the `label` text separately, giving a nonsensical reading like "nine nine DAYS". The `CountdownUnit` wrapper has no ARIA grouping or readable text.

**Fix:** Add `aria-label` to the outer digit row `<div>`:
```tsx
<div
  className="flex flex-row items-center"
  style={{ gap: "21px" }}
  aria-label={`${twoDigits(value)} ${label}`}
  role="img"
>
```
Then mark each `<span>` inside `DigitBox` with `aria-hidden` so individual characters are suppressed. This groups the semantic "05 DAYS" as a single accessible unit.

---

### M2 — Code smell: `value > 0` in `twoDigits` should be `value >= 0`
**File:** `app/countdown/_components/countdown-timer.tsx` line 35

```ts
const safe = Number.isFinite(value) && value > 0 ? Math.min(value, 99) : 0;
```

The intent is "valid, finite, non-negative integer". Using `> 0` excludes `0` from the `Math.min` branch, falling to `safe = 0` — which is numerically identical but misleading. For `value = 0`, the result is still `"00"` (correct), but the condition makes `0` look like an error case. A reader may infer the function rejects zero when it actually intends to display it.

**Fix:**
```ts
const safe = Number.isFinite(value) && value >= 0 ? Math.min(value, 99) : 0;
```
No behavioral change; improves intent clarity.

---

## Low Priority

### L1 — Days clamping is implicit / undocumented
**File:** `app/countdown/_components/countdown-timer.tsx` line 33–36

`getRemaining` returns raw `days` (e.g. 200 for a far-future date). Clamping to 99 happens silently inside `twoDigits`. This is correct (design has 2 digit boxes → max 99), but the split responsibility is non-obvious. Consider a comment at the call site or a brief JSDoc on `twoDigits` noting the 99-cap:

```ts
/** Clamp to 0-99 and pad to two digits (invalid/negative/overflow → "00"/"99"). */
```

---

### L2 — `targetMs` IIFE re-executes on every render
**File:** `app/countdown/_components/countdown-timer.tsx` lines 42–46

The IIFE inside the component body runs on every render, though `Date.parse` is cheap and the result is stable. Idiomatic pattern is to hoist to module level (alongside `FALLBACK_TARGET`) so it parses once at module load, identical to how `montserrat` is hoisted. Minor, but consistent with existing style.

```ts
// Module level
const RAW_TARGET = process.env.NEXT_PUBLIC_COUNTDOWN_TARGET || FALLBACK_TARGET;
const targetMs = Number.isNaN(Date.parse(RAW_TARGET))
  ? Date.parse(FALLBACK_TARGET)
  : Date.parse(RAW_TARGET);
```

---

## Edge Cases Verified

| Check | Result |
|---|---|
| `twoDigits(0)` | `"00"` — correct (0 > 0 false → safe=0) |
| `twoDigits(-1)` | `"00"` — correct |
| `twoDigits(NaN)` | `"00"` — correct (isFinite guard) |
| `twoDigits(100)` | `"99"` — clamped correctly |
| `getRemaining` elapsed target | `{days:0,hours:0,minutes:0}` — correct (Math.max) |
| `getRemaining` 200 days | days=200 (raw) → twoDigits→"99" |
| `Date.parse("")` | NaN → falls back to FALLBACK_TARGET |
| `Date.parse(" ")` | NaN → falls back to FALLBACK_TARGET |
| Hours range 0–23 | `% 24` correct |
| Minutes range 0–59 | `% 60` correct |
| Pre-mount `remaining=null` | `parts={days:0,...}` → all "00" — no hydration mismatch |
| NaN propagation if IIFE fails | `twoDigits(NaN)→"00"` safe |

---

## Security / Auth Review

### Proxy matcher regex
`/((?!_next/static|_next/image|favicon\.ico|sitemap\.xml|robots\.txt|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|eot)$).*)/`

- Font extensions excluded from proxy: correct. `.ttf` for DSEG7 will not hit `updateSession`.
- The `$` anchor on font extensions is in the right place (end of the full lookahead). No legitimate app route ends in `.ttf` — no false-exclusion risk.

### PUBLIC_PATHS scoping
`isPublicPath` uses `pathname === p || pathname.startsWith(p + "/")`:
- `/countdown` → PUBLIC
- `/countdownXYZ` → PROTECTED (no prefix-leak)
- `/countdown-admin` → PROTECTED
- `/countdown/` → PUBLIC (intentional sub-path allowance)

Scoping is correct. No auth bypass via path manipulation.

### Supabase env vars missing
`middleware.ts` line 26: `supabaseUrl ?? ""` — if `NEXT_PUBLIC_SUPABASE_URL` is unset, `createServerClient` receives `""`. This will throw or silently fail on protected routes. Pre-existing issue, out of scope, but worth noting.

---

## Hydration

`remaining` initializes to `null`; pre-mount renders `{days:0,hours:0,minutes:0}`. Server renders nothing (client component, `"use client"`), so there is no SSR string to mismatch. First-paint shows "00" for all digits until the first `useEffect` tick (~16ms after mount). This is the spec'd behavior (clarifications.md confirms). No hydration warning risk.

---

## Font / CSS

- `@font-face` in `globals.css` with `format("truetype")` for `.ttf` — correct format string.
- `font-display: swap` — correct; avoids FOIT.
- `font-weight: 700` declaration matches the `CountdownTimer` inline style `fontWeight: 700`. Consistent.
- `DigitBox` background layer has `aria-hidden` — correct.
- DSEG7 font not loaded via `next/font/local` — this is intentional (self-hosted TTF pre-dates the component, font is in `/public/fonts/`). The `@font-face` in CSS approach works; no issue.

---

## Positive Observations

- `getRemaining` + `twoDigits` separation is clean and testable.
- `Math.max(0, diff)` correctly prevents negative diff without extra branching.
- `Number.isNaN` guard on `Date.parse` is correct (not `isNaN` which coerces).
- `aria-hidden` on decorative `Image` and gradient overlay.
- `PUBLIC_PATHS` guard with `+ "/"` suffix is the correct pattern to prevent `/countdownXYZ` leak.
- Font file and image asset confirmed present in `/public`.
- `useEffect` cleanup with `clearInterval` — no interval leak.
- `targetMs` in `useEffect` dependency array — correct (though it never changes in practice).

---

## Metrics

- TypeScript errors: 0
- ESLint errors/warnings: 0
- File sizes: page.tsx 41 lines, countdown-timer.tsx 147 lines — both within 200-line limit
- Test coverage: not assessed (Playwright e2e confirmed by implementer)

---

## Unresolved Questions

1. **Days > 99 UX decision**: When `days > 99`, the display shows "99" silently. Should the app show a message like "99+ days" or just cap at "99"? The design only has 2 digit boxes so capping is correct per spec, but a far-future target will appear stuck at 99 for a long time. Worth documenting as intentional in a comment or the `.env.local.example`.
2. **`/countdown` sub-paths**: `isPublicPath` allows `/countdown/*`. If future routes are added under `/countdown/` (e.g. `/countdown/register`), they would inherit public access without a deliberate `PUBLIC_PATHS` update. Low risk now since no such routes exist.
