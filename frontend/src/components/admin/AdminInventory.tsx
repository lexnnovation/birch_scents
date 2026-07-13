"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import type { ApiError, Product } from "@/types";
import { getAdminProducts, updateVariantStock } from "@/lib/api/admin";
import { AdminPageHeader } from "./AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Row {
  variantId: string;
  productName: string;
  label: string;
  sku: string;
  stock: number;
}

function toRows(products: Product[]): Row[] {
  return products.flatMap((p) =>
    p.variants.map((v) => ({
      variantId: v.id,
      productName: p.name,
      label: v.label,
      sku: v.sku,
      stock: v.stock,
    })),
  );
}

const LOW_STOCK = 10;

export function AdminInventory() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const router = useRouter();
  /** Last server-confirmed stock per variant — the rollback target, distinct from the (possibly mid-edit) UI value in `rows`. */
  const committedRef = useRef<Record<string, number>>({});

  useEffect(() => {
    getAdminProducts()
      .then((products) => {
        const list = toRows(products);
        committedRef.current = Object.fromEntries(list.map((r) => [r.variantId, r.stock]));
        setRows(list);
      })
      .catch((error: ApiError) => {
        if (error.status === 403) return router.replace("/shop");
        toast.error(error.message ?? "Could not load inventory.");
      });
  }, [router]);

  const setStock = useCallback((variantId: string, next: number) => {
    const stock = Math.max(0, Math.round(next));
    setRows((prev) =>
      prev ? prev.map((r) => (r.variantId === variantId ? { ...r, stock } : r)) : prev,
    );
  }, []);

  const commitStock = useCallback(
    (variantId: string, stock: number) => {
      const previous = committedRef.current[variantId];
      if (stock === previous) return;
      updateVariantStock(variantId, stock)
        .then(() => {
          committedRef.current[variantId] = stock;
        })
        .catch((error: ApiError) => {
          toast.error(error.message ?? "Could not update stock.");
          setStock(variantId, previous);
        });
    },
    [setStock],
  );

  function adjust(row: Row, delta: number) {
    const next = Math.max(0, row.stock + delta);
    setStock(row.variantId, next);
    commitStock(row.variantId, next);
  }

  return (
    <>
      <AdminPageHeader
        title="Inventory"
        description={`Stock per variant. ${LOW_STOCK} or fewer is flagged low.`}
      />

      <div className="border-border overflow-hidden rounded-2xl border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-secondary/50 text-muted-foreground text-left text-xs tracking-wide uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Variant</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 text-center font-medium">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {rows === null
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-4" colSpan={4}>
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))
                : rows.map((r) => {
                    const low = r.stock <= LOW_STOCK;
                    return (
                      <tr key={r.variantId} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3 font-medium">{r.productName}</td>
                        <td className="text-muted-foreground px-4 py-3">{r.label}</td>
                        <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                          {r.sku}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon-sm"
                              aria-label={`Decrease ${r.productName} ${r.label} stock`}
                              disabled={r.stock === 0}
                              onClick={() => adjust(r, -1)}
                            >
                              <Minus className="size-3.5" />
                            </Button>
                            <Input
                              value={String(r.stock)}
                              onChange={(e) =>
                                setStock(
                                  r.variantId,
                                  Number(e.target.value.replace(/[^0-9]/g, "") || 0),
                                )
                              }
                              onBlur={(e) => {
                                const next = Math.max(
                                  0,
                                  Number(e.target.value.replace(/[^0-9]/g, "") || 0),
                                );
                                commitStock(r.variantId, next);
                              }}
                              inputMode="numeric"
                              aria-label={`${r.productName} ${r.label} stock`}
                              className={cn(
                                "h-8 w-16 text-center tabular-nums",
                                low && "text-destructive font-semibold",
                              )}
                            />
                            <Button
                              variant="outline"
                              size="icon-sm"
                              aria-label={`Increase ${r.productName} ${r.label} stock`}
                              onClick={() => adjust(r, 1)}
                            >
                              <Plus className="size-3.5" />
                            </Button>
                          </div>
                          {low && (
                            <p className="text-destructive mt-1 text-center text-[11px]">
                              Low stock
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
