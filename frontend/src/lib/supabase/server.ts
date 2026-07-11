import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Supabase client for Server Components/Actions — Auth only
 * (CLAUDE.md §1, §6). Cookie writes here are best-effort: a Server Component
 * can't set cookies, so session refresh during rendering relies on `proxy.ts`
 * having already refreshed and re-set them earlier in the request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — ignored, see doc comment above.
          }
        },
      },
    },
  );
}
