import type { Category } from "@/types";
import { categories } from "@/mocks/categories";
import { withDelay } from "./mock-latency";

/**
 * Category reads. Phase 10 swaps the body for `apiFetch<...>("/categories")`
 * — the signature stays the same.
 */

export function getCategories(): Promise<Category[]> {
  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  return withDelay(sorted);
}

export function getCategoryBySlug(slug: string): Promise<Category | null> {
  return withDelay(categories.find((c) => c.slug === slug) ?? null);
}
