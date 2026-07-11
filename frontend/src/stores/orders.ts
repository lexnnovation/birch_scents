import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Order } from "@/types";

/**
 * Mock orders store — stands in for server-owned orders during UI development.
 * Checkout appends here so the confirmation and order-history pages have real
 * data to render. Phase 10 replaces reads with the API (getOrders/getOrder) and
 * writes with the checkout endpoint.
 */
interface OrdersState {
  orders: Order[];
  addOrder: (order: Order) => void;
}

export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
    }),
    {
      name: "birchscents-orders",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
