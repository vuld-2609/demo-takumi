# Countdown / Prelaunch Page — Plan

**Status:** COMPLETE  
**Feature:** MoMorph screen "Countdown - Prelaunch page" (8PJQswPZmU, file 9ypp4enmFmdK3YAFJLIu6C)  
**Route:** `/countdown` (PUBLIC)  
**Completed:** 2026-06-04

---

## Overview

Full-screen countdown timer for a pre-launch/event page. Displays days, hours, and minutes in LED-style digits (DSEG7 font), with a decorative background image and dark gradient overlay. Target datetime read from env var `NEXT_PUBLIC_COUNTDOWN_TARGET` (ISO 8601 with timezone).

---

## Key Decisions

| Question | Answer |
|----------|--------|
| Countdown target | Env var `NEXT_PUBLIC_COUNTDOWN_TARGET` (ISO 8601); fallback to 2026-12-31T18:00:00+07:00 |
| Route + Auth | `/countdown`, PUBLIC (added to `proxy.ts` public paths) |
| LED font | DSEG7-Classic (open-source TTF), self-hosted in `/public/fonts/` |
| i18n | Title translated via next-intl (vi/en); unit labels (DAYS/HOURS/MINUTES) English per design |
| Units | Days/Hours/Minutes only (no seconds); 2-digit display per unit, leading zero, clamped 00–99 |
| Root cause fix | Proxy matcher was redirecting font requests (307) — added `woff|woff2|ttf|otf|eot` exclusions |

---

## Files Delivered

| File | Purpose | Status |
|------|---------|--------|
| `app/countdown/page.tsx` | Root countdown page (layout + bg) | ✅ |
| `app/countdown/_components/countdown-timer.tsx` | Timer logic, LED units, hydration | ✅ |
| `app/globals.css` | @font-face for DSEG7 TTF | ✅ |
| `public/fonts/DSEG7Classic-Bold.ttf` | LED 7-segment font file | ✅ |
| `public/countdown/bg-prelaunch.png` | Full-screen decorative background | ✅ |
| `proxy.ts` | Added font extensions to exclusion matcher | ✅ |
| `lib/supabase/middleware.ts` | Added `/countdown` to PUBLIC_PATHS | ✅ |
| `messages/en.json` | "The event starts in" title | ✅ |
| `messages/vi.json` | "Sự kiện sẽ bắt đầu sau" title | ✅ |
| `.env.local.example` | Documented `NEXT_PUBLIC_COUNTDOWN_TARGET` | ✅ |

---

## Quality Gates — All Passing

| Gate | Result | Evidence |
|------|--------|----------|
| TypeScript compile | `tsc --noEmit` EXIT:0 | ✅ Clean |
| ESLint lint | All feature files | ✅ Clean |
| Production build | Next.js build | ✅ Clean |
| Route accessibility | GET `/countdown` | 200, no auth redirect |
| Visual — background | Full-bleed decorative image | ✅ Verified (screenshot) |
| Visual — gradient | Dark cover gradient overlaid | ✅ Verified (screenshot) |
| Visual — LED digits | DSEG7 font rendering | ✅ Confirmed (zoom validation) |
| Countdown tick | Updates every 1s (useEffect) | ✅ Live-tested |
| Days clamping | >99 displays "99" | ✅ Verified (200-day test) |
| Hydration | Pre-mount `remaining=null` → `{0,0,0}` | ✅ No mismatch |
| a11y (M1) | `aria-label` on digit row grouping digits | ✅ Fixed |

---

## Code Review Summary

Reviewer (`reviewer-agent`, 2026-06-04):
- **Critical issues:** None
- **High-priority issues:** None
- **Medium-priority issues:** 2 (both fixed)
  - M1: Missing `aria-label` on CountdownUnit digits — **FIXED** in deployed code
  - M2: `value > 0` should be `>= 0` for clarity — **FIXED** in deployed code
- **Low-priority issues:** 2 (documentation/UX notes, no code fix needed)
  - L1: Days clamping to 99 is implicit (design constraint, noted in JSDoc)
  - L2: targetMs IIFE re-runs per render (low-impact, idiomatic pattern noted)

Full review: `plans/260604-1440-countdown-prelaunch/reports/reviewer-260604-1440-countdown.md`

---

## Notable Details

- **Font 307-redirect bug (fixed):** Proxy matcher was treating all `/fonts/*` requests as protected routes, redirecting to login. Root cause: regex didn't exclude font extensions. Solution: added `woff|woff2|ttf|otf|eot` to the static-file exclusion list.
- **Days limit:** Design has 2 digit boxes per unit → max display is "99 DAYS". Far-future dates (>99 days) silently cap at 99; no "99+" indicator per spec.
- **Hydration strategy:** Component is `"use client"`; initial render pre-mount shows all zeros, then first `useEffect` tick (~16ms) sets real countdown. No SSR/client mismatch.
- **No unit tests:** Project has no Jest/unit-test harness; validation via Playwright e2e (implementer report) + manual build/lint.

---

## Next Steps / Unresolved

- No unresolved items. Feature is COMPLETE and ready for production.
- Clarifications doc: `plans/260604-1440-countdown-prelaunch/clarifications.md`
- Validation screenshots: `plans/260604-1440-countdown-prelaunch/reports/validation/`

---

**Status:** DONE  
**Summary:** Countdown / Prelaunch page implemented, reviewed, and deployed. All quality gates passing; reviewer concerns addressed. Ready for production.
