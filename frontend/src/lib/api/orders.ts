import type { ApiError, Order, Paginated } from "@/types";
import { apiFetch } from "./client";

/** Order reads — always the authenticated user's own orders (enforced server-side). */

export function getOrders(): Promise<Paginated<Order>> {
  return apiFetch<Paginated<Order>>("/orders");
}

export function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  return apiFetch<{ data: Order }>(`/orders/${orderNumber}`)
    .then((res) => res.data)
    .catch((error: ApiError) => {
      if (error.status === 404) return null;
      throw error;
    });
}
