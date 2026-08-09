"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fadeUp, revealTransition } from "@/lib/motion";

interface HeroSlide {
  imageDesktop: string;
  imageMobile: string;
  eyebrow: string;
  headline: string;
  ctaLabel: string;
  ctaHref: string;
}

const SLIDES: HeroSlide[] = [
  {
    imageDesktop: "/hero/1-desktop.webp",
    imageMobile: "/hero/1-mobile.webp",
    eyebrow: "Signature · Snow Melon",
    headline: "Inhale and Feel the Difference",
    ctaLabel: "Shop Snow Melon",
    ctaHref: "/products/snow-melon",
  },
  {
    imageDesktop: "/hero/2-desktop.webp",
    imageMobile: "/hero/2-mobile.webp",
    eyebrow: "Crafted in Accra",
    headline: "Find Your Signature Scent",
    ctaLabel: "Shop All Fragrances",
    ctaHref: "/shop",
  },
  {
    imageDesktop: "/hero/3-desktop.webp",
    imageMobile: "/hero/3-mobile.webp",
    eyebrow: "Reed Diffusers",
    headline: "Effortless, All-Day Fragrance",
    ctaLabel: "Shop Reed Diffusers",
    ctaHref: "/shop/reed-diffusers",
  },
];

const AUTO_ADVANCE_MS = 6000;
const SWIPE_THRESHOLD = 50;

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

  function next() {
    setIndex((i) => (i + 1) % SLIDES.length);
  }
  function prev() {
    setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  }
  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) next();
    else if (info.offset.x > SWIPE_THRESHOLD) prev();
  }

  const slide = SLIDES[index];

  return (
    <section
      className="relative overflow-hidden md:aspect-[20/9]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* All slides stay mounted (preloaded) and crossfade via opacity — a
          mount/unmount-per-slide approach left lazy-loaded slides showing a
          blank flash the first time the carousel reached them. */}
      <motion.div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
      >
        {SLIDES.map((s, i) => (
          <div
            key={s.imageDesktop}
            className={cn(
              "absolute inset-0 transition-opacity ease-out",
              i === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            style={{ transitionDuration: reducedMotion ? "0ms" : "600ms" }}
          >
            <Image
              src={s.imageDesktop}
              alt=""
              fill
              priority
              sizes="100vw"
              className="hidden object-cover md:block"
            />
            <Image
              src={s.imageMobile}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover md:hidden"
            />
          </div>
        ))}
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/30" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />

      <div className="pointer-events-none relative mx-auto flex min-h-[560px] max-w-310 flex-col items-center justify-start px-4 pt-16 pb-24 text-center text-white md:h-full md:min-h-0 md:items-start md:justify-center md:px-8 md:pt-16 md:pb-32 md:text-left">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.headline}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeUp}
            transition={revealTransition(reducedMotion)}
            className="flex flex-col items-center md:items-start"
          >
            <p className="eyebrow text-white/85">{slide.eyebrow}</p>
            <h1 className="mt-4 max-w-[16ch] text-4xl leading-[1.05] font-extrabold text-balance md:text-6xl">
              {slide.headline}
            </h1>
            <div className="pointer-events-auto mt-8">
              <Button
                asChild
                variant="brand"
                size="pill"
                className="hover:bg-background hover:text-foreground"
              >
                <Link href={slide.ctaHref}>{slide.ctaLabel}</Link>
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        <div
          className="pointer-events-auto absolute inset-x-4 bottom-4 flex justify-center gap-2 md:inset-x-8 md:bottom-6"
          role="group"
          aria-label="Hero slides"
        >
          {SLIDES.map((s, i) => (
            <button
              key={s.imageDesktop}
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
