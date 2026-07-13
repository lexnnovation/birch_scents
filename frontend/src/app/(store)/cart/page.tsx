"use client";

import Link from "next/link";
import { useCart, cartSubtotal } from "@/stores/cart";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { Button } from "@/components/ui/button";
import { formatPesewas } from "@/lib/money";
import { useHydrated } from "@/lib/use-hydrated";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const list = useHydrated() ? items : [];

  return (
    <div className="mx-auto max-w-310 px-4 py-12 md:px-8">
      <h1 className="text-3xl font-extrabold md:text-4xl">Your cart</h1>

      {list.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <div className="mt-6">
            <Button asChild variant="brand" size="pill">
              <Link href="/shop">Shop fragrances</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {list.map((i) => (
              <CartLineItem key={i.variantId} item={i} />
            ))}
          </div>
          <aside className="border-border bg-secondary/40 h-fit rounded-2xl border p-6">
            <h2 className="font-heading text-lg font-bold">Order summary</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold tabular-nums">
                {formatPesewas(cartSubtotal(list))}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Delivery calculated at checkout.</p>
            <Button asChild size="pill" className="mt-6 w-full">
              <Link href="/checkout">Checkout</Link>
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
