# Clarifications — Sun* Kudos Live Board

MoMorph screen: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ

## Session 2026-06-28

- Q: Page scope — which parts of the board do we build now? → A: Highlight section + All Kudos feed + right sidebar (skip the Spotlight word-cloud)
- Q: Where does data come from (no kudos board queries exist yet)? → A: Wire to Supabase (real data)
- Q: How functional should interactions be? → A: UI states fully working + persistence (dropdown filtering, carousel center-focus/blur, hover popovers, badge tooltips, like toggle, copy-link toast)
- Q: How to handle sidebar stats + leaderboards + Secret Box (no backing tables)? → A: Stats block real (logged-in user); leaderboards rendered from seeded profiles; Secret Box stays placeholder counts; no new event tables
- Q: How far to build the compose flow (input pill + 'Gửi KUDO')? → A: Functional create dialog that inserts a real kudos (add missing kudos INSERT RLS policy + server action), feed updates
