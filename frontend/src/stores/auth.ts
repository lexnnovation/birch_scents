import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Mock session store — a UI-only stand-in for Supabase Auth (Phase 7).
 * It exists so the auth gate (checkout → login) and the admin guard are
 * demonstrable while everything is mock-backed. Phase 7 deletes this store and
 * replaces its reads with the real Supabase session / `useUser` hook.
 *
 * There is no real identity or admin role here: any "signed-in" mock user can
 * reach /admin. The genuine gate is the Laravel `EnsureAdmin` middleware later.
 */
interface AuthState {
  /** Signed-in user's email, or null when signed out. */
  email: string | null;
  signIn: (email: string) => void;
  signOut: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      email: null,
      signIn: (email) => set({ email }),
      signOut: () => set({ email: null }),
    }),
    {
      name: "birchscents-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/** Selector: true when a mock session exists. */
export const selectIsSignedIn = (s: AuthState) => s.email !== null;
