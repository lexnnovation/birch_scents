import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/types";

/**
 * Client-side cart (CLAUDE.md §1). Items are keyed by variantId; money stays in
 * integer pesewas. Only `items` is persisted to localStorage — drawer state is
 * ephemeral. The server re-prices everything at checkout, so this is never
 * trusted as the source of truth for totals.
 */
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  /**
   * Order number awaiting payment confirmation, set right before the
   * Paystack redirect. `/checkout/callback` clears the cart the moment it
   * confirms — but if the webhook lands after that page's polling window
   * (or after the shopper has already navigated away), this survives
   * across reloads so the next storefront page load can catch up and
   * clear the cart instead of leaving already-purchased items stuck in it.
   */
  pendingOrderNumber: string | null;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  updateQty: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setPendingOrder: (orderNumber: string | null) => void;
  openCart: () => void;
  closeCart: () => void;
  setOpen: (open: boolean) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      pendingOrderNumber: null,
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.variantId === item.variantId);
          const items = existing
            ? s.items.map((i) =>
                i.variantId === item.variantId ? { ...i, quantity: i.quantity + qty } : i,
              )
            : [...s.items, { ...item, quantity: qty }];
          return { items, isOpen: true };
        }),
      updateQty: (variantId, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.variantId !== variantId)
              : s.items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
        })),
      remove: (variantId) =>
        set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),
      clear: () => set({ items: [], pendingOrderNumber: null }),
      setPendingOrder: (orderNumber) => set({ pendingOrderNumber: orderNumber }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setOpen: (open) => set({ isOpen: open }),
    }),
    {
      name: "birchscents-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, pendingOrderNumber: s.pendingOrderNumber }),
    },
  ),
);

/** Derived helpers — compute from a snapshot of items. */
export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((n, i) => n + i.unitPricePesewas * i.quantity, 0);
