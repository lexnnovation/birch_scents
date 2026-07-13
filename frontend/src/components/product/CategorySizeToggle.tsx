"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { Product, VariantLabel } from "@/types";
import { formatPesewas } from "@/lib/money";
import { placeholderGradient } from "@/lib/placeholder";
import { useCart } from "@/stores/cart";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "./ProductGrid";

/**
 * An additional way to browse a category, aimed at bulk/wholesale buyers:
 * pick one size for the whole category, then add several scents at that
 * size with a single click each — no per-item size popover. Defaults to
 * "All", which renders the existing `ProductGrid` completely unchanged
 * (today's per-scent size picker). Only renders the toggle at all when the
 * category actually has more than one size across its products — a
 * single-size category (Humidifiers, Birch Vase, Car Fragrance) just shows
 * the plain grid, exactly as before.
 */
export function CategorySizeToggle({ products }: { products: Product[] }) {
  const sizes = Array.from(new Set(products.flatMap((p) => p.variants.map((v) => v.label))));
  const [selected, setSelected] = useState<VariantLabel | "all">("all");

  if (sizes.length < 2) {
    return <ProductGrid products={products} />;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="radiogroup" aria-label="Browse by size">
        <SizeTab label="All" active={selected === "all"} onClick={() => setSelected("all")} />
        {sizes.map((size) => (
          <SizeTab
            key={size}
            label={size}
            active={selected === size}
            onClick={() => setSelected(size)}
          />
        ))}
      </div>

      {selected === "all" ? (
        <ProductGrid products={products} />
      ) : (
        <SizedProductGrid products={products} size={selected} />
      )}
    </div>
  );
}

function SizeTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-5 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}

function SizedProductGrid({ products, size }: { products: Product[]; size: VariantLabel }) {
  if (products.length === 0) {
    return (
      <p className="text-muted-foreground py-20 text-center">
        No fragrances here yet — check back soon.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <SizedProductCard key={p.id} product={p} size={size} />
      ))}
    </div>
  );
}

/** Size already fixed by the toggle above, so this is a single click straight to cart — no popover. */
function SizedProductCard({ product, size }: { product: Product; size: VariantLabel }) {
  const addItem = useCart((s) => s.add);
  const variant = product.variants.find((v) => v.label === size);
  const available = !!variant && variant.isActive && variant.stock > 0;

  function add() {
    if (!variant) return;
    addItem(
      {
        variantId: variant.id,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        variantLabel: variant.label,
        imageUrl: product.imageUrl,
        unitPricePesewas: variant.pricePesewas,
      },
      1,
    );
    toast.success(`Added ${product.name} (${variant.label}) to cart`);
  }

  return (
    <div className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="bg-secondary relative mb-3 aspect-square overflow-hidden rounded-xl">
          <div
            className={cn(
              "absolute inset-0 transition-transform duration-500",
              available && "group-hover:scale-[1.04]",
            )}
            style={{ background: placeholderGradient(product.slug) }}
          />
          {product.isFeatured && available && (
            <span className="bg-primary text-primary-foreground absolute top-2.5 left-2.5 rounded-md px-2 py-1 text-[9px] font-semibold tracking-[0.12em] uppercase">
              Flagship
            </span>
          )}
          {!available && (
            <span className="bg-foreground text-background absolute top-2.5 left-2.5 rounded-md px-2.5 py-1.5 text-xs font-bold tracking-[0.08em] uppercase">
              Out of stock
            </span>
          )}
        </div>
        <p className="eyebrow">{product.categoryName}</p>
        <h3
          className={cn(
            "mt-1 truncate text-[15px] leading-snug font-semibold tracking-tight",
            !available && "text-muted-foreground",
          )}
        >
          {product.name}
        </h3>
      </Link>

      {variant && (
        <span
          className={cn(
            "mt-1.5 block text-[15px] font-semibold tabular-nums",
            !available && "text-muted-foreground",
          )}
        >
          {formatPesewas(variant.pricePesewas)}
        </span>
      )}

      <div className="mt-1.5 flex flex-col gap-2 md:flex-row">
        <Button
          type="button"
          size="sm"
          disabled={!available}
          onClick={add}
          className="h-auto flex-1 rounded-full px-4 py-2 tracking-wide uppercase"
        >
          Add to cart
        </Button>
        <Button
          asChild
          type="button"
          variant="outline"
          size="sm"
          className="h-auto flex-1 rounded-full px-4 py-2 tracking-wide uppercase"
        >
          <Link href={`/products/${product.slug}`}>More detail</Link>
        </Button>
      </div>
    </div>
  );
}
