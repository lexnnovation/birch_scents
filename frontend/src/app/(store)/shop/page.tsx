import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/api";
import { CategoryFilter } from "@/components/product/CategoryFilter";
import { ProductGrid } from "@/components/product/ProductGrid";

export const metadata: Metadata = {
  title: "Shop all fragrances",
  description:
    "Browse Birchscents reed diffusers, room sprays, fragrance oils, and humidifiers — long-lasting luxury scent for every space.",
};

export default async function ShopPage() {
  const [categories, page] = await Promise.all([getCategories(), getProducts({ perPage: 100 })]);

  return (
    <div className="mx-auto max-w-310 px-4 py-12 md:px-8">
      <header className="mb-8">
        <p className="eyebrow">Shop</p>
        <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">All fragrances</h1>
        <p className="text-muted-foreground mt-3 max-w-[52ch]">
          Everything we make, in one place — crafted in Accra, long-lasting, and FDA-approved.
        </p>
      </header>
      <CategoryFilter categories={categories} active={null} />
      <div className="mt-10">
        <ProductGrid products={page.data} />
      </div>
    </div>
  );
}
