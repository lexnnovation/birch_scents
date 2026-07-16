"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { getProducts } from "@/lib/api";
import { getCategoryImage } from "@/lib/placeholder";
import { formatPesewas } from "@/lib/money";
import type { Product } from "@/types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export function SearchOverlay({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Reset happens in the close event itself, not an effect watching `open` —
  // the dialog stays mounted between opens (Radix needs that for its close
  // animation), so this can't just be a remount-driven reset.
  function handleOpenChange(next: boolean) {
    if (!next) {
      setQuery("");
      setResults([]);
      setLoading(false);
    }
    onOpenChange(next);
  }

  useEffect(() => {
    const term = query.trim();
    // Too short to search — nothing downstream reads `results`/`loading`
    // while `showResults` is false, so there's nothing to reset here.
    if (term.length < MIN_QUERY_LENGTH) return;

    const handle = setTimeout(() => {
      getProducts({ search: term, perPage: 6 })
        .then((page) => setResults(page.data))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [query]);

  // Loading flips on immediately in response to the keystroke itself (a real
  // user event), not derived reactively inside the debounce effect above.
  function handleQueryChange(value: string) {
    setQuery(value);
    setLoading(value.trim().length >= MIN_QUERY_LENGTH);
  }

  function viewAllResults() {
    const term = query.trim();
    if (!term) return;
    handleOpenChange(false);
    router.push(`/shop?q=${encodeURIComponent(term)}`);
  }

  const term = query.trim();
  const showResults = term.length >= MIN_QUERY_LENGTH;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Search fragrances</DialogTitle>
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="text-muted-foreground size-4 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") viewAllResults();
            }}
            placeholder="Search fragrances…"
            aria-label="Search fragrances"
            className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
          />
          {loading && <Loader2 className="text-muted-foreground size-4 shrink-0 animate-spin" />}
        </div>

        {showResults && (
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {results.length === 0 && !loading ? (
              <p className="text-muted-foreground px-3 py-6 text-center text-sm">
                No fragrances match &ldquo;{term}&rdquo;.
              </p>
            ) : (
              <>
                {results.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onClick={() => handleOpenChange(false)}
                    className="hover:bg-muted flex items-center gap-3 rounded-lg p-2"
                  >
                    <div className="bg-secondary relative size-12 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={p.imageUrl ?? getCategoryImage(p.categorySlug)}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-muted-foreground text-xs">{p.categoryName}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {formatPesewas(p.variants[0]?.pricePesewas ?? 0)}
                    </span>
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={viewAllResults}
                  className="text-brand hover:bg-muted w-full rounded-lg p-3 text-center text-sm font-medium"
                >
                  View all results for &ldquo;{term}&rdquo;
                </button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
