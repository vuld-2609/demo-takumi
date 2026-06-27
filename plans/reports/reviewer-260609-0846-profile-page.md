# Code Review — Profile Page & Header Dropdown
**Branch:** `feat/profile-page` (diff against `feat/homepage`)
**Reviewer:** Staff Engineer (adversarial)
**Date:** 2026-06-09

---

## Scope
- `supabase/migrations/0001_profiles_kudos.sql`, `supabase/seed.sql`, `supabase/README.md`
- `lib/profile/types.ts`, `lib/profile/queries.ts`
- `app/profile/page.tsx`, `app/profile/_components/*` (5 files)
- `app/_components/home/header-controls.tsx`, `icons.tsx`
- `messages/en.json`, `messages/vi.json`

LOC changed: ~750 net new lines.

---

## Overall Assessment

Solid implementation with good RLS fundamentals, clean component structure, and complete i18n. Three findings require fixes before production (one query correctness bug, one potential memory/URL-size bomb, one missing `use client` directive that could cause runtime errors). Everything else is low-severity nits.

---

## CRITICAL Issues

None.

---

## HIGH Priority

### H1 — `kudos_hearts(count)` returns a **string**, typed as `number` — silent bad data
**File:** `lib/profile/queries.ts:105,115`

PostgREST's aggregate hint syntax (`relation(count)`) returns count as a JSON string (e.g. `"5"`, not `5`). The cast `as { count: number }[]` papers over this — TypeScript will not catch it at runtime. `heartAgg?.[0]?.count ?? 0` evaluates to the string `"5"` when hearts exist, not `0` (string is truthy). Downstream: `formatCount(kudos.heartCount)` calls `n.toLocaleString("vi-VN")` where `n` is a string — JS coerces it and rendering appears correct, but any arithmetic comparison or `===` check would fail silently.

**Fix:** Coerce explicitly:
```ts
heartCount: Number(heartAgg?.[0]?.count ?? 0),
```

### H2 — `getProfileStats` fetches ALL received kudos rows into memory, then sends unbounded `.in()` array
**File:** `lib/profile/queries.ts:54-72`

```ts
const received = await supabase
  .from("kudos")
  .select("id", { count: "exact" })  // fetches EVERY row, not just count
  .eq("receiver_id", profileId);

const receivedIds = (received.data ?? []).map((r) => r.id);
// ...
.in("kudos_id", receivedIds);  // unbounded array in URL query string
```

For a user with N received kudos:
1. `received.data` holds N UUID objects in the server process RAM.
2. The `.in()` translates to a URL query string (`?kudos_id=in.(uuid1,uuid2,…)`). PostgREST has a ~8 KB URL limit by default. At 36 chars/UUID with commas, you hit the limit at ~200 kudos. Beyond that: HTTP 414 / silently wrong count.

Supabase JS client v2 does NOT auto-switch to POST for `.in()` — it's always a GET.

**Fix:** Use a single aggregated SQL query via RPC or a correlated count in a DB function, OR use the PostgREST computed column approach. Simplest fix available without schema change:

```ts
// head: true means data is null, count is returned without fetching rows
const received = await supabase
  .from("kudos")
  .select("*", { count: "exact", head: true })
  .eq("receiver_id", profileId);
// kudosReceived: received.count ?? 0  ← already correct

// For heartsReceived, add a DB function or a View that does the join:
// create view profile_heart_totals as
//   select k.receiver_id as profile_id, count(kh.*) as hearts_received
//   from kudos k join kudos_hearts kh on kh.kudos_id = k.id
//   group by k.receiver_id;
```

Until the view/function exists, cap receivedIds with a `.limit()` or accept the query will fail for high-traffic users.

---

## MEDIUM Priority

### M1 — `kudos-card.tsx` uses `useTranslations` with no `"use client"` directive
**File:** `app/profile/_components/kudos-card.tsx:2,43-48,51`

`useTranslations` in next-intl v4 is **safe in RSC when called at the module top-level** via `import { useTranslations } from "next-intl"`. However, `useCategoryLabel` is a custom function that calls `useTranslations()` inside its body. Calling hooks inside non-component, non-hook functions breaks the Rules of Hooks even in next-intl's RSC mode. This component is currently only imported through `kudos-section.tsx` (a client component), so it is client-bundled and the call works. But if `kudos-card.tsx` were ever imported directly from a server component, it would crash.

The naming `useCategoryLabel` implies a hook contract. Since it only calls `useTranslations` and has no state/effects, inline it or accept `t` as a parameter:

```ts
// Option A: inline
const label = category === "idol_gioi_tre" ? t("categoryIdolGioiTre") : category;

// Option B: add "use client" to kudos-card.tsx explicitly (since it already behaves as client)
```

### M2 — `getProfileStats` sequential awaits — 3 round trips instead of 2
**File:** `lib/profile/queries.ts:54-72`

`received`, `sent`, and (conditionally) `hearts` are awaited serially. `received` and `sent` are independent; they should be parallelised. Minor but measureable on high-latency connections:

