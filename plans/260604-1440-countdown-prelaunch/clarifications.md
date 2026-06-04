# Clarifications — Countdown / Prelaunch page

Plan: 260604-1440-countdown-prelaunch
Screen: Countdown - Prelaunch page (8PJQswPZmU), file 9ypp4enmFmdK3YAFJLIu6C

## Session 2026-06-04

- Q: Countdown target date/time? → A: Read from env `NEXT_PUBLIC_COUNTDOWN_TARGET` (ISO 8601) with a placeholder default in code; user sets the real event datetime without code change
- Q: Route + access? → A: New route `/countdown`, PUBLIC (add to proxy public paths so unauthenticated users can view)
- Q: LED digit font ("Digital Numbers" is proprietary)? → A: Self-host DSEG7-Classic (open-source LED/7-segment web font)
- Q: i18n? → A: Title translated via existing next-intl (vi/en); unit labels stay English (DAYS/HOURS/MINUTES) per design
- Q: Seconds unit? → A: No — design + test cases only define Days/Hours/Minutes (two digits each, leading zero, clamp invalid/negative to 00)
