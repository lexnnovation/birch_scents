import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-310 px-4 py-10 md:px-8">
      <div className="grid gap-10 md:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-xl" />

        <div>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-9 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/2" />

          <div className="mt-6 space-y-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-11 w-full max-w-xs rounded-full" />
          </div>

          <div className="border-border mt-8 space-y-2 border-t pt-6">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}
