import type { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

const styles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-brand/15 text-brand",
  processing: "bg-blue-100 text-blue-800",
  delivered: "bg-brand/15 text-brand",
  cancelled: "bg-destructive/10 text-destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}
