import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase session cookie on every request so Server Components
 * always see a valid (non-expired) session (CLAUDE.md §6). This is Next.js's
 * `middleware.ts` file convention, renamed to `proxy.ts` as of Next 16 — the
 * exported function is `proxy`, not `middleware`.
 *
 * No redirect/authorization logic lives here: per Next's guidance, Proxy runs
 * on prefetched routes too, so only optimistic, cookie-only checks belong
 * here. Route-level auth gates (checkout, /admin) stay in the page/layout via
 * `useUser()`, matching CLAUDE.md's client-side auth gate UX.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Re-validates against Supabase and refreshes the token if needed; the
  // return value is discarded — its only job is triggering the cookie writes
  // above via setAll().
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|avif)$).*)"],
};
