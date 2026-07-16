import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts } from "@/lib/api";
import { CategorySizeToggle } from "@/components/product/CategorySizeToggle";

type Params = { params: Promise<{ category: string }> };

// Product/category data changes live (admin edits, stock changes) — never
// let Next bake a build-time snapshot into static HTML.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return { title: "Not found" };
  return { title: cat.name, description: cat.description };
}

export default async function CategoryPage({ params }: Params) {
  const { category } = await params;
  const [cat, page] = await Promise.all([
    getCategoryBySlug(category),
    getProducts({ categorySlug: category, perPage: 100 }),
  ]);
  if (!cat) notFound();

  return <CategorySizeToggle products={page.data} />;
}
