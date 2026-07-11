import type { Transition, Variants } from "framer-motion";

/**
 * Shared motion presets. Keep animation quiet and premium — gentle fades and
 * small offsets, never bouncy. Components should read `useReducedMotion()` and
 * pass the result to `revealTransition(reduced)` (or skip animation entirely)
 * so motion-sensitive users get a static experience.
 */

const EASE_OUT: Transition["ease"] = [0.22, 1, 0.36, 1];

/** Fade + rise on scroll-into-view. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

/** Plain fade, no movement. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** Parent container that staggers its children's reveal. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

/** Subtle lift for interactive cards on hover. */
export const hoverLift = {
  rest: { y: 0 },
  hover: { y: -4 },
};

/** Transition for reveal animations; flattened to instant under reduced motion. */
export function revealTransition(reducedMotion: boolean | null): Transition {
  return reducedMotion ? { duration: 0 } : { duration: 0.5, ease: EASE_OUT };
}

/** Standard viewport config for scroll-triggered reveals. */
export const revealViewport = { once: true, amount: 0.3 } as const;
