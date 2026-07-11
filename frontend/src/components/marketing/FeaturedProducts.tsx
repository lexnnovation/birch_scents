import Link from "next/link";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto max-w-[1240px] px-4 py-16 md:px-8">
      <div className="mb-8 flex items-baseline justify-between">
        <h2 className="text-2xl font-extrabold md:text-3xl">Bestsellers</h2>
        <Link href="/shop" className="eyebrow hover:text-foreground transition-colors">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
