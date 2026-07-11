import type { Product } from "@/types";
import { products } from "@/mocks/products";
import { withDelay } from "./mock-latency";

/**
 * Admin catalog reads. Unlike the public `getProducts`, these include inactive
 * products (the admin manages the whole catalog). Phase 10 swaps the body for
 * authenticated `apiFetch("/admin/products")` calls — the signature stays.
 *
 * Returns a deep copy so admin-screen local edits never mutate the shared mock
 * array that the storefront also reads from.
 */
export function getAdminProducts(): Promise<Product[]> {
  const clone = products.map((p) => ({
    ...p,
    gallery: [...p.gallery],
    variants: p.variants.map((v) => ({ ...v })),
  }));
  return withDelay(clone);
}
