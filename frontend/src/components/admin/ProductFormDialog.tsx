"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Category, Product, ProductVariant, VariantLabel } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPesewas } from "@/lib/money";

const VARIANT_LABELS: VariantLabel[] = ["50ml", "100ml", "Standard"];

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function onlyDigits(s: string) {
  return s.replace(/[^0-9]/g, "");
}

interface VariantDraft {
  id: string;
  label: VariantLabel;
  sku: string;
  /** pesewas, as a digit string for the input */
  price: string;
  /** integer, as a digit string */
  stock: string;
  compareAtPesewas: number | null;
}

function seedVariants(product: Product | null): VariantDraft[] {
  if (product && product.variants.length) {
    return product.variants.map((v) => ({
      id: v.id,
      label: v.label,
      sku: v.sku,
      price: String(v.pricePesewas),
      stock: String(v.stock),
      compareAtPesewas: v.compareAtPesewas,
    }));
  }
  return [
    {
      id: `var_new_${Date.now()}`,
      label: "50ml",
      sku: "",
      price: "",
      stock: "",
      compareAtPesewas: null,
    },
  ];
}

export function ProductFormDialog({
  product,
  categories,
  onSave,
  onClose,
}: {
  /** null → create a new product */
  product: Product | null;
  categories: Category[];
  onSave: (product: Product) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [categorySlug, setCategorySlug] = useState(
    product?.categorySlug ?? categories[0]?.slug ?? "",
  );
  const [tagline, setTagline] = useState(product?.tagline ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [scentNotes, setScentNotes] = useState(product?.scentNotes ?? "");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [variants, setVariants] = useState<VariantDraft[]>(() => seedVariants(product));
  const [error, setError] = useState<string | null>(null);

  function updateVariant(id: string, patch: Partial<VariantDraft>) {
    setVariants((vs) => vs.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }
  function addVariant() {
    setVariants((vs) => [
      ...vs,
      {
        id: `var_new_${Date.now()}`,
        label: "Standard",
        sku: "",
        price: "",
        stock: "",
        compareAtPesewas: null,
      },
    ]);
  }
  function removeVariant(id: string) {
    setVariants((vs) => (vs.length > 1 ? vs.filter((v) => v.id !== id) : vs));
  }

  function save() {
    if (!name.trim()) return setError("Enter a product name.");
    if (!categorySlug) return setError("Choose a category.");
    for (const v of variants) {
      if (!v.sku.trim()) return setError("Every variant needs an SKU.");
      if (!v.price || parseInt(v.price, 10) <= 0)
        return setError("Every variant needs a price above zero.");
      if (v.stock === "") return setError("Every variant needs a stock count.");
    }

    const category = categories.find((c) => c.slug === categorySlug);
    const built: Product = {
      id: product?.id ?? `prod_${slugify(name)}_${Date.now()}`,
      categorySlug,
      categoryName: category?.name ?? "",
      name: name.trim(),
      slug: product?.slug ?? slugify(name),
      tagline: tagline.trim(),
      description: description.trim(),
      scentNotes: scentNotes.trim(),
      imageUrl: product?.imageUrl ?? null,
      gallery: product?.gallery ?? [],
      isFeatured,
      isActive,
      variants: variants.map<ProductVariant>((v) => ({
        id: v.id,
        label: v.label,
        sku: v.sku.trim(),
        pricePesewas: parseInt(v.price, 10),
        compareAtPesewas: v.compareAtPesewas,
        stock: parseInt(v.stock, 10),
        isActive: true,
      })),
    };
    onSave(built);
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "New product"}</DialogTitle>
          <DialogDescription>
            Prices are stored in pesewas (GH₵ × 100). Nothing here is persisted — this is the mock
            admin shell.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="p-name">Name</Label>
              <Input
                id="p-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 h-10"
              />
            </div>
            <div>
              <Label htmlFor="p-category">Category</Label>
              <Select value={categorySlug} onValueChange={setCategorySlug}>
                <SelectTrigger id="p-category" className="mt-1.5 h-10 w-full">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="p-tagline">Tagline</Label>
            <Input
              id="p-tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="mt-1.5 h-10"
            />
          </div>

          <div>
            <Label htmlFor="p-description">Description</Label>
            <textarea
              id="p-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 mt-1.5 w-full resize-y rounded-lg border bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:ring-3"
            />
          </div>

          <div>
            <Label htmlFor="p-notes">Scent notes</Label>
            <Input
              id="p-notes"
              value={scentNotes}
              onChange={(e) => setScentNotes(e.target.value)}
              className="mt-1.5 h-10"
            />
          </div>

          <div className="flex gap-6">
            <Toggle label="Active" checked={isActive} onChange={setIsActive} />
            <Toggle label="Featured" checked={isFeatured} onChange={setIsFeatured} />
          </div>

          {/* Variants */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Variants</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addVariant}>
                <Plus className="size-3.5" /> Add variant
              </Button>
            </div>
            <div className="space-y-3">
              {variants.map((v) => {
                const preview = v.price ? formatPesewas(parseInt(v.price, 10)) : "—";
                return (
                  <div
                    key={v.id}
                    className="border-border grid grid-cols-2 gap-2 rounded-xl border p-3 sm:grid-cols-[110px_1fr_110px_90px_auto]"
                  >
                    <Select
                      value={v.label}
                      onValueChange={(label) =>
                        updateVariant(v.id, { label: label as VariantLabel })
                      }
                    >
                      <SelectTrigger className="h-9 w-full" aria-label="Variant size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VARIANT_LABELS.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={v.sku}
                      onChange={(e) => updateVariant(v.id, { sku: e.target.value })}
                      placeholder="SKU"
                      aria-label="SKU"
                      className="h-9"
                    />
                    <div>
                      <Input
                        value={v.price}
                        onChange={(e) => updateVariant(v.id, { price: onlyDigits(e.target.value) })}
                        placeholder="Price (pesewas)"
                        inputMode="numeric"
                        aria-label="Price in pesewas"
                        className="h-9"
                      />
                      <p className="text-muted-foreground mt-1 text-[11px] tabular-nums">
                        {preview}
                      </p>
                    </div>
                    <Input
                      value={v.stock}
                      onChange={(e) => updateVariant(v.id, { stock: onlyDigits(e.target.value) })}
                      placeholder="Stock"
                      inputMode="numeric"
                      aria-label="Stock"
                      className="h-9"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove variant"
                      disabled={variants.length === 1}
                      onClick={() => removeVariant(v.id)}
                      className="justify-self-end"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="brand" onClick={save}>
            {product ? "Save changes" : "Create product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-brand size-4"
      />
      {label}
    </label>
  );
}
