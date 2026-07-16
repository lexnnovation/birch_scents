import Link from "next/link";
import { Search } from "lucide-react";
import { MobileNav } from "./MobileNav";
import { AccountButton } from "./AccountButton";
import { CartButton } from "@/components/cart/CartButton";
import { SearchTrigger } from "./SearchTrigger";

export const primaryNav = [
  { label: "Shop All", href: "/shop" },
  { label: "Reed Diffusers", href: "/shop/reed-diffusers" },
  { label: "Room Sprays", href: "/shop/room-sprays" },
  { label: "Fragrance Oils", href: "/shop/fragrance-oils" },
  { label: "Humidifiers", href: "/shop/humidifiers" },
  { label: "For Wholesalers", href: "/#for-wholesalers" },
];

export function Header() {
  return (
    <header className="border-border bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex max-w-310 items-center gap-4 px-4 py-3 md:px-8">
        {/* left: hamburger (mobile) / search (desktop) */}
        <div className="flex flex-1 items-center gap-2">
          <MobileNav links={primaryNav} />
          <SearchTrigger className="border-border text-muted-foreground hidden items-center gap-2 border-b pb-1 text-sm md:flex">
            <Search className="size-4" />
            <span>Search fragrances…</span>
          </SearchTrigger>
        </div>

        {/* center: logo */}
        <Link
          href="/"
          className="font-heading text-xl font-extrabold tracking-[0.04em] uppercase md:text-2xl"
        >
          Birchscents
        </Link>

        {/* right: account + cart */}
        <div className="flex flex-1 items-center justify-end gap-4">
          <SearchTrigger className="md:hidden">
            <Search className="size-5" />
          </SearchTrigger>
          <AccountButton />
          <CartButton />
        </div>
      </div>

      {/* desktop category nav */}
      <nav className="border-border hidden justify-center gap-6 border-t py-3 md:flex">
        {primaryNav.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-foreground/85 hover:text-brand text-xs tracking-[0.13em] uppercase transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
