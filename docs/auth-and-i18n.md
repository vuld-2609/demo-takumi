# Auth & i18n

Stack: Next.js 16.2.7 App Router · @supabase/ssr · next-intl (cookie-based)

---

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_APP_URL` | Public base URL — required in production (e.g. `https://your-domain.com`). Defaults to `http://localhost:3000` locally. |

---

## Supabase dashboard setup

1. **Enable Google provider** — Authentication → Providers → Google → toggle on, enter OAuth Client ID + Secret.
2. **Add redirect URL** — Authentication → URL Configuration → Redirect URLs:
   - `http://localhost:3000/auth/callback` (dev)
   - `https://your-domain.com/auth/callback` (prod)

---

## Auth flow

```
User clicks "Sign in with Google"
  → signInWithGoogle() [app/actions/auth.ts]
    → supabase.auth.signInWithOAuth({ redirectTo: <origin>/auth/callback })
      → Google OAuth consent
        → GET /auth/callback?code=...  [app/auth/callback/route.ts]
          → exchangeCodeForSession(code)
            → redirect to /  (or ?next= param if provided)
```

**Sign-out:** `signOut()` in `app/actions/auth.ts` calls `supabase.auth.signOut()` then redirects to `/login`.

**Callback error handling:** If the code exchange fails, the user is redirected to `/login?error=auth_callback_failed`. The `next` param is validated as a relative path to prevent open-redirect attacks.

---

## Route protection (proxy.ts)

Next.js 16 uses `proxy.ts` (not `middleware.ts`) as the request interceptor. `lib/supabase/middleware.ts#updateSession` runs on every non-static request and:

- Refreshes the Supabase session in cookies.
- Unauthenticated request to a protected route → redirect to `/login`.
- Authenticated user hitting `/login` → redirect to `/`.

Public paths (no auth required): `/login`, `/auth/*`.

---

## i18n

Supported locales: `vi` (default), `en`. No URL-based routing — locale is stored in the `NEXT_LOCALE` cookie (1-year expiry, `sameSite: lax`).

**Switching locale:**
```ts
import { setLocale } from '@/app/actions/locale';
// In a client component:
<button onClick={() => setLocale('en')}>EN</button>
<button onClick={() => setLocale('vi')}>VN</button>
```

`setLocale` persists the cookie and calls `revalidatePath('/', 'layout')` so the new language takes effect without a full reload.

**Adding translations:** Add keys to `messages/vi.json` and `messages/en.json`. Access via `useTranslations()` (client) or `getTranslations()` (server).

---

## Key files

| File | Purpose |
|---|---|
| `proxy.ts` | Next.js 16 request interceptor — session refresh + auth redirects |
| `lib/supabase/server.ts` | Supabase client for Server Components / Route Handlers |
| `lib/supabase/middleware.ts` | Session refresh logic + public path guard |
| `app/actions/auth.ts` | `signInWithGoogle`, `signOut` server actions |
| `app/auth/callback/route.ts` | OAuth callback — exchanges code for session |
| `i18n/locale.ts` | Cookie read/write for locale; constants `LOCALES`, `DEFAULT_LOCALE` |
| `i18n/request.ts` | next-intl config — loads messages per locale |
| `messages/{vi,en}.json` | Translation strings |
