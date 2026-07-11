import Link from "next/link";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

const pill = "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.1em] transition-colors";
const on = "border-primary bg-primary text-primary-foreground";
const off = "border-border hover:bg-muted";

export function CategoryFilter({
  categories,
  active,
}: {
  categories: Category[];
  active: string | null;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/shop" className={cn(pill, active === null ? on : off)}>
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={`/shop/${c.slug}`}
          className={cn(pill, active === c.slug ? on : off)}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
