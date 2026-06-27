import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string | null;
  isAdmin: boolean;
};

/**
 * Reads the current Supabase user (server-side) and derives whether they hold
 * the admin role. Role is sourced from `app_metadata.role` first (server-set,
 * trusted), falling back to `user_metadata.role`. Returns null when no session.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Role MUST come only from app_metadata — it is server-controlled. Never
  // trust user_metadata for authorization: it is writable by the user via
  // supabase.auth.updateUser() and would allow self-granted admin access.
  const role = user.app_metadata?.role as string | undefined;

  return {
    id: user.id,
    email: user.email ?? null,
    isAdmin: role === "admin",
  };
}
