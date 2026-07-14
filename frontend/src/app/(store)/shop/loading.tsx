import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";

export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-310 px-4 py-12 md:px-8">
      <header className="mb-8">
        <p className="eyebrow">Shop</p>
        <Skeleton className="mt-2 h-9 w-64" />
        <Skeleton className="mt-3 h-4 w-full max-w-[52ch]" />
      </header>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <div className="mt-10">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
