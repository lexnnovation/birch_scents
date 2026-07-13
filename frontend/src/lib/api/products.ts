import type { ApiError, Paginated, Product } from "@/types";
import { apiFetch } from "./client";

/** Product reads — thin wrappers over the public catalog endpoints. */

export interface GetProductsParams {
  categorySlug?: string;
  featured?: boolean;
  page?: number;
  perPage?: number;
}

export function getProducts(params: GetProductsParams = {}): Promise<Paginated<Product>> {
  const { categorySlug, featured, page = 1, perPage = 12 } = params;

  return apiFetch<Paginated<Product>>("/products", {
    params: { category: categorySlug, featured, page, perPage },
  });
}

export function getProductBySlug(slug: string): Promise<Product | null> {
  return apiFetch<{ data: Product }>(`/products/${slug}`)
    .then((res) => res.data)
    .catch((error: ApiError) => {
      if (error.status === 404) return null;
      throw error;
    });
}

export function getFeaturedProducts(limit = 4): Promise<Product[]> {
  return getProducts({ featured: true, perPage: limit }).then((res) => res.data);
}

/** Related products from the same category, excluding the given slug. */
export function getRelatedProducts(
  categorySlug: string,
  excludeSlug: string,
  limit = 4,
): Promise<Product[]> {
  return getProducts({ categorySlug, perPage: limit + 1 }).then((res) =>
    res.data.filter((p) => p.slug !== excludeSlug).slice(0, limit),
  );
}
