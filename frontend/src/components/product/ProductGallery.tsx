"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/types";
import { getCategoryImages } from "@/lib/placeholder";
import { cn } from "@/lib/utils";

/**
 * Gallery. Prefers real per-product photography (`product.gallery`) once the
 * admin dashboard can set it; until then, cycles the category's meantime
 * reference photo(s) to fill 4 panels.
 */
export function ProductGallery({ product }: { product: Product }) {
  const source = product.gallery.length > 0 ? product.gallery : getCategoryImages(product.categorySlug);
  const panels = Array.from({ length: 4 }, (_, i) => source[i % source.length]);
  const [active, setActive] = useState(0);
  // Hover/focus previews a thumbnail without changing the persisted selection —
  // clears back to `active` the moment the mouse leaves (or focus moves away).
  const [hovered, setHovered] = useState<number | null>(null);
  const displayed = hovered ?? active;

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
        <Image
          src={panels[displayed]}
          alt={product.name}
          fill
          priority
          sizes="(min-width: 768px) 46vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {panels.map((src, i) => (
          <button
            key={i}
            type="button"
            aria-label={`View image ${i + 1}`}
            onClick={() => setActive(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-lg",
              i === active && "ring-brand ring-2 ring-offset-2",
            )}
          >
            <Image src={src} alt="" fill sizes="120px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
