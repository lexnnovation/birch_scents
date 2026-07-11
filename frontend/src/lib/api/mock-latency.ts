/**
 * Simulates network latency so the UI's loading states are exercised while we
 * develop against mock data (Phases 2–5). Deleted when the data layer switches
 * to real HTTP in Phase 10.
 */
export function withDelay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
