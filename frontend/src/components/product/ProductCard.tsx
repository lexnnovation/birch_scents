import Link from "next/link";
import type { Product } from "@/types";
import { formatPesewas, discountPercent } from "@/lib/money";
import { placeholderGradient } from "@/lib/placeholder";

/** Storefront product card — grey rounded tile, sale/flagship pills, from-price. */
export function ProductCard({ product }: { product: Product }) {
  const cheapest = product.variants.reduce(
    (a, b) => (b.pricePesewas < a.pricePesewas ? b : a),
    product.variants[0],
  );
  const pct = discountPercent(cheapest.pricePesewas, cheapest.compareAtPesewas);
  const multi = product.variants.length > 1;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-secondary relative mb-3 aspect-square overflow-hidden rounded-xl">
        <div
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
          style={{ background: placeholderGradient(product.slug) }}
        />
        {product.isFeatured && (
          <span className="bg-primary text-primary-foreground absolute top-2.5 left-2.5 rounded-md px-2 py-1 text-[9px] font-semibold tracking-[0.12em] uppercase">
            Flagship
          </span>
        )}
        {pct !== null && (
          <span className="bg-brand text-brand-foreground absolute bottom-2.5 left-2.5 rounded-md px-2 py-1 text-[11px] font-bold">
            {pct}% OFF
          </span>
        )}
      </div>
      <p className="eyebrow">{product.categoryName}</p>
      <h3 className="mt-1 text-[15px] leading-snug font-semibold tracking-tight">{product.name}</h3>
      <div className="mt-1.5 flex items-baseline gap-2">
        {multi && <span className="text-muted-foreground text-xs">From</span>}
        <span className="text-[15px] font-semibold tabular-nums">
          {formatPesewas(cheapest.pricePesewas)}
        </span>
        {cheapest.compareAtPesewas !== null && (
          <span className="text-muted-foreground text-[13px] tabular-nums line-through">
            {formatPesewas(cheapest.compareAtPesewas)}
          </span>
        )}
      </div>
    </Link>
  );
}
