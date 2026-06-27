import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Public paths that never require authentication. */
const PUBLIC_PATHS = ["/login", "/auth", "/countdown"];

function isPublicPath(pathname: string): boolean {
  // Homepage ("/") now requires authentication — unauthenticated visitors are
  // redirected to /login. Only the paths in PUBLIC_PATHS stay open.
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

/**
 * Refreshes the Supabase session stored in cookies and enforces auth redirects:
 * - Unauthenticated users hitting protected routes → /login
 * - Authenticated users hitting /login → /
 *
 * Must be called from Next.js middleware so cookies can be mutated on the response.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: do NOT remove this call — it refreshes the session.
  // Do not write any logic that short-circuits before getUser() resolves.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === "/login") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  return supabaseResponse;
}
