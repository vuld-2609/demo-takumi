# Code Review — Award System (/he-thong-giai)

**Date:** 2026-06-27  
**Score:** 7.5 / 10  
**Counts:** Critical: 0 · High: 2 · Medium: 4 · Low: 2

---

## Scope

| File | Lines | Status |
|---|---|---|
| `app/he-thong-giai/page.tsx` | 95 | NEW |
| `app/he-thong-giai/award-data.ts` | 72 | NEW |
| `_components/award-nav.tsx` | 67 | NEW |
| `_components/award-card.tsx` | 104 | NEW |
| `_components/award-icons.tsx` | 32 | NEW |
| `_components/award-kudos-banner.tsx` | 67 | NEW |
| `app/_components/home/site-header.tsx` | 73 | MODIFIED |
| `app/_components/home/header-controls.tsx` | — | MODIFIED |
| `app/_components/home/icons.tsx` | 126 | MODIFIED |
| `app/_components/home/rules-modal.tsx` | — | MODIFIED |
| `messages/vi.json` + `en.json` | — | MODIFIED |

---

## High Priority

### H1 — Scroll-spy last section de-activates at page bottom

**File:** `_components/award-nav.tsx:23`

The `rootMargin: "-30% 0px -55% 0px"` creates a 15%-wide active zone between 30% and 45% from the top of the viewport. When the user scrolls to the very bottom of the page, the last section (`mvp`) top may be positioned *above* the 30% threshold (e.g., at 20–25% from top because there is nothing below to push it further down). At that point the section's top *exits* the active zone (crosses back above the -30% margin line) and `setActive` is never called again — so the MVP nav item de-highlights when the user is looking directly at it.

**Fix:** Detect scroll-at-bottom and lock to the last section, or adjust the bottom margin from `-55%` to `-40%` to widen the window. A lightweight alternative:

```tsx
useEffect(() => {
  const onScroll = () => {
    const atBottom =
      window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
    if (atBottom) setActive(items[items.length - 1]?.key ?? "");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}, [items]);
```

Add this alongside the existing `IntersectionObserver` effect.

---

### H2 — `prefers-reduced-motion` not respected

**File:** `_components/award-nav.tsx:39`

```ts
document.getElementById(`award-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
```

Users who have set "reduce motion" in their OS will still receive smooth-scroll animation. WCAG 2.3.3 (AAA) and best practice require respecting this preference.

**Fix:**
```ts
const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ? "auto"
  : "smooth";
