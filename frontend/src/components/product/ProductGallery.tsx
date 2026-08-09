"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/types";
import { getCategoryImages } from "@/lib/placeholder";
import { cn } from "@/lib/utils";

/**
 * Gallery. Prefers real per-product photography (`imageUrl` as the hero,
 * followed by `gallery`) — shows every real photo the product has, however
 * many that is. Falls back to the category's meantime reference photo(s),
 * cycled to fill 4 panels, only when a product has no photography yet.
 */
export function ProductGallery({ product }: { product: Product }) {
  const own = [product.imageUrl, ...product.gallery].filter((src): src is string => Boolean(src));
  const source = own.length > 0 ? own : getCategoryImages(product.categorySlug);
  const panels = own.length > 0 ? source : Array.from({ length: 4 }, (_, i) => source[i % source.length]);
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
