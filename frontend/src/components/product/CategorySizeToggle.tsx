"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import type { Product, VariantLabel } from "@/types";
import { formatPesewas } from "@/lib/money";
import { getVariantImage } from "@/lib/placeholder";
import { useCart } from "@/stores/cart";
import { cn } from "@/lib/utils";
import { hoverLift } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "./ProductGrid";

/** Wraps card content in a real link when available; a plain, non-navigating div otherwise. */
function CardLink({
  href,
  disabled,
  className,
  children,
}: {
  href: string;
  disabled: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return <div className={className}>{children}</div>;
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/**
 * An additional way to browse a category, aimed at bulk/wholesale buyers:
 * pick one size for the whole category, then add several scents at that
 * size with a single click each — no per-item size popover. "All" lists
 * every product at every size it comes in as its own directly-addable card
 * (no size picker needed there either — the size is already fixed per
 * card). Only renders the toggle at all when the category actually has more
 * than one size across its products — a single-size category (Humidifiers,
 * Birch Vase, Car Fragrance) just shows the plain grid, exactly as before.
 */
export function CategorySizeToggle({ products }: { products: Product[] }) {
  const sizes = Array.from(new Set(products.flatMap((p) => p.variants.map((v) => v.label))));
  const [selected, setSelected] = useState<VariantLabel | "all">("all");

  if (sizes.length < 2) {
    return <ProductGrid products={products} />;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Browse by size">
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
        <AllSizesProductGrid products={products} />
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
      aria-pressed={active}
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
  // Only scents that actually come in this size — a product with no matching
  // variant doesn't belong in this view at all, not shown as "out of stock".
  const inSize = products.filter((p) => p.variants.some((v) => v.label === size));
  if (inSize.length === 0) {
    return (
      <p className="text-muted-foreground py-20 text-center">
        No products here yet — check back soon.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {inSize.map((p) => (
        <SizedProductCard key={p.id} product={p} size={size} />
      ))}
    </div>
  );
}

/** Every product at every size it comes in, each its own directly-addable card. */
function AllSizesProductGrid({ products }: { products: Product[] }) {
  const pairs = products.flatMap((p) => p.variants.map((v) => ({ product: p, size: v.label })));
  if (pairs.length === 0) {
    return (
      <p className="text-muted-foreground py-20 text-center">
        No products here yet — check back soon.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {pairs.map(({ product, size }) => (
        <SizedProductCard key={`${product.id}-${size}`} product={product} size={size} />
      ))}
    </div>
  );
}

/** Size already fixed by the toggle above, so this is a single click straight to cart — no popover. */
function SizedProductCard({ product, size }: { product: Product; size: VariantLabel }) {
  const addItem = useCart((s) => s.add);
  const variant = product.variants.find((v) => v.label === size);
  const available = !!variant && variant.isActive && variant.stock > 0;
  const reducedMotion = useReducedMotion();
  const hoverImage = product.gallery[0] ?? null;

  // Falls back to the product's own cheapest price when it doesn't come in
  // this size at all, so every card in the row shows a price and stays
  // aligned — not just the ones with a matching variant.
  const displayPrice =
    variant?.pricePesewas ??
    product.variants.reduce((min, v) => Math.min(min, v.pricePesewas), Infinity);

  function add() {
    if (!variant) return;
    addItem(
      {
        variantId: variant.id,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        categorySlug: product.categorySlug,
        variantLabel: variant.label,
        imageUrl: product.imageUrl,
        unitPricePesewas: variant.pricePesewas,
      },
      1,
    );
    toast.success(`Added ${product.name} (${variant.label}) to cart`);
  }

  return (
    <motion.div
      className="group"
      initial="rest"
      whileHover="hover"
      variants={hoverLift}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }}
    >
      <CardLink href={`/products/${product.slug}`} disabled={!available} className="block">
        <div className="bg-secondary relative mb-3 aspect-square overflow-hidden rounded-xl">
          <Image
            src={product.imageUrl ?? getVariantImage(product.categorySlug, size)}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 23vw, (min-width: 768px) 31vw, 47vw"
            className={cn(
              "object-cover transition-transform duration-500",
              available ? "group-hover:scale-[1.04]" : "opacity-40",
            )}
          />
          {hoverImage && available && (
            <Image
              src={hoverImage}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1024px) 23vw, (min-width: 768px) 31vw, 47vw"
              className="object-cover opacity-0 transition-opacity duration-300 group-hover:scale-[1.04] group-hover:opacity-100 motion-reduce:transition-none"
            />
          )}
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
        <p className="text-muted-foreground text-xs">{size}</p>
      </CardLink>

      <span
        className={cn(
          "mt-1.5 block text-[15px] font-semibold tabular-nums",
          !available && "text-muted-foreground",
        )}
      >
        {formatPesewas(displayPrice)}
      </span>

      <div className="mt-1.5 flex flex-col gap-2 md:flex-row">
        <Button
          type="button"
          variant="brand"
          size="sm"
          disabled={!available}
          onClick={add}
          className="h-auto flex-1 rounded-full px-4 py-2 tracking-wide uppercase"
        >
          Add to cart
        </Button>
        {available ? (
          <Button
            asChild
            type="button"
            variant="outline"
            size="sm"
            className="h-auto flex-1 rounded-full px-4 py-2 tracking-wide uppercase"
          >
            <Link href={`/products/${product.slug}`}>More detail</Link>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            className="h-auto flex-1 rounded-full px-4 py-2 tracking-wide uppercase"
          >
            More detail
          </Button>
        )}
      </div>
    </motion.div>
  );
}
