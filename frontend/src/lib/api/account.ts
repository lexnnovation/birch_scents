import type { UserProfile } from "@/types";
import { apiFetch } from "./client";

/** The signed-in user's own profile — always scoped server-side to `auth()->user()`. */

export function getProfile(): Promise<UserProfile> {
  return apiFetch<{ data: UserProfile }>("/me").then((res) => res.data);
}

/**
 * `name` and `email` are excluded — both are Supabase-managed and get
 * re-synced from the login token on every request, so the backend doesn't
 * even accept a `name` write here (it'd just be silently overwritten on
 * the user's next request anyway).
 */
export function updateProfile(
  input: Partial<Omit<UserProfile, "email" | "name">>,
): Promise<UserProfile> {
  return apiFetch<{ data: UserProfile }>("/me", { method: "PATCH", body: input }).then(
    (res) => res.data,
  );
}
