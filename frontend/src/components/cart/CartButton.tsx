"use client";

import { ShoppingBag } from "lucide-react";
import { useCart, cartCount } from "@/stores/cart";
import { useHydrated } from "@/lib/use-hydrated";

/** Header cart icon with live count; opens the cart drawer. */
export function CartButton() {
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.openCart);
  const count = useHydrated() ? cartCount(items) : 0;

  return (
    <button aria-label="Open cart" onClick={openCart} className="inline-flex items-center gap-1.5">
      <ShoppingBag className="size-5" />
      <span className="text-sm tabular-nums">{count}</span>
    </button>
  );
}