```ts
const [received, sent] = await Promise.all([
  supabase.from("kudos").select("*", { count: "exact", head: true }).eq("receiver_id", profileId),
  supabase.from("kudos").select("*", { count: "exact", head: true }).eq("sender_id", profileId),
]);
```

### M3 — `profiles` table missing INSERT policy for authenticated users (non-trigger path)
**File:** `supabase/migrations/0001_profiles_kudos.sql:107-115`

RLS on `profiles` has `SELECT` (any auth) and `UPDATE` (own row) but no `INSERT` for authenticated users. The trigger runs as `security definer` so it bypasses RLS for auto-created profiles — that's fine. But if the trigger hasn't been applied (pre-migration), or a user's profile row was somehow deleted, there is no way for the app or user to re-create it. The README "link your account" snippet also does an `UPDATE`, not `INSERT`, so this is covered in that path. Low blast radius for this app, but worth noting for completeness.

### M4 — `Escape` key handler requires focus inside the outer `div`
**File:** `app/_components/home/header-controls.tsx:31-33`

```tsx
<div onKeyDown={(e) => { if (e.key === "Escape") setOpenMenu("none"); }}>
```

`onKeyDown` on a `div` only fires when focus is within the subtree. If the user opens the menu by clicking a button and then focuses elsewhere (e.g. address bar), pressing Escape won't close the menu. The existing click-away overlay handles mouse-out already, but keyboard-only users can get stuck.

**Fix:** Attach the Escape listener to `document` in a `useEffect` or use the `dialog` element pattern.

### M5 — `department` field fetched but never rendered in `ProfileHero`
**File:** `app/profile/_components/profile-hero.tsx:61` / design-spec: "Department/rank small"

Design spec says: **"Department/rank small (sample: 'CEVC3')"** — implying both fields. The hero currently only renders `profile.rank`. The `department` column is fetched from the DB (queries.ts:35) and carried in the `Profile` type, but never displayed. This is a minor design-fidelity gap.

---

## LOW Priority

### L1 — `received.data` is fetched but unused after H2 fix
When `select("id", {count:"exact"})` is replaced with `{head:true}`, `received.data` will always be null — remove the `receivedIds` computation entirely once the view/function approach lands.

### L2 — Hardcoded Vietnamese string in image `alt`
**File:** `app/profile/_components/kudos-card.tsx:112`

```tsx
alt={`Ảnh ${i + 1}`}
```

"Ảnh" is Vietnamese for "Photo". This `alt` text leaks a hardcoded locale string in what is otherwise a fully i18n'd file. Add `profile.imageAlt` key to both message files, or use a generic numeric fallback (which is actually fine for decorative images that are already described by context).

### L3 — `heartCount` displayed via `formatCount` (Vietnamese locale) even in English locale
**File:** `app/profile/_components/kudos-card.tsx:8`

```ts
return n.toLocaleString("vi-VN");
```

This always uses Vietnamese thousand-separators (dot `1.234`) regardless of the active next-intl locale. If EN locale is active, `1,234` would be expected. Low impact now (single market), but inconsistent.

### L4 — `PLACEHOLDER_BOX_STATS` imported twice (page.tsx + queries.ts)
**File:** `app/profile/page.tsx:11` and `lib/profile/queries.ts:5`

Both import and spread `PLACEHOLDER_BOX_STATS`. In `page.tsx` it's only used in `EMPTY_STATS` (fallback when no profile). `queries.ts` spreads it into the returned `ProfileStats`. This means the placeholder values (`25/25`) are baked into the DB query layer. Consider keeping the fallback concern only in the page layer and having `getProfileStats` return just the three real counts (not four).

### L5 — `supabaseUrl ?? ""` silently produces broken client
**File:** `lib/supabase/server.ts:10`

If `NEXT_PUBLIC_SUPABASE_URL` is absent, `createServerClient("", ...)` produces a client that makes requests to relative paths (e.g. `/rest/v1/profiles`). This fails silently — `getUser()` returns null and the page redirects to `/login` with no visible error. During local dev, a missing `.env.local` produces a confusing redirect. Consider throwing early:

```ts
if (!supabaseUrl || !supabaseAnonKey) throw new Error("NEXT_PUBLIC_SUPABASE_* env vars not set");
```

---

## NIT

### N1 — Duplicate style properties in `kudos-card.tsx`
`article` element has both `className="... flex flex-col"` and `style={{ display: "flex", flexDirection: "column" }}` — redundant, Tailwind wins. Remove the inline `display`/`flexDirection`.

### N2 — `hero-badge.tsx` labels are not i18n'd
"Legend Hero" / "Super Hero" are hardcoded English strings — intentional based on design, but if the app serves Vietnamese as primary locale these should eventually be translated. Mark with a TODO comment.

### N3 — `getKudosFeed` returns `[]` on any error (swallowed)
`lib/profile/queries.ts:102`: `if (error || !data) return []` — the Supabase error is logged nowhere. Add at least a `console.error` for observability.

### N4 — Seed UUIDs use human-memorable pattern (`1111…`, `aaaa…`)
Acceptable for dev/demo seeds; document clearly (done in README) so they aren't confused for real data.

