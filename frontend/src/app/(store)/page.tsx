import { getCategories, getFeaturedProducts } from "@/lib/api";
import { Hero } from "@/components/marketing/Hero";
import { TrustBar } from "@/components/marketing/TrustBar";
import { CategoryShowcase } from "@/components/marketing/CategoryShowcase";
import { SignatureScent } from "@/components/marketing/SignatureScent";
import { FeaturedProducts } from "@/components/marketing/FeaturedProducts";
import { ForBusiness } from "@/components/marketing/ForBusiness";

// Product/category data changes live (admin edits, stock changes) — never
// let Next bake a build-time snapshot into static HTML.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([getCategories(), getFeaturedProducts(4)]);

  return (
    <>
      <Hero />
      <TrustBar />
      <CategoryShowcase categories={categories} />
      <SignatureScent />
      <FeaturedProducts products={featured} />
      <ForBusiness />
    </>
  );
}
