# Clarifications — Login + Supabase Google Auth

Plan: 260604-1006-login-supabase-google-auth
Screens: Login (GzbNeVGJHz), Dropdown-ngôn ngữ (hUyaaugye2)
File: 9ypp4enmFmdK3YAFJLIu6C — "SAA 2025 - Internal Live Coding"

## Session 2026-06-04

- Q: Existing Supabase project with Google OAuth provider configured? → A: No — scaffold code with @supabase/ssr + provide .env.local.example; user configures Supabase dashboard + Google provider and fills env vars
- Q: Post-login redirect destination? → A: Home page `/` (existing root route as the main application page)
- Q: Localization scope for VN/EN switcher? → A: Full i18n via next-intl with real VN + EN message catalogs; translate all visible strings
- Q: Auth route protection scope? → A: Build /login, add middleware + auth callback so sessions work, redirect already-authenticated users away from /login; protecting other routes minimal/stubbed
- Q: OAuth flow style (test cases mention popup/new tab vs redirect)? → A: Standard Supabase full-page redirect via PKCE + /auth/callback route handler (default, satisfies "user info returned + redirect to main page")
- Q: MoMorph MCP tools available in subagents? → A: No — only main thread has access; orchestrator pre-fetches design data + assets and hands them to UI agents
