import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns true only after client hydration. Use to gate rendering of state that
 * comes from localStorage (e.g. the cart) so server and first client render
 * match and there's no hydration mismatch.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
