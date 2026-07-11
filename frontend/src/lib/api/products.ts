import type { Paginated, Product } from "@/types";
import { products } from "@/mocks/products";
import { withDelay } from "./mock-latency";

/**
 * Product reads. Every function here keeps its signature when Phase 10 swaps
 * the mock bodies for `apiFetch(...)` calls.
 */

export interface GetProductsParams {
  categorySlug?: string;
  featured?: boolean;
  page?: number;
  perPage?: number;
}

export function getProducts(params: GetProductsParams = {}): Promise<Paginated<Product>> {
  const { categorySlug, featured, page = 1, perPage = 12 } = params;

  let list = products.filter((p) => p.isActive);
  if (categorySlug) list = list.filter((p) => p.categorySlug === categorySlug);
  if (featured !== undefined) list = list.filter((p) => p.isFeatured === featured);

  const total = list.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const data = list.slice(start, start + perPage);

  return withDelay({
    data,
    meta: { currentPage: page, perPage, total, lastPage },
  });
}

export function getProductBySlug(slug: string): Promise<Product | null> {
  return withDelay(products.find((p) => p.slug === slug && p.isActive) ?? null);
}

export function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const featured = products.filter((p) => p.isActive && p.isFeatured).slice(0, limit);
  return withDelay(featured);
}

/** Related products from the same category, excluding the given slug. */
export function getRelatedProducts(
  categorySlug: string,
  excludeSlug: string,
  limit = 4,
): Promise<Product[]> {
  const related = products
    .filter((p) => p.isActive && p.categorySlug === categorySlug && p.slug !== excludeSlug)
    .slice(0, limit);
  return withDelay(related);
}
