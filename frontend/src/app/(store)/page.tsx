import type { Product } from "@/types";
import { getCategories, getFeaturedProducts, getProductBySlug, getProducts } from "@/lib/api";
import { Hero } from "@/components/marketing/Hero";
import { TrustBar } from "@/components/marketing/TrustBar";
import { CategoryShowcase } from "@/components/marketing/CategoryShowcase";
import { SignatureScent } from "@/components/marketing/SignatureScent";
import { FeaturedProducts } from "@/components/marketing/FeaturedProducts";
import { ForBusiness } from "@/components/marketing/ForBusiness";

// Product/category data changes live (admin edits, stock changes) — never
// let Next cache/bake a snapshot into static HTML. Also what makes the
// category showcase's random pick below reroll on every page load.
export const dynamic = "force-dynamic";

// Pulled out of the component body (rather than inlined in the render path)
// so Math.random() isn't flagged as an impure call inside a component.
function pickRandomInStockProduct(products: Product[]): Product | null {
  const inStock = products.filter((p) => p.isActive && p.imageUrl);
  if (inStock.length === 0) return null;
  return inStock[Math.floor(Math.random() * inStock.length)];
}

export default async function HomePage() {
  const [categories, featured, signatureScent] = await Promise.all([
    getCategories(),
    getFeaturedProducts(4),
    getProductBySlug("snow-melon"),
  ]);

  const categoryProductLists = await Promise.all(
    categories.map((c) => getProducts({ categorySlug: c.slug, perPage: 100 }).then((r) => r.data)),
  );

  // A different real product photo (with its hover pair) per category tile
  // on every load, instead of one fixed category-level placeholder image.
  const showcaseItems = categories.map((category, i) => ({
    category,
    product: pickRandomInStockProduct(categoryProductLists[i]),
  }));

  return (
    <>
      <Hero />
      <TrustBar />
      <CategoryShowcase items={showcaseItems} />
      {signatureScent && <SignatureScent product={signatureScent} />}
      <FeaturedProducts products={featured} />
      <ForBusiness />
    </>
  );
}
