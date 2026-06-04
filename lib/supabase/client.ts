import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Warn at module load time in browser; do not throw so the app can still
  // render error/loading states without crashing at import.
  console.warn(
    "[supabase/client] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Copy .env.local.example to .env.local and fill in the values."
  );
}

export function createClient() {
  return createBrowserClient(
    // Fall back to empty strings so createBrowserClient does not throw;
    // API calls will fail at runtime which surfaces a clear error.
    supabaseUrl ?? "",
    supabaseAnonKey ?? ""
  );
}
