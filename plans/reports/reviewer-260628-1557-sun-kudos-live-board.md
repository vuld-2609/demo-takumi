## Code Review — Sun* Kudos Live Board

### Scope
- Files: 20 (migrations, seed, types, queries, server actions, 14 components, icons, hero-badge)
- LOC: ~2,200
- Branch: `feat/sun-kudos-live-board`
- Build: PASSING (pre-verified)

### Overall Assessment
Solid implementation. RLS/security posture is correct at the critical paths. Auth boundary is trustworthy — sender_id never comes from client input; toggleHeart double-guards with both action-level check and RLS. A few medium-priority correctness issues (PostgREST filter syntax, hashtag options including spam data) and several low-priority items. No CRITICAL issues. 0 secrets committed.

---

### CRITICAL Issues
*None.*

---

### HIGH Issues

**H1 — `getHashtagOptions` includes hashtags from spam kudos**
`lib/kudos/queries.ts:113-119`
Query fetches `hashtags` from ALL kudos rows with no `is_spam=false` filter. Spam posts with offensive hashtags surface in the filter dropdown even though the board itself hides spam content.
```ts
// Fix: add .eq("is_spam", false)
const { data } = await supabase.from("kudos").select("hashtags").eq("is_spam", false);
```

**H2 — `createKudos` leaks raw DB error string to caller**
`app/actions/kudos.ts:93`
```ts
return { ok: false, error: error.message };  // leaks constraint names, column names
```
The compose dialog ignores `result.error` and shows a translated string — so no immediate user-visible leak today. But the returned object carries the raw Postgres message. If a future caller uses `result.error` directly, or if this is ever logged client-side, it exposes schema internals.
Fix: return a stable opaque code: `return { ok: false, error: "server_error" }`.

**H3 — `getSidebarStats` hearts count may not work as expected**
`lib/kudos/queries.ts:139-143`
```ts
supabase
  .from("kudos_hearts")
  .select("kudos!inner(receiver_id)", { count: "exact", head: true })
  .eq("kudos.receiver_id", viewerProfileId)
```
PostgREST foreign-table filters via dotted column syntax (`.eq("kudos.receiver_id", ...)`) are only supported when the foreign table is embedded in the select. With `{ head: true }` the response body is empty — PostgREST still evaluates the filter but this is an undocumented pattern. In Supabase JS v2 with `@supabase/supabase-js ^2.107`, the filter IS forwarded correctly, but if the behavior regresses `heartsReceived` silently returns 0 for all users. Also: hearts on `is_spam=true` kudos count toward this total (minor accuracy issue).

---

### MEDIUM Issues

**M1 — Department filter PostgREST syntax on joined table**
`lib/kudos/queries.ts:64`
```ts
query.eq("receiver.department", filters.department)
```
PostgREST embedded resource filters use `embedded_table.column` dotted notation but require the column to be in the `SELECT` and the table joined with `!inner`. Both conditions are satisfied here. However this filter operates on the PostgREST REST layer — the Supabase JS `.eq()` method passes this as a query param, which is the supported pattern. **Verify in staging**: if the department filter silently returns all-rows when no match, it would be a correctness bug. The `!inner` join should cause zero rows if no receiver matches, so the semantics are likely correct, but worth an explicit integration test.

**M2 — `createKudos` allows self-kudos (sender = receiver)**
`app/actions/kudos.ts:77-97`
No server-side check that `input.receiverId !== profileId`. A user can post kudos to themselves. The `canLike` logic on the board prevents liking own kudos but there's no equivalent guard for compose. This is a data integrity issue.
```ts
if (input.receiverId === profileId) return { ok: false, error: "self_kudos" };
```

**M3 — `compose-dialog.tsx:133` success timer not cleaned up on unmount**
```ts
setTimeout(() => onClose(), 1200)  // no cleanup ref
```
If the parent unmounts the dialog while the 1200ms timer is running (e.g. backdrop click while success message shows), `onClose()` fires on an unmounted component — harmless in React 18 (the warning was removed) but causes a no-op state update on the parent. Use a ref: `const successTimerRef = useRef(); successTimerRef.current = setTimeout(...)` and clear in a cleanup effect.

**M4 — `LikeButton` `disabled` HTML attribute doesn't cover `isPending` state**
`app/kudos/_components/like-button.tsx:31,60`
`handleClick` guards `if (isPending) return` but the `<button disabled={disabled}` only sets `disabled` for sender's own kudos. During a pending transition the button is visually enabled and clickable — the early-return in `handleClick` blocks the action, but a rapid double-click before state updates can cause UI flicker. Set `disabled={disabled || isPending}` to be consistent.

**M5 — `getHashtagOptions` / `getDepartmentOptions` unbounded + no dedup for filter options**
`lib/kudos/queries.ts:113-131`
Both queries fetch every row (`kudos.hashtags`, `profiles.department`) and deduplicate in JS. For large data sets this is expensive. `getHashtagOptions` fetches all kudos rows just to extract hashtag arrays. A `unnest(hashtags)` SQL aggregate or a materialized view would scale better. Not a current-scale problem but worth noting.

---

### LOW Issues

**L1 — `highlight-card.tsx:139-145` "viewDetails" button is dead UI**
The button renders, is keyboard-focusable, passes a11y checks, but has no `onClick` and no href — clicking does nothing. Either wire it up or remove it before launch.

**L2 — `getReceiverOptions` has no pagination or limit**
`lib/kudos/queries.ts:182-191`
Fetches ALL profiles, alphabetically sorted. For a small company fine; for hundreds of employees the select element renders all options. Consider a search-as-you-type autocomplete if the profile count grows.

