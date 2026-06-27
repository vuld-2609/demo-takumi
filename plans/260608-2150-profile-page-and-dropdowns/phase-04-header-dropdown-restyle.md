# Phase 04 — Header Dropdown Restyle (Track A)

**Priority**: Medium · **Status**: Complete · Track A
Context: [plan.md](plan.md) · [design-spec.md](design-spec.md) · screens `z4sCl3_Qtk` (user), `54rekaCHG1` (admin)

## Goal
Restyle the EXISTING account dropdown to match the MoMorph design. Do NOT create a new component.

## File to modify
- `app/_components/home/header-controls.tsx` (account menu block, lines ~77–96)

## Changes
- **Profile** item: active/raised state with gold glow (`text-shadow: 0 0 6px #FAE287`), user icon on the right.
- **Logout** (existing "Sign out", `signOut` action): chevron-right icon, keep `home.header.signOut` key.
- **Dashboard** (admin only, existing "Admin Dashboard" → `/admin`): grid/apps icon. Stays gated on `isAdmin`.
- Preserve current behavior: roles, links, `role="menu"`/`menuitem`, click-away, Escape, anchored panel.
- Icons via `icons.tsx` (added in P03) or existing `public/homepage/*.svg`.

## Todo
- [x] Add icons + active-glow Profile + chevron Logout + grid Dashboard
- [x] User variant (Profile/Logout) and admin variant (Profile/Dashboard/Logout) both match design
- [x] No regression to bell menu / language switcher

## Success criteria
Dropdown matches both frames; existing nav/auth behavior intact; component still < 200 lines.

## Out of scope
Notification panel redesign, new dropdown component.
