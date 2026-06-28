# Plan — Write Kudo Modal (Viết Kudo)

MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2
Clarifications: ./clarifications.md

## Goal
Replace the existing dark `compose-dialog.tsx` with the redesigned light/cream "Viết Kudo" modal:
recipient autocomplete, required Danh hiệu (title), rich-text content editor (B/I/S/list/link/quote + @mention),
hashtag chips (predefined + free, min 1 / max 5), image upload (max 5, Supabase Storage), anonymous toggle
(+ name field), Hủy / Gửi actions with validation and disabled-until-valid submit.

## Two-track execution
Track A (UI) and Track B (backend) run in parallel — no blocking between them. Integration at the end.

### Track A — UI (background `implementer` agent) — phase-01
Rebuild `compose-dialog.tsx` + sub-components, light theme, all elements functional client-side with mock data.
Owns: `app/kudos/_components/compose-dialog.tsx`, new sub-components, `messages/{en,vi}.json` UI strings.

### Track B — Backend (orchestrator) — phase-02..04
- phase-02: Supabase migration `0003` — add `title`, `is_anonymous`, `anonymous_name` to kudos; create `kudos-images` Storage bucket + policies.
- phase-03: `lib/kudos/types.ts` + `lib/kudos/queries.ts` — extend types; add mentionable-users + hashtag-suggestions queries; map new columns in board reads.
- phase-04: `app/actions/kudos.ts` — extend `createKudos` (title, html message, isAnonymous, anonymousName, image upload). Validation: receiver + title + content + ≥1 hashtag required.

### Integration — phase-05
Wire real data (receivers, mentionable users, hashtag suggestions) + real `createKudos` into the UI Track A built.
Update card rendering for title + anonymous sender. Update `kudos-board.tsx` props if needed.

## Status
- [x] phase-01 UI (Track A) — compose-dialog + 6 sub-components built, light/cream theme, mock data wired, i18n updated
- [x] phase-02 Schema + Storage — 0003 migration adds title/is_anonymous/anonymous_name columns; kudos-images bucket with RLS policies
- [x] phase-03 Types + Queries — BoardKudos/MentionableUser types extended; getHashtagSuggestions + mentionable-users queries; new columns mapped in board reads
- [x] phase-04 Server action — createKudos extended with title, sanitized HTML, image upload, anonymous, hashtag validation (1-5), file-size limit
- [x] phase-05 Integration + tests + review — real data wired; card rendering updated for title/anonymous; profile title display; code review APPROVED_WITH_FIXES, all fixes applied; tsc/eslint/build pass
