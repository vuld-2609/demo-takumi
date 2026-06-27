# Clarifications — Homepage SAA

Screen: Homepage SAA — https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM

## Session 2026-06-04
- Q: Homepage access model (currently `/` is auth-protected, but ID-0/ID-1 need it public) → A: Make `/` public + conditional header (bell/account only when logged in, else Login link)
- Q: Countdown source (spec env ISO-8601 vs existing 99-day loop) → A: Real env date `NEXT_PUBLIC_EVENT_DATETIME` (ISO-8601); at 0 show 00 00 00 + hide 'Coming soon'; invalid → safe fallback
- Q: Navigation targets that don't exist (Awards Information, Sun* Kudos, Admin Dashboard) → A: Homepage only; links point to stub routes `/awards`, `/kudos` (award cards use hash anchors)
- Q: Depth of header/widget interactions (notification, account menu, widget) → A: UI shells + real auth/role (Profile/Sign out, +Admin Dashboard when Supabase user role='admin'); bell + widget open empty/placeholder panels; reuse existing language switcher
