"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useCart, cartSubtotal } from "@/stores/cart";
import { useLastDelivery } from "@/stores/delivery";
import { useUser } from "@/lib/supabase/use-user";
import { useHydrated } from "@/lib/use-hydrated";
import { checkout, DELIVERY_FEE_PESEWAS } from "@/lib/api/checkout";
import type { ApiError, CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPesewas } from "@/lib/money";

type Form = { name: string; phone: string; address: string; city: string; note: string };

export default function CheckoutPage() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const { user, loading: authLoading } = useUser();
  const isSignedIn = !!user;
  const router = useRouter();

  // Auth gate: signed-out shoppers are routed to sign in, then back to checkout.
  useEffect(() => {
    if (!authLoading && !isSignedIn) {
      router.replace(`/login?redirectTo=${encodeURIComponent("/checkout")}`);
    }
  }, [authLoading, isSignedIn, router]);

  if (!hydrated || authLoading || !isSignedIn) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-muted-foreground text-sm">Loading checkout…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold">Your cart is empty</h1>
        <p className="text-muted-foreground mt-3">Add a fragrance before checking out.</p>
        <div className="mt-6">
          <Button asChild variant="brand" size="pill">
            <Link href="/shop">Shop fragrances</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Only mounts once hydrated (so the persisted store has already rehydrated)
  // and the cart is non-empty — its initial form state can safely read
  // `lastUsed` synchronously with no separate prefill effect needed.
  return <CheckoutForm items={items} />;
}

function CheckoutForm({ items }: { items: CartItem[] }) {
  const router = useRouter();
  const lastDelivery = useLastDelivery((s) => s.lastUsed);
  const saveDelivery = useLastDelivery((s) => s.save);
  const setPendingOrder = useCart((s) => s.setPendingOrder);

  const [form, setForm] = useState<Form>(() => ({
    name: lastDelivery?.name ?? "",
    phone: lastDelivery?.phone ?? "",
    address: lastDelivery?.address ?? "",
    city: lastDelivery?.city ?? "",
    note: "",
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [placing, setPlacing] = useState(false);
  const [submitError, setSubmitError] = useState<{ message: string; status?: number } | null>(null);

  const subtotal = cartSubtotal(items);
  const delivery = subtotal === 0 ? 0 : DELIVERY_FEE_PESEWAS;
  const total = subtotal + delivery;

  function set(key: keyof Form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function validate() {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!form.name.trim()) e.name = "Enter your name";
    if (!/^[0-9+\s-]{7,}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number";
    if (!form.address.trim()) e.address = "Enter your delivery address";
    if (!form.city.trim()) e.city = "Enter your city";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function placeOrder(ev: React.FormEvent) {
    ev.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setPlacing(true);
    const deliveryDetails = {
      name: form.name,
      phone: form.phone,
      address: form.address,
      city: form.city,
      note: form.note || null,
    };

    try {
      const result = await checkout(items, deliveryDetails);
      saveDelivery({ name: form.name, phone: form.phone, address: form.address, city: form.city });
      // Stashing the order number (survives reloads) lets any later
      // storefront page catch up and clear the cart even if the webhook
      // confirms after /checkout/callback has stopped polling.
      setPendingOrder(result.orderNumber);

      // Resumes the same server-initialized transaction (same amount, same
      // reference) in a popup over this page instead of a full-page
      // redirect — the site stays visibly Birchscents throughout. This
      // never marks anything paid itself; onSuccess only means "go poll,"
      // exactly like landing on /checkout/callback did before (CLAUDE.md §9).
      // Dynamically imported: the package touches `window` at module-eval
      // time, which crashes Next's server-render pass on a static import.
      const { default: Paystack } = await import("@paystack/inline-js");
      const popup = new Paystack();
      popup.resumeTransaction(result.accessCode, {
        onSuccess: () => {
          router.push(`/checkout/callback?orderNumber=${encodeURIComponent(result.orderNumber)}`);
        },
        onCancel: () => {
          setPlacing(false);
        },
        onError: () => {
          // The popup itself failed to load (e.g. an ad/tracker blocker) —
          // fall back to Paystack's hosted page rather than leaving the
          // shopper stuck with no way to pay.
          toast.error("Couldn't open the payment window — redirecting to Paystack.");
          window.location.href = result.authorizationUrl;
        },
      });
    } catch (err) {
      const apiError = err as ApiError;

      // Session died between loading checkout and submitting it — send them
      // to sign in and back. The cart is untouched (localStorage), so it's
      // still there once they're back on this page.
      if (apiError.status === 401) {
        toast.error("Your session expired — please sign in again to finish checking out.");
        router.push(`/login?redirectTo=${encodeURIComponent("/checkout")}`);
        return;
      }

      const message =
        apiError.message || "Something went wrong placing your order. Please try again.";
      setSubmitError({ message, status: apiError.status });
      toast.error(message);
      setPlacing(false);
    }
  }

  return (
    <form onSubmit={placeOrder} className="mx-auto max-w-310 px-4 py-12 md:px-8">
      <h1 className="text-3xl font-extrabold md:text-4xl">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="font-heading text-lg font-bold">Delivery details</h2>
          <div className="mt-5 grid gap-5">
            <Field
              id="name"
              label="Full name"
              value={form.name}
              onChange={set("name")}
              error={errors.name}
            />
            <Field
              id="phone"
              label="Phone number"
              value={form.phone}
              onChange={set("phone")}
              error={errors.phone}
              inputMode="tel"
            />
            <Field
              id="address"
              label="Delivery address"
              value={form.address}
              onChange={set("address")}
              error={errors.address}
            />
            <Field
              id="city"
              label="City"
              value={form.city}
              onChange={set("city")}
              error={errors.city}
            />
            <Field
              id="note"
              label="Delivery note (optional)"
              value={form.note}
              onChange={set("note")}
            />
          </div>
        </div>

        <aside className="border-border bg-secondary/40 h-fit rounded-2xl border p-6">
          <h2 className="font-heading text-lg font-bold">Order summary</h2>
          <div className="mt-4 space-y-3">
            {items.map((i) => (
              <div key={i.variantId} className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  {i.quantity} × {i.productName} <span className="text-xs">({i.variantLabel})</span>
                </span>
                <span className="tabular-nums">
                  {formatPesewas(i.unitPricePesewas * i.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-border mt-4 space-y-2 border-t pt-4 text-sm">
            <Row label="Subtotal" value={formatPesewas(subtotal)} />
            <Row label="Delivery" value={formatPesewas(delivery)} />
            <div className="flex justify-between pt-2 text-base font-bold">
              <span>Total</span>
              <span className="tabular-nums">{formatPesewas(total)}</span>
            </div>
          </div>
          {submitError && (
            <div className="mt-4">
              <p className="text-destructive text-sm" role="alert">
                {submitError.message}
              </p>
              {submitError.status === 409 && (
                <Link
                  href="/cart"
                  className="text-foreground mt-1 inline-block text-sm underline underline-offset-4"
                >
                  Review your cart
                </Link>
              )}
            </div>
          )}
          <Button type="submit" size="pill" className="mt-6 w-full" disabled={placing}>
            {placing ? "Opening payment…" : "Place order"}
          </Button>
          <p className="text-muted-foreground mt-3 text-center text-xs">
            Secure payment with Paystack
          </p>
        </aside>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
} & React.ComponentProps<typeof Input>) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-1.5"
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="text-destructive mt-1 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
