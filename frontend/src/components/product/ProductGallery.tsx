"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { placeholderGradient } from "@/lib/placeholder";
import { cn } from "@/lib/utils";

/**
 * Gallery. Real photography (product.gallery / imageUrl) lands in Phase 11 and
 * will be rendered with next/image; until then we show deterministic gradient
 * panels so the layout is honest.
 */
export function ProductGallery({ product }: { product: Product }) {
  const panels = Array.from({ length: 4 }, (_, i) => placeholderGradient(`${product.slug}-${i}`));
  const [active, setActive] = useState(0);

  return (
    <div>
      <div
        className="aspect-square w-full overflow-hidden rounded-2xl"
        style={{ background: panels[active] }}
      />
      <div className="mt-3 grid grid-cols-4 gap-3">
        {panels.map((g, i) => (
          <button
            key={i}
            aria-label={`View image ${i + 1}`}
            onClick={() => setActive(i)}
            style={{ background: g }}
            className={cn(
              "aspect-square rounded-lg",
              i === active && "ring-brand ring-2 ring-offset-2",
            )}
          />
        ))}
      </div>
    </div>
  );
}
