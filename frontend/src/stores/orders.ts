import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Order, OrderStatus } from "@/types";

/**
 * Mock orders store — stands in for server-owned orders during UI development.
 * Checkout appends here so the confirmation and order-history pages have real
 * data to render. The admin orders screen updates status via `setStatus`.
 * Phase 10 replaces reads with the API (getOrders/getOrder), the checkout
 * write, and the admin `PATCH /admin/orders/{id}` status transition.
 */
interface OrdersState {
  orders: Order[];
  addOrder: (order: Order) => void;
  setStatus: (orderNumber: string, status: OrderStatus) => void;
}

export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
      setStatus: (orderNumber, status) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.orderNumber === orderNumber ? { ...o, status } : o)),
        })),
    }),
    {
      name: "birchscents-orders",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
