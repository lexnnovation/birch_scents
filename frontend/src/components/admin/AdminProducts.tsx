"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Category, Product } from "@/types";
import { getAdminProducts } from "@/lib/api/admin";
import { getCategories } from "@/lib/api/categories";
import { formatPesewas } from "@/lib/money";
import { AdminPageHeader } from "./AdminPageHeader";
import { ProductFormDialog } from "./ProductFormDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function priceRange(p: Product): string {
  if (!p.variants.length) return "—";
  const prices = p.variants.map((v) => v.pricePesewas);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatPesewas(min) : `${formatPesewas(min)} – ${formatPesewas(max)}`;
}

/** null = closed; { product: null } = create; { product } = edit */
type FormState = { product: Product | null } | null;

export function AdminProducts() {
  const [items, setItems] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(null);

  useEffect(() => {
    getAdminProducts().then(setItems);
    getCategories().then(setCategories);
  }, []);

  function handleSave(product: Product) {
    setItems((prev) => {
      const list = prev ?? [];
      const exists = list.some((p) => p.id === product.id);
      return exists ? list.map((p) => (p.id === product.id ? product : p)) : [product, ...list];
    });
    toast.success(form?.product ? "Product updated" : "Product created");
    setForm(null);
  }

  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Your catalog — names, copy, variants and prices."
        action={
          <Button variant="brand" onClick={() => setForm({ product: null })}>
            <Plus className="size-4" /> New product
          </Button>
        }
      />

      <div className="border-border overflow-hidden rounded-2xl border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-secondary/50 text-muted-foreground text-left text-xs tracking-wide uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Variants</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {items === null
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-4" colSpan={6}>
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))
                : items.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="text-muted-foreground px-4 py-3">{p.categoryName}</td>
                      <td className="text-muted-foreground px-4 py-3">
                        {p.variants.map((v) => v.label).join(", ")}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{priceRange(p)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            p.isActive
                              ? "text-brand text-xs font-semibold"
                              : "text-muted-foreground text-xs font-semibold"
                          }
                        >
                          {p.isActive ? "Active" : "Inactive"}
                        </span>
                        {p.isFeatured && (
                          <span className="text-muted-foreground ml-2 text-xs">· Featured</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => setForm({ product: p })}>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <ProductFormDialog
          product={form.product}
          categories={categories}
          onSave={handleSave}
          onClose={() => setForm(null)}
        />
      )}
    </>
  );
}
