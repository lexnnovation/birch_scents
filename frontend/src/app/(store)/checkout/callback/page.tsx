"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useCart } from "@/stores/cart";
import { getOrderByNumber } from "@/lib/api/orders";
import { Button } from "@/components/ui/button";

/**
 * Paystack redirects here after checkout (CLAUDE.md §9) — this page never
 * marks anything paid itself; it only polls our own API, which only reflects
 * `paid` once the webhook has verified and fulfilled the payment. The cart is
 * cleared only once that's confirmed (PROJECT_TODO 10.4).
 */
const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 15; // ~30s

export default function CheckoutCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <Loader2 className="text-muted-foreground mx-auto size-6 animate-spin" />
        </div>
      }
    >
      <CheckoutCallbackContent />
    </Suspense>
  );
}

function CheckoutCallbackContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  if (!orderNumber) {
    return <NotFoundView />;
  }

  return <PollingView orderNumber={orderNumber} />;
}

type PollStatus = "polling" | "timeout" | "not-found";

function PollingView({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const clearCart = useCart((s) => s.clear);
  const [status, setStatus] = useState<PollStatus>("polling");
  const attempts = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      let order;
      try {
        order = await getOrderByNumber(orderNumber);
      } catch {
        if (!cancelled) setStatus("not-found");
        return;
      }

      if (cancelled) return;

      if (!order) {
        setStatus("not-found");
        return;
      }

      if (order.status !== "pending") {
        clearCart();
        router.replace(`/orders/confirmation/${orderNumber}`);
        return;
      }

      attempts.current += 1;
      if (attempts.current >= MAX_ATTEMPTS) {
        setStatus("timeout");
        return;
      }

      setTimeout(poll, POLL_INTERVAL_MS);
    }

    poll();

    return () => {
      cancelled = true;
    };
  }, [orderNumber, clearCart, router]);

  if (status === "not-found") return <NotFoundView />;

  if (status === "timeout") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold">Still confirming your payment</h1>
        <p className="text-muted-foreground mt-3">
          This is taking longer than usual. Your order will update automatically once it&rsquo;s
          confirmed — check My Orders shortly.
        </p>
        <div className="mt-6 flex justify-center gap-3">
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

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <Loader2 className="text-brand mx-auto size-8 animate-spin" />
      <h1 className="mt-5 text-2xl font-extrabold">Confirming your payment…</h1>
      <p className="text-muted-foreground mt-3">This only takes a few seconds.</p>
    </div>
  );
}

function NotFoundView() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-extrabold">We couldn&rsquo;t find that order</h1>
      <p className="text-muted-foreground mt-3">
        If you completed payment, check your order history — it may just take a moment to appear.
      </p>
      <div className="mt-6 flex justify-center gap-3">
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
