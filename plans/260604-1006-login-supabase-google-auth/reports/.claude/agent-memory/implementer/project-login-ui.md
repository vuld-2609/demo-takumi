---
name: project-login-ui
description: Login screen UI implementation status and orchestrator integration seams
metadata:
  type: project
---

Login screen UI built as four presentational files under `app/login/`. All components are prop-driven with no Supabase/auth/i18n logic.

**Why:** Orchestrator wires Supabase OAuth handler, language-dropdown, and next-intl translation keys in a later phase.

**How to apply:** When integrating, pass `onLogin`/`loading` to LoginHero, `onLanguageClick` to LoginHeader, and replace hardcoded VN strings with `t()` calls. The `language-dropdown.tsx` component (separate agent) slots into LoginHeader's switcher area.
