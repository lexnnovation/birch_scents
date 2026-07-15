"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, revealTransition, revealViewport } from "@/lib/motion";

/**
 * Fade + rise, either on scroll-into-view or immediately on mount
 * (CLAUDE.md §3). A small client wrapper so the marketing sections it's used
 * in stay Server Components — only this wrapper needs the browser to observe
 * scroll position / run the animation, not their content.
 *
 * `trigger="mount"` is for sections that sit near the fold on load — waiting
 * for scroll there leaves a blank, seemingly-unfinished gap since the section
 * never crosses the scroll-into-view threshold until the user scrolls.
 */
export function Reveal({
  children,
  className,
  trigger = "scroll",
}: {
  children: React.ReactNode;
  className?: string;
  trigger?: "scroll" | "mount";
}) {
  const reducedMotion = useReducedMotion();

  const viewportProps =
    trigger === "scroll" ? { whileInView: "visible", viewport: revealViewport } : { animate: "visible" };

  return (
    <motion.div
      initial="hidden"
      variants={fadeUp}
      transition={revealTransition(reducedMotion)}
      className={className}
      {...viewportProps}
    >
      {children}
    </motion.div>
  );
}
