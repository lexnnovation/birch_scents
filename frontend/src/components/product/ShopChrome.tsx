"use client";

import { usePathname } from "next/navigation";
import type { Category } from "@/types";
import { CategoryFilter } from "./CategoryFilter";

/**
 * Persists across /shop <-> /shop/[category] navigation (it's a layout, not
 * page content) — heading + filter update instantly from data already in
 * memory, no re-fetch, no skeleton. Only {children} (the product grid) is
 * page-specific and can show its own loading state.
 */
export function ShopChrome({
  categories,
  children,
}: {
  categories: Category[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeSlug = pathname === "/shop" ? null : (pathname.split("/")[2] ?? null);
  const active = activeSlug ? (categories.find((c) => c.slug === activeSlug) ?? null) : null;

  return (
    <div className="mx-auto max-w-310 px-4 py-12 md:px-8">
      <header className="mb-8">
        <p className="eyebrow">{active ? "Category" : "Shop"}</p>
        <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
          {active ? active.name : "All fragrances"}
        </h1>
        <p className="text-muted-foreground mt-3 max-w-[52ch]">
          {active
            ? active.description
            : "Everything we make, in one place — crafted in Accra, long-lasting, and FDA-approved."}
        </p>
      </header>
      <CategoryFilter categories={categories} active={activeSlug} />
      <div className="mt-10">
        <h2 className="sr-only">Products</h2>
        {children}
      </div>
    </div>
  );
}
