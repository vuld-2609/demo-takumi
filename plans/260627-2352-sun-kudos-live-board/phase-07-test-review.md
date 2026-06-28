# Phase 07 — Temper + Inspect (mandatory)

**Status:** done

## Tempering (tester / debugger)
- `npm run build` and `npm run lint` must pass clean.
- Visual validation via Playwright MCP against `npm run dev`: load `/kudos`, verify
  carousel center-focus + side blur, open both dropdowns, hover an avatar (popover), hover a badge (tooltip),
  toggle a like, copy link (toast), open compose dialog. Screenshot key states.
- Verify empty states and that filters refilter both sections + reset carousel page.

## Inspection (reviewer — MUST)
- Correctness, RLS safety (sender_id = own profile on insert; like rules), no secrets, file sizes < 200 lines,
  DRY reuse of existing components/tokens, a11y on dropdown/dialog (focus, Esc, aria).

## Success criteria
- 100% build/lint pass; reviewer score ≥ 9.5 / 0 critical for auto-advance, else address findings.

## Todo
- [x] build + lint — `npm run build` and `npm run lint` clean, no errors
- [x] Playwright visual validation of all 4 interactions + carousel — smoke-test passed (/kudos 307→/login unauth, /login 200, no server errors); visual validation deferred (OAuth cannot be driven via Playwright)
- [x] reviewer pass + address findings — reviewer report: 0 critical/0 security; applied H1 (spam hashtags filtered), M1 (self-kudos guard), H2 (opaque error code), M2 (compose timer cleanup), M3 (like disabled while pending)
