"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Catches any thrown error in shop/category/PDP/landing/cart/checkout/orders.
 * `error.tsx` wraps the page and nested children in a boundary but not the
 * layout in its own segment, so `(store)/layout.tsx`'s header/footer/
 * announcement bar stay visible around this — the shopper never lands on a
 * bare, unbranded page (CLAUDE.md §3).
 */
export default function StoreError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-3 text-3xl font-extrabold">We hit a snag</h1>
      <p className="text-muted-foreground mt-3">
        This page didn&rsquo;t load properly. Please try again in a moment.
      </p>
      <div className="mt-8 flex gap-3">
        <Button size="pill" onClick={() => unstable_retry()}>
          Try again
        </Button>
        <Button asChild variant="outline" size="pill">
          <Link href="/shop">Back to shop</Link>
        </Button>
      </div>
    </div>
  );
}
