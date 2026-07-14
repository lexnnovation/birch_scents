"use client";

import Link from "next/link";
import { X, Minus, Plus } from "lucide-react";
import type { CartItem } from "@/types";
import { useCart } from "@/stores/cart";
import { formatPesewas } from "@/lib/money";
import { placeholderGradient } from "@/lib/placeholder";

export function CartLineItem({ item, onNavigate }: { item: CartItem; onNavigate?: () => void }) {
  const updateQty = useCart((s) => s.updateQty);
  const remove = useCart((s) => s.remove);

  return (
    <div className="flex gap-3">
      <Link
        href={`/products/${item.productSlug}`}
        onClick={onNavigate}
        aria-label={item.productName}
        className="size-20 shrink-0 rounded-lg"
        style={{ background: placeholderGradient(item.productSlug) }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-2">
          <Link
            href={`/products/${item.productSlug}`}
            onClick={onNavigate}
            className="min-w-0 truncate text-sm font-semibold hover:underline"
          >
            {item.productName}
          </Link>
          <button
            aria-label="Remove item"
            onClick={() => remove(item.variantId)}
            className="shrink-0"
          >
            <X className="text-muted-foreground hover:text-foreground size-4" />
          </button>
        </div>
        <p className="text-muted-foreground text-xs">{item.variantLabel}</p>
        <div
          className="mt-2 flex flex-wrap items-center justify-between gap-2"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="shrink-0 text-sm font-semibold tabular-nums">
            {formatPesewas(item.unitPricePesewas * item.quantity)}
          </span>
          <div className="border-border flex shrink-0 items-center rounded-full border text-sm">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => updateQty(item.variantId, item.quantity - 1)}
              className="px-2.5 py-1.5"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-7 text-center tabular-nums">{item.quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => updateQty(item.variantId, item.quantity + 1)}
              className="px-2.5 py-1.5"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
