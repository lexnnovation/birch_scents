"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { getOrderByNumber } from "@/lib/api/orders";
import { useUser } from "@/lib/supabase/use-user";
import type { Order } from "@/types";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { formatPesewas } from "@/lib/money";

export default function ConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { user, loading: authLoading } = useUser();
  const isSignedIn = !!user;
  const router = useRouter();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    if (!authLoading && !isSignedIn) {
      router.replace(`/login?redirectTo=${encodeURIComponent(`/orders/confirmation/${orderNumber}`)}`);
    }
  }, [authLoading, isSignedIn, router, orderNumber]);

  useEffect(() => {
    if (!isSignedIn) return;
    let active = true;
    getOrderByNumber(orderNumber)
      .then((result) => {
        if (active) setOrder(result);
      })
      .catch(() => {
        if (active) setOrder(null);
      });
    return () => {
      active = false;
    };
  }, [orderNumber, isSignedIn]);

  if (authLoading || !isSignedIn || order === undefined) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <Loader2 className="text-muted-foreground mx-auto size-6 animate-spin" />
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold">Order not found</h1>
        <p className="text-muted-foreground mt-3">We couldn&rsquo;t find order {orderNumber}.</p>
        <div className="mt-6">
          <Button asChild variant="brand" size="pill">
            <Link href="/shop">Continue shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 md:px-8">
      <div className="text-center">
        <div className="bg-brand/15 text-brand mx-auto flex size-14 items-center justify-center rounded-full">
          <Check className="size-7" />
        </div>
        <h1 className="mt-5 text-3xl font-extrabold">Thank you for your order</h1>
        <p className="text-muted-foreground mt-2">
          Order <span className="text-foreground font-semibold">{order.orderNumber}</span> ·
          we&rsquo;ll be in touch to arrange delivery.
        </p>
      </div>

      <div className="border-border mt-10 rounded-2xl border p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold">Order summary</h2>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mt-4 space-y-3">
          {order.items.map((i) => (
            <div key={i.id} className="flex justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                {i.quantity} × {i.productName} <span className="text-xs">({i.variantLabel})</span>
              </span>
              <span className="tabular-nums">{formatPesewas(i.lineTotalPesewas)}</span>
            </div>
          ))}
        </div>

        <div className="border-border mt-4 space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatPesewas(order.subtotalPesewas)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span className="tabular-nums">
              {order.deliveryFeePesewas === 0 ? "Free" : formatPesewas(order.deliveryFeePesewas)}
            </span>
          </div>
          <div className="flex justify-between pt-2 text-base font-bold">
            <span>Total</span>
            <span className="tabular-nums">{formatPesewas(order.totalPesewas)}</span>
          </div>
        </div>
      </div>

      <div className="border-border mt-6 rounded-2xl border p-6 text-sm">
        <p className="eyebrow mb-2">Delivering to</p>
        <p className="font-semibold">{order.delivery.name}</p>
        <p className="text-muted-foreground">{order.delivery.phone}</p>
        <p className="text-muted-foreground">
          {order.delivery.address}, {order.delivery.city}
        </p>
        {order.delivery.note && (
          <p className="text-muted-foreground mt-1">Note: {order.delivery.note}</p>
        )}
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Button asChild variant="brand" size="pill">
          <Link href="/orders">My orders</Link>
        </Button>
        <Button asChild variant="outline" size="pill">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
