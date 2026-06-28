# Phase 02 — Backend: types + queries + actions (Track B)

**Status:** done

## Files
- `lib/kudos/types.ts` — board types:
  - extend/reexport `HeroBadge` (4 tiers). Update `lib/profile/types.ts` `HeroBadge` union to 4 tiers (shared).
  - `BoardKudos` = KudosWithUsers + `senderId`,`receiverId`,`likedByMe:boolean`,`canLike:boolean`, sender/receiver `department`.
  - `FilterOption` `{ value:string; label:string }`; `SidebarStats` (reuse ProfileStats); `LeaderboardEntry`
    `{ id; displayName; avatarUrl; note }`; `HoverCardData` `{ id; displayName; departmentPath; rank; heroBadge; kudosReceived; kudosSent }`.
- `lib/kudos/queries.ts`:
  - `getHighlightKudos(viewerProfileId, {hashtag?,department?})` — top 5 by heart count (filtered), with likedByMe.
  - `getAllKudos(viewerProfileId, {hashtag?,department?})` — feed newest-first (filtered), with likedByMe.
  - `getHashtagOptions()` — distinct hashtags from kudos.
  - `getDepartmentOptions()` — distinct departments from profiles.
  - `getSidebarStats(viewerProfileId)` — reuse profile stats logic (received/sent/hearts) + placeholder boxes.
  - `getLeaderboards()` — recent seeded profiles → "nhận quà" + "thăng hạng" lists.
  - `getHoverCard(profileId)` — name, department path (use department), badge, kudosReceived/Sent counts.
  - Likes: include `likedByMe` by left-joining kudos_hearts for viewer; `canLike = sender !== viewer`.
- `app/actions/kudos.ts` (server actions, "use server"):
  - `toggleHeart(kudosId)` — insert/delete in kudos_hearts for current profile; guard sender≠self; `revalidatePath('/kudos')`.
  - `createKudos({ receiverId, message, hashtags })` — insert kudos with sender=current profile; revalidate.

## Notes
- Department dropdown filters by `receiver.department` (matches "Phòng ban" intent). Confirm in integration.
- Reuse `createClient` from `@/lib/supabase/server`; mirror patterns in `lib/profile/queries.ts`.

## Todo
- [x] types.ts (+ extend profile HeroBadge) — 4-tier union in lib/kudos/types.ts + lib/profile/types.ts
- [x] queries.ts — 8 functions (getFilteredKudos, pickHighlight, sortFeed, getHashtagOptions, getDepartmentOptions, getSidebarStats, getLeaderboards, getHoverCard)
- [x] actions/kudos.ts — toggleHeart, createKudos wired with RLS guards
