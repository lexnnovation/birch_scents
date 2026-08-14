import type { ApiError } from "@/types";

/**
 * Typed fetch wrapper for the Laravel REST API.
 *
 * STATUS: stub. During Phases 2–5 the resource modules (`products.ts`,
 * `categories.ts`, …) return mock data and do NOT call this. In Phase 10 their
 * bodies switch to `apiFetch(...)` — signatures and return types are unchanged,
 * so pages and components need no edits.
 *
 * Auth: the Supabase access token is supplied by a provider registered in
 * Phase 7 (so this module has no Supabase dependency). Until then it is null
 * and requests go out unauthenticated.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

let getAccessToken: () => Promise<string | null> = async () => null;

/** Registered once at app startup (Phase 7) to source the Supabase JWT. */
export function setAccessTokenProvider(provider: () => Promise<string | null>) {
  getAccessToken = provider;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Query params appended to the URL. */
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  /**
   * Seconds before Next's fetch cache revalidates. Omit for authenticated,
   * per-user, or mutating requests — those must always be fresh (no-store).
   * Only public, non-personalized reads (catalog) should set this.
   */
  revalidate?: number;
}

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const url = new URL(path.replace(/^\//, ""), BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params, signal, revalidate } = options;
  const token = await getAccessToken();

  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      ...(revalidate === undefined ? { cache: "no-store" } : { next: { revalidate } }),
    });
  } catch {
    // The request never reached a response at all (offline, DNS failure,
    // connection refused) — normalize into the same ApiError shape every
    // caller already expects, instead of leaking a raw browser message
    // like "Failed to fetch". status 0 marks "never got a response".
    const error: ApiError = {
      message: "We couldn't reach Birchscents. Check your connection and try again.",
      status: 0,
    };
    throw error;
  }

  if (!response.ok) {
    let payload: Partial<ApiError> = {};
    try {
      payload = await response.json();
    } catch {
      // non-JSON error body — fall through to a generic message
    }
    const error: ApiError = {
      message: payload.message ?? `Request failed (${response.status})`,
      errors: payload.errors,
      status: response.status,
    };
    throw error;
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
