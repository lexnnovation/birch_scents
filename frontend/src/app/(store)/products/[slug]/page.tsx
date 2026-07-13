import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/api";
import { ProductGallery } from "@/components/product/ProductGallery";
import { BuyPanel } from "@/components/product/BuyPanel";
import { ProductGrid } from "@/components/product/ProductGrid";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found" };
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categorySlug, product.slug, 4);

  return (
    <div className="mx-auto max-w-310 px-4 py-10 md:px-8">
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery product={product} />

        <div>
          <p className="eyebrow">{product.categoryName}</p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">{product.name}</h1>
          <p className="text-muted-foreground mt-2">{product.tagline}</p>

          <BuyPanel product={product} />

          <div className="border-border mt-8 border-t pt-6">
            <p className="eyebrow mb-2">Description</p>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            <p className="eyebrow mt-6 mb-2">Scent notes</p>
            <p className="text-muted-foreground">{product.scentNotes}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 text-2xl font-extrabold">Complete the atmosphere</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
