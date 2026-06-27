# Phase 06 — Tests, Review, Delivery

**Priority**: High · **Status**: Complete · Final (depends on [phase-05](phase-05-integration-and-i18n.md) + [phase-04](phase-04-header-dropdown-restyle.md))
Context: [plan.md](plan.md)

## Goal
Verify, review, document, and ship.

## Steps
1. **Typecheck/lint/build** (orchestrator, central — subagents can't touch node_modules):
   `npx tsc --noEmit`; `npm run lint` (feature files only — repo has ~740 pre-existing `.claude/**` lint errors, out of scope); `npm run build`.
2. **tester** subagent: data-layer query logic (pure mapping/filter units where feasible), profile page renders
   with seeded + empty data, dropdown variants. No fake passes.
3. **reviewer** subagent: correctness, security (RLS, auth gate, no secrets), design fidelity, file sizes, conventions.
4. Fix findings; re-run tester until green.
5. **Delivery (mandatory)**: `project-manager` (sync plan/phases), `doc-writer` (docs/ + docs/specs review),
   `TaskUpdate`, emit Delivery Manifest, then `git-manager` commit prompt, then `/tkm:write-journal`.

## Todo
- [x] tsc/lint/build clean (feature scope)
- [x] tester green
- [x] reviewer pass (no criticals)
- [x] Delivery Manifest + commit + journal

## Success criteria
100% tests pass; review ≥ threshold, 0 critical; docs synced; clean conventional commit on `feat/profile-page`.

## Security
Confirm RLS, server-side auth gate on `/profile`, no service keys/secrets committed, SQL files contain no real credentials.