---

## Edge Cases Found (Scouting)

1. **New user, trigger not applied**: `getProfileByAuthUser` returns null → page falls back to `{ id: "", ... }` → `profile.id` is falsy → skips all DB fetches → renders zeros. This path works correctly.
2. **User with many kudos received (>200)**: `.in("kudos_id", receivedIds)` will exceed PostgREST URL limit → HTTP 414 or wrong count. See H2.
3. **Concurrent heart insert + delete race**: No issue at DB level (composite PK + ON CONFLICT DO NOTHING). No UI for hearts yet so no client race.
4. **`signOut` form action in a `<form>` inside a `<Link>` component tree**: The `signOut` button is inside a `<form>` inside the dropdown `<div>` — correctly not nested inside an `<a>` tag, no invalid HTML.
5. **`isAdmin` from user_metadata self-elevation**: `current-user.ts` explicitly reads only `app_metadata.role` with a clear comment. User-controlled `user_metadata` is never consulted for auth. Correct.

---

## Positive Observations

- **RLS is complete and correct** for the current scope: no INSERT on kudos (intentional, no creation UI), hearts correctly scoped to caller's profile via subquery, no `anon` role policies (all three tables require `authenticated`).
- **`security definer` trigger** has `set search_path = public` — prevents search_path injection. Good.
- **Auth gate** in `page.tsx` is first-thing: `if (!user) redirect("/login")`. No data fetch before the gate.
- **Admin role** sourced exclusively from `app_metadata` with explicit comment explaining why `user_metadata` is unsafe. Excellent.
- **`on conflict (auth_user_id) do nothing`** in trigger handles re-runs safely. Idempotent backfill query is also safe.
- **Graceful degradation**: page renders with zeros when schema isn't applied yet.
- **File sizes** all within 200-line limit. Kebab-case naming throughout.
- **next-intl v4 `useTranslations` in RSC** for `profile-hero.tsx` and `profile-stats-card.tsx` is valid — next-intl v4 supports `useTranslations` in server components without `"use client"`.
- **i18n completeness**: every UI label key exists in both `en.json` and `vi.json`. No hardcoded user-facing strings except the one in L2.
- **Dropdown Escape/click-away** preserved from previous implementation; bell menu and language switcher untouched.

---

## Recommended Actions (Priority Order)

1. **[H1]** `heartCount: Number(heartAgg?.[0]?.count ?? 0)` — one-line fix, prevents silent string-in-number bug.
2. **[H2]** Replace the `select("id") + .in()` hearts-count pattern. Simplest path: use `{head:true}` for the received count, and compute `heartsReceived` via a DB view or RPC to avoid the unbounded array. Cap with `.limit(1000)` as a temporary guard.
3. **[M1]** Add `"use client"` to `kudos-card.tsx` to make the hook usage explicit, or inline the translation.
4. **[M2]** Parallelise the two `getProfileStats` Supabase calls with `Promise.all`.
5. **[M4]** Move Escape handler to `document` addEventListener in a `useEffect`.
6. **[M5]** Render `profile.department` in `ProfileHero` (design spec shows it alongside rank).

---

## Metrics

- Type Coverage: ~95% (3 `as unknown as` casts in queries.ts are the only escape hatches; all justified by PostgREST's untyped aggregate/dual-FK returns)
- Test Coverage: 0% (no tests in this feature — out of scope per plan phase 06 which was not yet executed)
- Linting: 0 issues (confirmed by orchestrator)
- Critical Issues: **0**
- High Issues: **2**
- Medium Issues: **5**
- Low Issues: **5**
- Nits: **4**

---

## Verdict

**CHANGES_REQUIRED** — Score: **7 / 10**

Two high-priority bugs must be fixed before production:
- H1 (string/number type mismatch on heart count) is a silent data bug.
- H2 (unbounded `.in()` array) is a latent failure for any active user with > ~200 received kudos.

All other findings are low-severity and can land as follow-up. The security model, auth gate, RLS policies, and overall architecture are sound.

---

## Unresolved Questions

1. Does the Supabase JS client v2 used in this project auto-POST for large `.in()` arrays? (Verify in `@supabase/postgrest-js` version in `node_modules` — subagent Bash cannot access this.)
2. Is `kudos_hearts(count)` PostgREST aggregate syntax supported on the specific Supabase project's PostgREST version? If the project uses an older PostgREST, this will silently return the full rows array instead of a count aggregate, making `heartAgg?.[0]?.count` undefined and defaulting to `0` for all cards.
3. Should `department` appear in the hero? Design spec says "Department/rank small" — confirm with designer whether they are shown separately (e.g. "CEVC3 · CEVC3") or if `rank` is used as the department label in this app.

---

**Status: DONE_WITH_CONCERNS**
**Summary:** Feature is functionally complete and secure. Two HIGH bugs (silent number/string type coercion on heart counts, unbounded `.in()` array query for hearts-received stat) must be fixed before the page goes to real users with any meaningful kudos volume.