document.getElementById(`award-${key}`)?.scrollIntoView({ behavior, block: "start" });
```

---

## Medium Priority

### M1 — `aria-current="true"` is semantically weak

**File:** `_components/award-nav.tsx:52`

`aria-current="true"` is technically valid per ARIA 1.1 but conveys no semantic meaning beyond a boolean. For a navigation context, `aria-current="location"` is the correct token (indicates the target represents the current location within a set of related items in a web process).

**Fix:** `aria-current={isActive ? "location" : undefined}`

---

### M2 — Unlabeled `<section>` landmarks

**Files:** `_components/award-card.tsx:87`, `_components/award-kudos-banner.tsx:24`

All 6 award cards and the Kudos banner use `<section>` without `aria-label` or `aria-labelledby`. Screen readers will announce them as unnamed regions, making landmark navigation confusing (7 entries all showing as "section").

Each `<section>` already has an `<h3>` with the award title. Adding `aria-labelledby` pointing to that heading resolves it with no HTML changes beyond IDs.

**Fix (award-card.tsx):** Add `id={`${id}-title`}` to the `<h3>` and `aria-labelledby={`${id}-title`}` to the `<section>`.

---

### M3 — No mobile jump-navigation

The sticky left nav is `hidden lg:block`. On viewports below `lg` (< 1024px), users get no way to jump between categories and must scroll the full page. This is a UX gap, not a blocking accessibility failure (all content is linearly reachable), but worth addressing before wider release.

**Fix options:** a horizontal scrollable pill-row nav at the top of the award section (mobile only), or a `<select>` dropdown that calls `scrollIntoView`. Low implementation cost.

---

### M4 — Header nav active state hardcoded

**File:** `app/_components/home/site-header.tsx:18-20`

`active` is hardcoded: `/` = `true`, all others = `false`. When the user is on `/he-thong-giai`, the "Hệ thống giải" nav link shows no gold underline or glow, meaning the nav gives no visual indication of current location. The `aria-current="page"` attribute is also missing on the active link when viewing the awards page.

**Fix:** Use `usePathname()` (client component wrapper or pass `pathname` from server layout) to derive `active` dynamically.

Note: this pattern pre-exists this feature; the fix should be applied to `site-header.tsx` globally, not just the awards link.

---

## Low Priority

### L1 — `/kudos` route is a stub

**File:** `_components/award-kudos-banner.tsx:47`

`href="/kudos"` leads to a 404. This is pre-existing and intentional (the route is also listed in the header nav as a known stub per changelog). Document when this will be implemented to avoid regressing, or replace with `href="#"` + `aria-disabled` until the route exists.

---

### L2 — Inconsistent mobile card order

**File:** `_components/award-card.tsx:91-99`

On mobile (`flex-col`):
- `imageOnLeft=true` (cards 0, 2, 4): image renders **above** text
- `imageOnLeft=false` (cards 1, 3, 5): text renders **above** image

The alternation is intentional on desktop, but on mobile it creates inconsistent reading order. Consider always placing the image above text on mobile for a consistent single-column experience.

---

## Positive Observations

- **IntersectionObserver logic is sound.** Teardown via `observer.disconnect()` in the cleanup function is correct. Callback correctly guards `visible[0]` before calling `setActive`. Sort by `boundingClientRect.top` correctly resolves simultaneous multi-section intersection.
- **SSR safety correct.** `"use client"` on `award-nav.tsx` ensures `IntersectionObserver` and `document` are only accessed in the browser.
- **No XSS vectors.** No `dangerouslySetInnerHTML` anywhere in the feature.
- **i18n complete.** All keys referenced in `page.tsx` (`heroAlt`, `nav.*`, `awards.*.title/description`, `quantityLabel`, `prizeLabel`, `units.*`, `prizeNotes.*`, `or`, `kudos.*`) verified present in both `vi.json` and `en.json`.
- **Empty prize note handled.** `prizeNotes.none = ""` renders correctly — `{prize.note && <p>…</p>}` short-circuits on empty string.
- **DRY.** Reuses `ArrowUpRight` from `home/icons`, `SiteHeader`/`SiteFooter`, and shares the `#FFEA9E`/`#00101A` color tokens consistently.
- **File sizes.** All files under 200 lines.
- **`rules-modal.tsx` change is a correct simplification.** Replacing `useState(mounted)` with `typeof document === "undefined"` guard is safe — `open` is always `false` at SSR time (parent `useState(false)`), and the `typeof` guard provides belt-and-suspenders protection.
- **Auth protection correct.** `/he-thong-giai` is not in `PUBLIC_PATHS`; unauthenticated users are redirected to `/login` by the proxy middleware.

---

## Recommended Actions (priority order)

1. **[H1]** Add scroll-at-bottom detection to lock active to the last nav item when the user reaches the page bottom.
2. **[H2]** Respect `prefers-reduced-motion` in `handleClick` scroll behavior.
3. **[M1]** Change `aria-current="true"` → `aria-current="location"` in `award-nav.tsx`.
4. **[M2]** Add `aria-labelledby` to each `<section>` in `award-card.tsx` and `award-kudos-banner.tsx`.
5. **[M4]** Make `SiteHeader` active state dynamic (use `usePathname`).
6. **[M3]** Add mobile category jump-nav (horizontal pills or select).

---

## Unresolved Questions

- Is `/kudos` planned for the current sprint or a future milestone? If near-term, the banner CTA is fine. If far-off, consider `aria-disabled` on the link.
- Is the inconsistent mobile card order (L2) intentional per design spec, or an oversight?

---

**Status:** DONE_WITH_CONCERNS  
**Summary:** Feature is functionally complete, builds clean, no XSS or auth issues. Two high-priority scroll-spy and motion accessibility gaps should be fixed before release.  
**Concerns:** H1 (last section de-activates at page bottom) is the headline requirement's main edge case and should be verified manually on a real device before merge.
