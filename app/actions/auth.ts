"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Initiates Google OAuth via Supabase PKCE full-page redirect.
 * Call from a form action or onClick handler on the login button.
 *
 * Example (Server Action form):
 *   <form action={signInWithGoogle}><button type="submit">Login</button></form>
 *
 * Example (Client Component):
 *   import { signInWithGoogle } from '@/app/actions/auth';
 *   <button onClick={() => signInWithGoogle()}>Login</button>
 */
export async function signInWithGoogle(): Promise<void> {
  // Prefer a server-controlled base URL over the attacker-controllable `Origin`
  // header. Header values are only a dev-time fallback.
  const headerStore = await headers();
  const rawOrigin = headerStore.get("origin");
  const forwardedHost = headerStore.get("x-forwarded-host");
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    rawOrigin ??
    (forwardedHost ? `https://${forwardedHost}` : "http://localhost:3000");

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth_init_failed");
  }

  // data.url is guaranteed non-null here; the guard above redirects otherwise.
  redirect(data.url as string);
}

/**
 * Signs the current user out and redirects to /login.
 * Call from a form action or button handler.
 *
 * Example:
 *   import { signOut } from '@/app/actions/auth';
 *   <form action={signOut}><button type="submit">Sign out</button></form>
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
