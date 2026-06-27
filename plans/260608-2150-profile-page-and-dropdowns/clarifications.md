# Clarifications — Profile Page & Profile Dropdowns

MoMorph file: `9ypp4enmFmdK3YAFJLIu6C` (SAA 2025 - Internal Live Coding)
Screens:
- Dropdown-profile (user): `z4sCl3_Qtk` — https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/z4sCl3_Qtk
- Dropdown-profile Admin: `54rekaCHG1` — https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/54rekaCHG1
- Profile bản thân: `3FoIx6ALVb` — https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/3FoIx6ALVb

## Session 2026-06-08

- Q: Data source for profile stats & kudos feed (no backend exists) → A: Wire real Supabase tables
- Q: Existing header dropdown (Profile/Admin Dashboard/Sign out) vs design → A: Restyle the existing header-controls.tsx dropdown to match design
- Q: 'Mở Secret Box' button + icon-collection + badges behavior (no spec/backend) → A: Visual placeholder, non-functional (no backend logic)
- Q: Localization of profile page → A: Localize labels EN + VI in messages/*.json (mock content stays as-is)
- Q: Table provisioning (only anon key, no psql/CLI/service key) → A: I write supabase/migrations/*.sql (tables+RLS+seed)+README, user applies via Supabase Dashboard SQL Editor; app reads via anon key+RLS
- Q: Seed data (kudos table starts empty, no creation UI) → A: Seed sample kudos + reactions using Figma sample content
- Q: Hearts/'tim' model → A: Separate reactions table (kudos_hearts); 'tim received' = count across received kudos
- Q: Profiles table population (rank/hero-badge/name/avatar) → A: Auto-create via DB trigger on signup + defaults; name/avatar from Google OAuth metadata; rank & hero_badge defaults, seeded for samples
