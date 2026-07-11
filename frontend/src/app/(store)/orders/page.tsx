"use client";

import Link from "next/link";
import { useOrders } from "@/stores/orders";
import { useHydrated } from "@/lib/use-hydrated";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { formatPesewas } from "@/lib/money";

export default function OrdersPage() {
  const hydrated = useHydrated();
  const orders = useOrders((s) => s.orders);
  const list = hydrated ? orders : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      <h1 className="text-3xl font-extrabold md:text-4xl">My orders</h1>

      {hydrated && list.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">You haven&rsquo;t placed any orders yet.</p>
          <div className="mt-6">
            <Button asChild variant="brand" size="pill">
              <Link href="/shop">Shop fragrances</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {list.map((o) => (
            <Link
              key={o.id}
              href={`/orders/confirmation/${o.orderNumber}`}
              className="border-border hover:bg-muted/50 block rounded-2xl border p-5 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{o.orderNumber}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(o.createdAt).toLocaleDateString("en-GH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {o.items.reduce((n, i) => n + i.quantity, 0)} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={o.status} />
                  <span className="font-semibold tabular-nums">
                    {formatPesewas(o.totalPesewas)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
