# Phase 02 — Data Layer + Types (Track B)

**Priority**: High · **Status**: Complete · Track B
Context: [plan.md](plan.md) · depends on [phase-01](phase-01-supabase-schema.md) schema shape

## Goal
Typed server-side query layer over the Supabase tables, returning shapes the UI consumes.

## Files to create
- `lib/profile/types.ts` — `Profile`, `Kudos`, `KudosWithUsers`, `ProfileStats`, `KudosFilter`.
- `lib/profile/queries.ts` — server functions using `createClient()` from `lib/supabase/server.ts`.

## Types (sketch)
```ts
type Profile = { id; displayName; avatarUrl; department; rank; heroBadge };
type KudosUser = { displayName; avatarUrl; rank; heroBadge };
type KudosWithUsers = { id; sender: KudosUser; receiver: KudosUser; message;
  images: string[]; hashtags: string[]; category: string|null; isSpam: boolean;
  heartCount: number; createdAt: string };
type ProfileStats = { kudosReceived; kudosSent; heartsReceived;
  boxesOpened; boxesUnopened }; // boxes* are MOCK constants
type KudosFilter = 'received' | 'sent';
```

## Functions
- `getProfile(userId)` → Profile (joins auth metadata fallback for name/avatar).
- `getProfileStats(userId)` → ProfileStats: count kudos where receiver=user / sender=user;
  hearts = count kudos_hearts on user's received kudos; boxes* = mock constants (e.g. 25/25).
- `getKudosFeed(userId, filter)` → KudosWithUsers[]: `filter='sent'` → sender=user, `'received'` → receiver=user;
  join sender+receiver profiles; heartCount via count/aggregate; order by created_at desc.
- Map snake_case DB → camelCase types. Handle empty (no rows) gracefully.

## Todo
- [x] types.ts
- [x] queries.ts (received/sent/stats, camelCase mapping, empty-safe)
- [x] `npx tsc --noEmit` clean (orchestrator runs)

## Success criteria
Functions compile, return typed data, no throw on empty tables (return zeros / []).

## Risks
RLS may hide rows if not authenticated → queries run server-side with session cookie. Verify counts use
correct join direction. Keep files < 200 lines.
