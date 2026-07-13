import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/api";
import { CategoryFilter } from "@/components/product/CategoryFilter";
import { ProductGrid } from "@/components/product/ProductGrid";

type Params = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return { title: "Not found" };
  return { title: cat.name, description: cat.description };
}

export default async function CategoryPage({ params }: Params) {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) notFound();

  const [categories, page] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: category, perPage: 100 }),
  ]);

  return (
    <div className="mx-auto max-w-310 px-4 py-12 md:px-8">
      <header className="mb-8">
        <p className="eyebrow">Category</p>
        <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">{cat.name}</h1>
        <p className="text-muted-foreground mt-3 max-w-[52ch]">{cat.description}</p>
      </header>
      <CategoryFilter categories={categories} active={category} />
      <div className="mt-10">
        <ProductGrid products={page.data} />
      </div>
    </div>
  );
}
