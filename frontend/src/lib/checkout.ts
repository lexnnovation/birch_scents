import type { CartItem, DeliveryDetails, Order } from "@/types";

/**
 * Builds a mock Order from cart items + delivery details. Used by the checkout
 * page during UI development; Phase 9/10 replaces this with the real checkout
 * endpoint (which also generates the order number and re-prices server-side).
 * Kept out of the component so its Date/random calls stay clear of React's
 * render-purity rule.
 */
export function buildOrder(
  items: CartItem[],
  delivery: DeliveryDetails,
  deliveryFeePesewas: number,
): Order {
  const now = new Date();
  const subtotalPesewas = items.reduce((n, i) => n + i.unitPricePesewas * i.quantity, 0);
  const orderNumber = `BS-${now.getFullYear()}-${String(
    Math.floor(Math.random() * 100000),
  ).padStart(5, "0")}`;

  return {
    id: `order_${now.getTime()}`,
    orderNumber,
    status: "pending",
    subtotalPesewas,
    deliveryFeePesewas,
    totalPesewas: subtotalPesewas + deliveryFeePesewas,
    delivery,
    items: items.map((i) => ({
      id: `oi_${i.variantId}`,
      productName: i.productName,
      variantLabel: i.variantLabel,
      unitPricePesewas: i.unitPricePesewas,
      quantity: i.quantity,
      lineTotalPesewas: i.unitPricePesewas * i.quantity,
      imageUrl: i.imageUrl,
    })),
    createdAt: now.toISOString(),
  };
}
