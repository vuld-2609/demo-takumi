---
name: reviewer-260608-2153-thele-modal
description: Code review for "Thể lệ" rules modal — rules-modal.tsx + widget-button.tsx
metadata:
  type: report
  date: 2026-06-08
---

## Code Review: "Thể lệ" (Rules) Modal

### Scope
- Files: `app/_components/home/rules-modal.tsx` (NEW, 172 LOC), `app/_components/home/widget-button.tsx` (MODIFIED, 125 LOC)
- Locales: `messages/vi.json`, `messages/en.json`
- Assets: `public/homepage/rules/` (10 PNGs — 4 hero + 6 badge)

### Overall Assessment
Solid implementation with clean Tailwind conventions and correct i18n coverage. One structural bug (stacking context) could visually clip the modal under the site header in production. Two accessibility gaps (focus trap, focus return) are WCAG failures. Everything else is minor or positive.

---

### Critical Issues

None.

---

### High Priority

**H1 — Stacking context: modal may render beneath the site header**

`RulesModal` renders a `fixed inset-0 z-[60]` element, but it is a **child** of the widget's `fixed z-50` wrapper:

```tsx
// widget-button.tsx line 26–27
<div className="fixed bottom-6 right-6 z-50 ...">
  <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
```

A `fixed` element with `z-index` creates a stacking context. Children of that context are compared to each other, not to the page root. So the modal's effective stacking level is `z-50 > internal z-60`, which is **not** `z-60` at page level. The site header (`z-50`) and its dropdowns (`z-50`) are siblings at the root level and will paint on top of the modal backdrop on any browser that respects the spec (all modern ones do).

Fix: render `RulesModal` at the `page.tsx` root level (or hoist state there), so its `fixed z-[60]` is compared directly against `z-50` siblings. Alternatively, use `createPortal(…, document.body)` inside the modal.

---

**H2 — No focus trap on the dialog**

`role="dialog"` + `aria-modal="true"` is present, but nothing prevents Tab from leaving the panel and activating background content. WCAG 2.1 SC 2.1.2 requires keyboard focus to remain within a modal dialog while it is open. Screen-reader users relying on `aria-modal` will expect Tab to stay inside; sighted keyboard users will find focus escaping to the page behind the backdrop.

Fix: use a lightweight focus-trap hook (e.g. `focus-trap-react`, or a 15-line custom implementation) that queries all focusable descendants and wraps Tab/Shift+Tab.

---

**H3 — No focus restoration on modal close**

When the modal closes (via Escape, backdrop, or "Đóng"), focus is not programmatically returned to the trigger button (the "Thể lệ" pill). Keyboard and AT users lose their position in the page.

Fix: store a `triggerRef` (or `document.activeElement`) just before opening, and call `.focus()` on it in the close handler.

---

### Medium Priority

**M1 — `onClose` inline arrow causes unnecessary `useEffect` re-runs**

`widget-button.tsx` passes `onClose={() => setRulesOpen(false)}` — a new function reference on every render. `rules-modal.tsx` lists `onClose` in its `useEffect` dep array `[open, onClose]`. While this does not cause a memory leak (the cleanup removes the old listener), it re-attaches the `keydown` listener on every parent render while the modal is open.

Fix: wrap the passed handler in `useCallback` inside `widget-button.tsx`:
```tsx
const closeRules = useCallback(() => setRulesOpen(false), []);
<RulesModal open={rulesOpen} onClose={closeRules} />
```

**M2 — "Viết KUDOS" placeholder button gives no AT indication it is non-functional**

The footer's second button has no `onClick`, no `disabled` attribute, and no `aria-disabled="true"`. Screen-reader users will encounter an interactive button that does nothing when activated, with no explanation. If the intent is "coming soon", either `disabled` or `aria-disabled="true"` with a tooltip/description is appropriate.

**M3 — Collectibles data defined after `useTranslations` but before the early return**

`heroTiers` and `collectibles` arrays are constructed on lines 40–55, **after** `useTranslations` but **before** the `if (!open) return null` guard on line 38 … wait, the guard is on line 38, arrays on lines 40–55. The arrays are only constructed when `open` is true — this is actually fine. (No issue.)

*Correction: M3 retracted — arrays are after the guard, not before it.*

**M3 (actual) — `aria-hidden` bare attribute serializes to empty string in DOM**

