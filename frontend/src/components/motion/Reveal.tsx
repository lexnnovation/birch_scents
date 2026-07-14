"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, revealTransition, revealViewport } from "@/lib/motion";

/**
 * Fade + rise on scroll-into-view (CLAUDE.md §3). A small client wrapper so
 * the marketing sections it's used in stay Server Components — only this
 * wrapper needs the browser to observe scroll position, not their content.
 */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      variants={fadeUp}
      transition={revealTransition(reducedMotion)}
      className={className}
    >
      {children}
    </motion.div>
  );
}
