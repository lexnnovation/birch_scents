"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart, cartSubtotal } from "@/stores/cart";
import { useOrders } from "@/stores/orders";
import { useAuth, selectIsSignedIn } from "@/stores/auth";
import { useHydrated } from "@/lib/use-hydrated";
import { buildOrder } from "@/lib/checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPesewas } from "@/lib/money";

const DELIVERY_FEE = 3000; // GH₵ 30
const FREE_OVER = 30000; // free delivery over GH₵ 300

type Form = { name: string; phone: string; address: string; city: string; note: string };

export default function CheckoutPage() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const addOrder = useOrders((s) => s.addOrder);
  const isSignedIn = useAuth(selectIsSignedIn);
  const router = useRouter();

  const [form, setForm] = useState<Form>({
    name: "",
    phone: "",
    address: "",
    city: "",
    note: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [placing, setPlacing] = useState(false);

  const list = hydrated ? items : [];
  const subtotal = cartSubtotal(list);
  const delivery = subtotal === 0 || subtotal >= FREE_OVER ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;

  // Auth gate: signed-out shoppers are routed to sign in, then back to checkout.
  useEffect(() => {
    if (hydrated && !isSignedIn) {
      router.replace(`/login?redirectTo=${encodeURIComponent("/checkout")}`);
    }
  }, [hydrated, isSignedIn, router]);

  if (!hydrated || !isSignedIn) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-muted-foreground text-sm">Loading checkout…</p>
      </div>
    );
  }

  if (hydrated && list.length === 0 && !placing) {
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

  function placeOrder(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setPlacing(true);
    const order = buildOrder(
      list,
      {
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        note: form.note || null,
      },
      delivery,
    );
    addOrder(order);
    clear();
    router.push(`/orders/confirmation/${order.orderNumber}`);
  }

  return (
    <form onSubmit={placeOrder} className="mx-auto max-w-[1240px] px-4 py-12 md:px-8">
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
            {list.map((i) => (
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
            <Row label="Delivery" value={delivery === 0 ? "Free" : formatPesewas(delivery)} />
            <div className="flex justify-between pt-2 text-base font-bold">
              <span>Total</span>
              <span className="tabular-nums">{formatPesewas(total)}</span>
            </div>
          </div>
          <Button type="submit" size="pill" className="mt-6 w-full">
            Place order
          </Button>
          <p className="text-muted-foreground mt-3 text-center text-xs">
            Secure payment with Paystack (coming soon)
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
