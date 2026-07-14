"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getOrders } from "@/lib/api/orders";
import { useUser } from "@/lib/supabase/use-user";
import type { Order } from "@/types";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { formatPesewas } from "@/lib/money";

export default function OrdersPage() {
  const { user, loading: authLoading } = useUser();
  const isSignedIn = !!user;
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | undefined>(undefined);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!authLoading && !isSignedIn) {
      router.replace(`/login?redirectTo=${encodeURIComponent("/orders")}`);
    }
  }, [authLoading, isSignedIn, router]);

  const load = useCallback(() => {
    getOrders()
      .then((res) => {
        setLoadError(false);
        setOrders(res.data);
      })
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    load();
  }, [isSignedIn, load]);

  if (authLoading || !isSignedIn) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="text-muted-foreground mx-auto size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      <h1 className="text-3xl font-extrabold md:text-4xl">My orders</h1>

      {loadError ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">We couldn&rsquo;t load your orders.</p>
          <div className="mt-6">
            <Button variant="outline" size="pill" onClick={load}>
              Try again
            </Button>
          </div>
        </div>
      ) : orders === undefined ? (
        <div className="py-20 text-center">
          <Loader2 className="text-muted-foreground mx-auto size-6 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
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
          {orders.map((o) => (
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
