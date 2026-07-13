"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { setAccessTokenProvider } from "./client";

/**
 * Registers the real Supabase access token as the source `apiFetch` reads
 * from (Phase 10). Mounted once in the root layout; has no visual output.
 * Server Components calling public catalog endpoints never see this
 * provider, so they always fetch unauthenticated — fine, since those
 * endpoints don't require auth.
 */
export function AuthTokenProvider() {
  useEffect(() => {
    const supabase = createClient();

    setAccessTokenProvider(async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    });
  }, []);

  return null;
}