**L3 — `copy-link-button.tsx` renders portal DOM on every card even when toast hidden**
`copy-link-button.tsx:59-81`
Each `CopyLinkButton` instance always renders its portal div (opacity:0 when not visible). With a large feed this is N DOM nodes always present. Guard: `{toastVisible && createPortal(...)}` and use CSS `visibility` if fade transition is needed — or manage toast via a global context.

**L4 — `kudos-banner.tsx:93-98` search pill div has `aria-label` but is not interactive**
The static search `<div>` has `aria-label` but no `role` or `tabindex`. Screen readers won't announce it in a meaningful context. Since it's non-functional, either add `role="presentation"` + remove the label, or turn it into a disabled `<button>` with `aria-disabled="true"`.

**L5 — `compose-dialog.tsx` focus trap re-queried at mount, stale after success state**
`compose-dialog.tsx:76-100`
The focus trap effect captures the focusable elements on open but never re-queries when `success=true` replaces the form. If Tab is pressed during the 1200ms success window, `first`/`last` references are stale (pointing to form elements that are no longer rendered), so `first.focus()` / `last.focus()` throw or silently fail. Minor: the dialog closes promptly, but technically broken.

**L6 — Seed comment says hearts on `aaaaaaa1-...-0001` (spam post)**
`supabase/seed.sql:49-50`
Seeded hearts on a `is_spam=true` kudos. These hearts count in `getSidebarStats.heartsReceived` for the receiver profile (profile 1111…). The board filters out spam kudos from display but doesn't exclude their hearts from counts. Minor accuracy issue for demo data.

**L7 — `lib/kudos/queries.ts:217` file is 217 lines (slightly over 200-line guideline)**
Minor style issue per project rules. Could split `getLeaderboards` + `getReceiverOptions` + `getHoverCard` into a separate `profile-queries.ts`.

---

### Edge Cases Found (Scout Phase)
- **Unauthenticated direct API call to `loadHoverCard`**: profileId is not validated as UUID before DB query. Supabase JS uses parameterized queries so no SQL injection risk, but a malformed UUID causes a Postgres error that is swallowed silently (`if (!data) return null`). The error path just returns null — acceptable.
- **Carousel at `items.length === 1`**: `leftIdx = -1`, `rightIdx = 1 >= total (1)` — both neighbour slots render nothing, center card is full-width. Works correctly; arrows disabled at both ends immediately.
- **Filter change resets carousel index** via `key={carouselKey}` remount — correct; prevents index-out-of-bounds when filtered list is shorter.
- **`toggleHeart` TOCTOU**: Between the `select sender_id` check and the `insert` call, the kudos row could theoretically be deleted. The FK cascade would cause the insert to fail with a foreign key violation error that is silently ignored (no error check on the heart insert). This surfaces as `liked: true` returned to client but the DB row was never created — the subsequent `countHearts` would then return the old count. Very unlikely in practice but the DB insert error is not checked.

---

### Positive Observations
- **RLS design is correct**: `kudos_insert_own` policy uses a sub-select against `profiles` — even if the client sends any sender_id the DB enforces it maps to the caller's auth uid. `toggleHeart` double-guards (action check + RLS).
- **No service_role usage anywhere** in server code — all queries use the cookie-based client with the user's JWT.
- **No secrets in tracked files** — confirmed clean.
- **`formatKudosTime` handles NaN gracefully** — falls back to raw ISO string.
- **Compose dialog a11y** is thorough: `role="dialog"`, `aria-modal`, `aria-labelledby`, Esc close, focus trap, focus-visible rings.
- **Optimistic like with server reconciliation** is clean — reverts on error, reconciles on success, `isPending` guard prevents duplicate in-flight requests.
- **`currentProfileId` always resolves sender from server auth**, never trusts client-supplied profile ID.
- **`getFilteredKudos` likedIds** uses a single secondary query + Set lookup — avoids N+1 per kudos.
- **Migration 0002 is idempotent** — `IF NOT EXISTS`, `DROP POLICY IF EXISTS` guards throughout.

---

### Recommended Actions (Priority Order)
1. **H1** — Add `.eq("is_spam", false)` to `getHashtagOptions`
2. **M2** — Add self-kudos guard in `createKudos` server action
3. **H2** — Return opaque error code from `createKudos` instead of `error.message`
4. **M4** — Set `disabled={disabled || isPending}` on LikeButton `<button>`
5. **M3** — Add cleanup ref for success timer in ComposeDialog
6. **L1** — Wire up or remove the "viewDetails" button in HighlightCard
7. **H3** / **M1** — Add integration tests for department filter and heartsReceived count

---

### Metrics
- Type Coverage: high — no `any` without justification, all DB shapes explicitly typed
- Test Coverage: 0% (no test files in scope)
- Linting Issues: 0 (build passes clean)
- CRITICAL Issues: **0**

### Unresolved Questions
- Is `is_spam` update intentionally admin-only via service_role (no RLS UPDATE policy on kudos)? If so, how do admins mark spam — Supabase dashboard only?
- Is the `?k={kudosId}` deep-link param (`copy-link-button`) intentionally unimplemented (no scroll-to or highlight behavior in `page.tsx`)? The URL is shareable but the page just loads from the top.
- `getReceiverOptions` exposes all profile display names to any authenticated user — intended for an internal tool?

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Implementation is secure with no critical issues; 3 high-priority correctness items (spam hashtag leak into filter options, raw DB error string in server response, hearts count query reliability) and self-kudos not prevented on the server.
**Concerns:** H1 (spam hashtags in filter) and M2 (self-kudos) should be fixed before launch; H2 (error string leak) is a low-risk future hazard worth patching now.
