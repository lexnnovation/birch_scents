"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fadeIn, fadeUp, revealTransition } from "@/lib/motion";

interface HeroSlide {
  image: string;
  eyebrow: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

// Meantime reference photography (small source files — a visible upgrade
// once real photography lands in Phase 11.7, no component changes needed).
const SLIDES: HeroSlide[] = [
  {
    image: "/hero/hero-1.jpg",
    eyebrow: "Signature · Snow Melon",
    headline: "Inhale and Feel the Difference",
    body: "A crisp, sweet, refreshing scent that turns any room into a welcome. FDA-approved, long-lasting, and crafted in Accra.",
    ctaLabel: "Shop Snow Melon",
    ctaHref: "/products/snow-melon",
  },
  {
    image: "/hero/hero-2.jpg",
    eyebrow: "Crafted in Accra",
    headline: "Find Your Signature Scent",
    body: "Reed diffusers, room sprays, fragrance oils, and humidifiers — every atmosphere Birchscents makes, in one place.",
    ctaLabel: "Shop All Fragrances",
    ctaHref: "/shop",
  },
  {
    image: "/hero/hero-3.jpg",
    eyebrow: "Reed Diffusers",
    headline: "Effortless, All-Day Fragrance",
    body: "No flame, no upkeep — just a slow, steady scent that fills a room and holds for weeks.",
    ctaLabel: "Shop Reed Diffusers",
    ctaHref: "/shop/reed-diffusers",
  },
];

const AUTO_ADVANCE_MS = 6000;

export function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (reducedMotion || paused) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reducedMotion, paused, index]);

  const slide = SLIDES[index];

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.image}
          className="absolute inset-0"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={fadeIn}
          transition={revealTransition(reducedMotion)}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />

      <div className="relative mx-auto flex min-h-[560px] max-w-310 flex-col items-center justify-center px-4 py-24 text-center text-white md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.headline}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeUp}
            transition={revealTransition(reducedMotion)}
            className="flex flex-col items-center"
          >
            <p className="eyebrow text-white/85">{slide.eyebrow}</p>
            <h1 className="mt-4 max-w-[16ch] text-4xl leading-[1.05] font-extrabold text-balance md:text-6xl">
              {slide.headline}
            </h1>
            <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-white/90 md:text-base">
              {slide.body}
            </p>
            <div className="mt-8">
              <Button asChild size="pill">
                <Link href={slide.ctaHref}>{slide.ctaLabel}</Link>
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex gap-2" role="group" aria-label="Hero slides">
          {SLIDES.map((s, i) => (
            <button
              key={s.image}
              type="button"
              aria-label={`Go to slide ${i + 1} of ${SLIDES.length}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/45",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
