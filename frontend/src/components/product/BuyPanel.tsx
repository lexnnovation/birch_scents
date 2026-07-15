"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductVariant } from "@/types";
import { Button } from "@/components/ui/button";
import { formatPesewas, discountPercent } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useCart } from "@/stores/cart";

/**
 * Purchase panel — size selector, quantity, price, and add-to-cart. The add
 * handler is a placeholder toast; Phase 5 wires it to the cart store without
 * changing this component's shape.
 */
export function BuyPanel({ product }: { product: Product }) {
  const firstActive =
    product.variants.find((v) => v.isActive && v.stock > 0) ?? product.variants[0];
  const [variant, setVariant] = useState<ProductVariant>(firstActive);
  const [qty, setQty] = useState(1);
  const addItem = useCart((s) => s.add);

  const pct = discountPercent(variant.pricePesewas, variant.compareAtPesewas);
  const outOfStock = !variant.isActive || variant.stock <= 0;

  function add() {
    addItem(
      {
        variantId: variant.id,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        categorySlug: product.categorySlug,
        variantLabel: variant.label,
        imageUrl: product.imageUrl,
        unitPricePesewas: variant.pricePesewas,
      },
      qty,
    );
    toast.success(`Added ${qty} × ${product.name} (${variant.label}) to cart`);
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-2xl font-extrabold tabular-nums">
          {formatPesewas(variant.pricePesewas)}
        </span>
        {variant.compareAtPesewas !== null && (
          <span className="text-muted-foreground tabular-nums line-through">
            {formatPesewas(variant.compareAtPesewas)}
          </span>
        )}
        {pct !== null && (
          <span className="bg-brand text-brand-foreground rounded-md px-2 py-0.5 text-xs font-bold">
            {pct}% OFF
          </span>
        )}
      </div>

      {product.variants.length > 1 && (
        <div className="mt-6">
          <p className="eyebrow mb-2">Size</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Size">
            {product.variants.map((v) => {
              const disabled = !v.isActive || v.stock <= 0;
              const selected = v.id === variant.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={selected}
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
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <div className="border-border flex items-center rounded-full border">
          <button
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="p-3"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center tabular-nums">{qty}</span>
          <button
            aria-label="Increase quantity"
            onClick={() => setQty((q) => q + 1)}
            className="p-3"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <Button size="pill" className="flex-1" disabled={outOfStock} onClick={add}>
          {outOfStock ? "Out of stock" : "Add to cart"}
        </Button>
      </div>
    </div>
  );
}
