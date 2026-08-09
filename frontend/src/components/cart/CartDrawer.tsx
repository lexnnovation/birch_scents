"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart, cartSubtotal, cartCount } from "@/stores/cart";
import { formatPesewas } from "@/lib/money";
import { useHydrated } from "@/lib/use-hydrated";
import { CartLineItem } from "./CartLineItem";

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const setOpen = useCart((s) => s.setOpen);
  const closeCart = useCart((s) => s.closeCart);
  const items = useCart((s) => s.items);

  const list = useHydrated() ? items : [];

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-border border-b">
          <SheetTitle>Your cart ({cartCount(list)})</SheetTitle>
        </SheetHeader>

        {list.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild variant="brand" size="pill" onClick={closeCart}>
              <Link href="/shop">Shop fragrances</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {list.map((i) => (
                <CartLineItem key={i.variantId} item={i} onNavigate={closeCart} />
              ))}
            </div>
            <SheetFooter className="border-border border-t">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold tabular-nums">
                  {formatPesewas(cartSubtotal(list))}
                </span>
              </div>
              <Button asChild variant="brand" size="pill" className="w-full" onClick={closeCart}>
                <Link href="/checkout">Checkout</Link>
              </Button>
              <Button asChild variant="outline" size="pill" className="w-full" onClick={closeCart}>
                <Link href="/cart">View cart</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
