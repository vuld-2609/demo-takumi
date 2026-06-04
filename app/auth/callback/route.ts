import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  // Allow a custom post-auth redirect via the `next` param; default to home.
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Ensure `next` is a relative path to prevent open-redirect attacks.
      const safeNext = next.startsWith("/") ? next : "/";
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // Exchange failed or no code present — send to login with an error hint.
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