Both files use bare `aria-hidden` (no value) on decorative elements (backdrop div, SVGs, Image). React serializes this as `aria-hidden=""` in the DOM. The ARIA spec treats `aria-hidden=""` as equivalent to `aria-hidden="false"` in some AT implementations, not `aria-hidden="true"`. The rest of the codebase is inconsistent: `login/page.tsx` uses `aria-hidden="true"` (correct).

Risk: low in practice (most AT treat empty string as hiding), but technically wrong.
Fix: use `aria-hidden={true}` consistently.

---

### Low Priority

**L1 — `PenIcon` duplicated in both files**

Both `rules-modal.tsx` and `widget-button.tsx` define a `PenIcon` function with identical SVG path. Violates DRY. Should live in `icons.tsx` (which already exists for this purpose).

**L2 — Static arrays (`heroTiers`, `collectibles`) reinitialised on every open**

`heroTiers` is recreated each render with four `t()` calls. Could be hoisted outside the component (except the `t()` calls require hook scope). Alternatively, memoize with `useMemo`. Low impact but worth noting for i18n-aware SSR profiling.

**L3 — `widget.rules` label says "Thể lệ SAA" (vi) but modal title is "Thể lệ"**

Minor copy inconsistency: the pill button reads "Thể lệ SAA" but the modal header reads "Thể lệ". Not a code bug; flag for copywriter review.

**L4 — No `sizes` prop on hero badge `<Image>` components**

The four hero badge images (126×22) and six collectible images (80×80) lack a `sizes` attribute. Next.js Image will default to `100vw` for the responsive srcset, generating unnecessarily large variants. Since dimensions are fixed, `sizes="126px"` / `sizes="80px"` would be more accurate and reduce LCP cost.

---

### Edge Cases Found

- **Body scroll lock race**: if two modals were ever open simultaneously (not currently possible, but worth noting), the second open would capture `prev = "hidden"` and restore `"hidden"` on close, leaving scroll locked. Currently safe since only one modal exists.
- **SSR**: `document.body.style.overflow` access is inside `useEffect` (runs only on client) — no SSR issue.
- **Rapid open/close**: no debounce needed; cleanup runs synchronously on effect teardown.

---

### Positive Observations

- Escape-to-close + backdrop-click pattern is correct and consistent with `header-controls.tsx`.
- All 18 `home.rules.*` keys present in both `vi.json` and `en.json` — zero missing-key risk.
- No `dangerouslySetInnerHTML` anywhere; emoji in translation strings is safe raw text.
- Hero badge images use `alt=""` (text baked into image per design spec) — correct.
- Collectibles use `alt={item.label}` which is accurate for icon-only images with a separate visible label.
- Color tokens `#FFEA9E` / `#00101A` consistent with all other homepage components.
- File sizes: 172 and 125 LOC — both under the 200-line limit.
- `"use client"` directive is correct on both files (event handlers, `useState`, `useEffect`).
- `key={tier.img}` / `key={item.img}` are stable, unique identifiers — no hydration issues.
- z-[60] intent (above z-50 header) is correct; only the DOM placement is wrong (H1).

---

### Recommended Actions (prioritised)

1. **[H1 — before deploy]** Hoist `RulesModal` out of the widget's `fixed z-50` wrapper. Lift `rulesOpen` state to `page.tsx` and pass `open`/`onClose` as props, or wrap modal body in `createPortal(…, document.body)`.
2. **[H2 — before deploy if a11y is a requirement]** Add focus trap: trap Tab/Shift+Tab within the panel while open.
3. **[H3 — before deploy if a11y is a requirement]** Restore focus to trigger button on close.
4. **[M1 — next PR]** `useCallback` on `closeRules` in `widget-button.tsx`.
5. **[M2 — next PR]** Add `aria-disabled="true"` + visible tooltip to the "Viết KUDOS" placeholder button.
6. **[M3 — housekeeping]** Change bare `aria-hidden` to `aria-hidden={true}` to match `login/page.tsx` pattern.
7. **[L1 — housekeeping]** Move `PenIcon` to `icons.tsx`, remove duplicates.
8. **[L4 — perf]** Add `sizes="126px"` to hero badge images and `sizes="80px"` to collectible images.

---

### Metrics
- Type Coverage: clean (`npx tsc --noEmit` passes per task prompt)
- Linting: clean (`npx eslint` passes per task prompt)
- i18n key coverage: 18/18 keys in both locales
- Critical issues: 0
- High priority: 3
- Medium priority: 2
- Low priority: 4

### Unresolved Questions
- None — all gaps are observable from the code.
