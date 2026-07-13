import type { CartItem, DeliveryDetails } from "@/types";
import { apiFetch } from "./client";

/**
 * Flat nationwide delivery fee, for the pre-submission order-summary preview
 * only — must match `backend/config/checkout.php`'s `delivery_fee_pesewas`.
 * The actual charge is always computed server-side (CLAUDE.md §8).
 */
export const DELIVERY_FEE_PESEWAS = 2000;

export interface CheckoutResult {
  authorizationUrl: string;
  reference: string;
  orderNumber: string;
}

/**
 * Submits the cart for server-side re-pricing/validation and Paystack
 * initialization (CLAUDE.md §8, §9). The server recomputes every price and
 * the total — this function sends only variantId/quantity, never money.
 */
export function checkout(items: CartItem[], delivery: DeliveryDetails): Promise<CheckoutResult> {
  return apiFetch<{ data: CheckoutResult }>("/checkout", {
    method: "POST",
    body: {
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      delivery,
    },
  }).then((res) => res.data);
}
