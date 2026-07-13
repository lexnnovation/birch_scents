"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/stores/cart";
import { useHydrated } from "@/lib/use-hydrated";
import { getOrderByNumber } from "@/lib/api/orders";

/**
 * Renders nothing. Catches up a cart left stuck by a delayed payment
 * confirmation: `/checkout/callback` clears the cart itself, but only while
 * its ~30s polling window is still open. If the webhook lands after that
 * (or after the shopper has navigated away), the cart would otherwise stay
 * full of items already paid for. Mounted once at the storefront layout
 * level, so the very next page load anywhere on the site re-checks.
 */
export function CartOrderSync() {
  const hydrated = useHydrated();
  const pendingOrderNumber = useCart((s) => s.pendingOrderNumber);
  const clear = useCart((s) => s.clear);
  const checked = useRef(false);

  useEffect(() => {
    if (!hydrated || !pendingOrderNumber || checked.current) return;
    checked.current = true;

    getOrderByNumber(pendingOrderNumber)
      .then((order) => {
        if (order && order.status !== "pending") clear();
      })
      .catch(() => {
        // Stay quiet — this is a background catch-up, not the primary
        // confirmation UX. Next page load tries again.
      });
  }, [hydrated, pendingOrderNumber, clear]);

  return null;
}
