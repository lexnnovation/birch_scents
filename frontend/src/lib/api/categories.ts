import type { Category } from "@/types";
import { apiFetch } from "./client";

/** Category reads — the backend already returns them sorted by sortOrder. */

export function getCategories(): Promise<Category[]> {
  return apiFetch<{ data: Category[] }>("/categories", { revalidate: 60 }).then((res) => res.data);
}

export function getCategoryBySlug(slug: string): Promise<Category | null> {
  return getCategories().then((categories) => categories.find((c) => c.slug === slug) ?? null);
}
