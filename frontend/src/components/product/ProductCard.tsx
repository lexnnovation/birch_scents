"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { Product, ProductVariant } from "@/types";
import { formatPesewas, discountPercent } from "@/lib/money";
import { placeholderGradient } from "@/lib/placeholder";
import { useCart } from "@/stores/cart";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/** Storefront product card — grey rounded tile, sale/flagship pills, from-price, quick-add. */
export function ProductCard({ product }: { product: Product }) {
  const cheapest = product.variants.reduce(
    (a, b) => (b.pricePesewas < a.pricePesewas ? b : a),
    product.variants[0],
  );
  const pct = discountPercent(cheapest.pricePesewas, cheapest.compareAtPesewas);
  const multi = product.variants.length > 1;
  const inStock = product.variants.some((v) => v.isActive && v.stock > 0);

  return (
    <div className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="bg-secondary relative mb-3 aspect-square overflow-hidden rounded-xl">
          <div
            className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
            style={{ background: placeholderGradient(product.slug) }}
          />
          {product.isFeatured && (
            <span className="bg-primary text-primary-foreground absolute top-2.5 left-2.5 rounded-md px-2 py-1 text-[9px] font-semibold tracking-[0.12em] uppercase">
              Flagship
            </span>
          )}
          {pct !== null && (
            <span className="bg-brand text-brand-foreground absolute bottom-2.5 left-2.5 rounded-md px-2 py-1 text-[11px] font-bold">
              {pct}% OFF
            </span>
          )}
        </div>
        <p className="eyebrow">{product.categoryName}</p>
      </Link>

      {/* Name links to the PDP too, but sits outside the image's <Link> so
          it can share a row with the price without nesting an anchor
          inside another anchor. */}
      <Link href={`/products/${product.slug}`} className="mt-1 flex items-baseline justify-between gap-2">
        <h3 className="min-w-0 truncate text-[15px] leading-snug font-semibold tracking-tight">
          {product.name}
        </h3>
        <span className="flex shrink-0 items-baseline gap-2">
          {multi && <span className="text-muted-foreground text-xs">From</span>}
          <span className="text-[15px] font-semibold tabular-nums">
            {formatPesewas(cheapest.pricePesewas)}
          </span>
          {cheapest.compareAtPesewas !== null && (
            <span className="text-muted-foreground text-[13px] tabular-nums line-through">
              {formatPesewas(cheapest.compareAtPesewas)}
            </span>
          )}
        </span>
      </Link>

      {/* Sits where the price row used to be — a plain sibling, not wrapped
          in the PDP <Link>, since it's interactive. */}
      {inStock && (
        <div className="mt-1.5">
          <QuickAdd product={product} />
        </div>
      )}
    </div>
  );
}

/** Mirrors `BuyPanel`'s size pills + Add to cart button, just compact enough for a card row. */
function QuickAdd({ product }: { product: Product }) {
  const addItem = useCart((s) => s.add);
  const [open, setOpen] = useState(false);
  const firstActive =
    product.variants.find((v) => v.isActive && v.stock > 0) ?? product.variants[0];
  const [variant, setVariant] = useState<ProductVariant>(firstActive);

  function add(v: ProductVariant) {
    addItem(
      {
        variantId: v.id,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        variantLabel: v.label,
        imageUrl: product.imageUrl,
        unitPricePesewas: v.pricePesewas,
      },
      1,
    );
    toast.success(`Added ${product.name} (${v.label}) to cart`);
    setOpen(false);
  }

  if (product.variants.length === 1) {
    return (
      <Button
        type="button"
        size="sm"
        className="shrink-0 uppercase tracking-wide"
        onClick={() => add(product.variants[0])}
      >
        Add to cart
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" size="sm" className="shrink-0 uppercase tracking-wide">
          Add to cart
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-4">
        <p className="eyebrow mb-2 px-1">Size</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
          {product.variants.map((v) => {
            const disabled = !v.isActive || v.stock <= 0;
            const selected = v.id === variant.id;
            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={disabled}
                onClick={() => setVariant(v)}
                className={cn(
                  "rounded-full border px-5 py-2.5 text-sm transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-muted",
                  disabled && "cursor-not-allowed line-through opacity-40",
                )}
              >
                {v.label}
              </button>
            );
          })}
        </div>
        <Button size="pill" className="mt-3 w-full" onClick={() => add(variant)}>
          Add to cart
        </Button>
      </PopoverContent>
    </Popover>
  );
}
