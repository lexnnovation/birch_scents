"use client";

import { useEffect, useState } from "react";
import { createClient } from "./client";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
}

interface UseUserState {
  user: SessionUser | null;
  /** True until the first auth check resolves. */
  loading: boolean;
}

function toSessionUser(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
} | null): SessionUser | null {
  if (!user || !user.email) return null;
  const meta = user.user_metadata ?? {};
  const name = (meta.name as string | undefined) ?? (meta.full_name as string | undefined) ?? null;
  return { id: user.id, email: user.email, name };
}

/**
 * The real Supabase session (CLAUDE.md §6), replacing the Phase 5 mock auth
 * store. Uses `getUser()` on load — it re-validates against Supabase rather
 * than trusting a possibly-stale local session — then stays in sync via
 * `onAuthStateChange` for sign-in/sign-out/token-refresh events.
 */
export function useUser(): UseUserState {
  const [state, setState] = useState<UseUserState>({ user: null, loading: true });

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) setState({ user: toSessionUser(data.user), loading: false });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setState({ user: toSessionUser(session?.user ?? null), loading: false });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
