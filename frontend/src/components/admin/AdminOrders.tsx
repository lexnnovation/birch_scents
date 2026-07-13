"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ApiError, Order, OrderStatus } from "@/types";
import { getAdminOrders, updateOrderStatus } from "@/lib/api/admin";
import { formatPesewas } from "@/lib/money";
import { AdminPageHeader } from "./AdminPageHeader";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the backend's `OrderStatus::allowedTransitions()` so the admin can't pick a move the API will reject. */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled"],
  processing: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const load = useCallback(
    (targetPage: number) => {
      getAdminOrders({ page: targetPage })
        .then((res) => {
          setOrders(res.data);
          setPage(res.meta.currentPage);
          setLastPage(res.meta.lastPage);
        })
        .catch((error: ApiError) => {
          if (error.status === 403) return router.replace("/shop");
          toast.error(error.message ?? "Could not load orders.");
        });
    },
    [router],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const list = orders ?? [];
  const selected = list.find((o) => o.id === selectedId) ?? null;

  async function changeStatus(order: Order, status: OrderStatus) {
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(order.id, status);
      setOrders((prev) => (prev ? prev.map((o) => (o.id === updated.id ? updated : o)) : prev));
      toast.success(`${order.orderNumber} → ${status}`);
    } catch (error) {
      toast.error((error as ApiError).message ?? "Could not update order status.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <>
      <AdminPageHeader title="Orders" description="Customer orders and their fulfilment status." />

      {orders !== null && list.length === 0 ? (
        <div className="border-border rounded-2xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground text-sm">No orders yet.</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Place a test order from the{" "}
            <Link href="/shop" className="text-foreground underline underline-offset-4">
              storefront
            </Link>{" "}
            to see it here.
          </p>
        </div>
      ) : (
        <>
          <div className="border-border overflow-hidden rounded-2xl border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-secondary/50 text-muted-foreground text-left text-xs tracking-wide uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {orders === null
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-4 py-4" colSpan={6}>
                            <Skeleton className="h-5 w-full" />
                          </td>
                        </tr>
                      ))
                    : list.map((o) => (
                        <tr key={o.id} className="hover:bg-muted/40 transition-colors">
                          <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                          <td className="text-muted-foreground px-4 py-3">
                            {formatDate(o.createdAt)}
                          </td>
                          <td className="text-muted-foreground px-4 py-3">{o.delivery.name}</td>
                          <td className="px-4 py-3 tabular-nums">
                            {formatPesewas(o.totalPesewas)}
                          </td>
                          <td className="px-4 py-3">
                            <OrderStatusBadge status={o.status} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="outline" size="sm" onClick={() => setSelectedId(o.id)}>
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>

          {lastPage > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => load(page - 1)}
              >
                Previous
              </Button>
              <span className="text-muted-foreground text-xs">
                Page {page} of {lastPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= lastPage}
                onClick={() => load(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.orderNumber}</DialogTitle>
                <DialogDescription>Placed {formatDate(selected.createdAt)}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-5 py-2">
                <div>
                  <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
                    Status
                  </p>
                  <Select
                    value={selected.status}
                    onValueChange={(s) => void changeStatus(selected, s as OrderStatus)}
                    disabled={updating || ALLOWED_TRANSITIONS[selected.status].length === 0}
                  >
                    <SelectTrigger className="h-10 w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={selected.status} className="capitalize">
                        {selected.status}
                      </SelectItem>
                      {ALLOWED_TRANSITIONS[selected.status].map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
                    Items
                  </p>
                  <div className="space-y-2">
                    {selected.items.map((i) => (
                      <div key={i.id} className="flex justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">
                          {i.quantity} × {i.productName}{" "}
                          <span className="text-xs">({i.variantLabel})</span>
                        </span>
                        <span className="tabular-nums">{formatPesewas(i.lineTotalPesewas)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-1.5 text-sm">
                    <Row label="Subtotal" value={formatPesewas(selected.subtotalPesewas)} />
                    <Row
                      label="Delivery"
                      value={
                        selected.deliveryFeePesewas === 0
                          ? "Free"
                          : formatPesewas(selected.deliveryFeePesewas)
                      }
                    />
                    <div className="flex justify-between pt-1 font-semibold">
                      <span>Total</span>
                      <span className="tabular-nums">{formatPesewas(selected.totalPesewas)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
                    Delivery
                  </p>
                  <div className="text-sm">
                    <p className="font-medium">{selected.delivery.name}</p>
                    <p className="text-muted-foreground">{selected.delivery.phone}</p>
                    <p className="text-muted-foreground">
                      {selected.delivery.address}, {selected.delivery.city}
                    </p>
                    {selected.delivery.note && (
                      <p className="text-muted-foreground mt-1 italic">
                        “{selected.delivery.note}”
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
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
