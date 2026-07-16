import type { Metadata } from "next";
import { getProducts } from "@/lib/api";
import { ProductGrid } from "@/components/product/ProductGrid";

export const metadata: Metadata = {
  title: "Shop all fragrances",
  description:
    "Browse Birchscents reed diffusers, room sprays, fragrance oils, and humidifiers — long-lasting luxury scent for every space.",
};

// Product/category data changes live (admin edits, stock changes) — never
// let Next bake a build-time snapshot into static HTML.
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const page = await getProducts({ perPage: 100 });
  return <ProductGrid products={page.data} />;
}
