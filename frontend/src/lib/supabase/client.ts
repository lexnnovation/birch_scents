import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client — Auth only (CLAUDE.md §1, §6). Never used to read
 * or write application tables directly; all data goes through the Laravel API.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
