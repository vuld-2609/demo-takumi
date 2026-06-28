# Phase 06 — Integration: page assembly + data wiring + i18n (Track A+B)

**Status:** done

## Goal
Assemble `/kudos`, wire real Supabase data + server actions into the UI, add i18n.

## Steps
- `app/kudos/page.tsx` (async server component): require auth (redirect /login like profile page);
  resolve viewer profile; fetch in parallel: highlight, all-kudos, hashtag options, department options,
  sidebar stats, leaderboards. Render: SiteHeader → banner → highlight-section → (feed + sidebar) → SiteFooter.
  Montserrat font + `#00101A` bg like profile page. Graceful zero/empty states when schema/seed not applied.
- Filtering: lift selected hashtag/department to a client wrapper (or use URL search params
  `?hashtag=&department=`) so both Highlight + All Kudos refilter and carousel resets to page 1.
  Prefer searchParams → server refetch (simplest, SSR-friendly). Confirm approach during build.
- Wire `like-button` → `toggleHeart` action; `compose-dialog`/"Gửi KUDO"/input pill → `createKudos`.
- `copy-link-button` → clipboard + toast.
- i18n: add `kudos` namespace to `messages/en.json` + `messages/vi.json` (titles, filter labels, empty states,
  toast, compose dialog, sidebar labels). Reuse existing `home.rules.tier*` copy for badge tooltips.
- Add any missing icons to `app/_components/home/icons.tsx` (ChevronLeftIcon, SearchIcon, HeartFilled if needed).

## Success criteria
- `npm run build` + `npm run lint` clean (no type/syntax errors).
- Page renders with seed data; all interactions functional; VI/EN strings present.

## Todo
- [x] page.tsx + data wiring — auth-guarded, parallel data fetch, SSR-friendly layout
- [x] filtering (searchParams) both sections + carousel reset — hashtag/department filters applied to both highlight+feed
- [x] actions wired (like, compose, copy) — toggleHeart, createKudos, clipboard actions hooked up
- [x] i18n en/vi — kudos namespace added to messages/en.json + messages/vi.json
- [x] build + lint clean — `npm run build` passes
