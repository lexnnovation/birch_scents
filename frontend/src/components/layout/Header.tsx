import Link from "next/link";
import { Search } from "lucide-react";
import { MobileNav } from "./MobileNav";
import { AccountButton } from "./AccountButton";
import { CartButton } from "@/components/cart/CartButton";

export const primaryNav = [
  { label: "Shop All", href: "/shop" },
  { label: "Reed Diffusers", href: "/shop/reed-diffusers" },
  { label: "Room Sprays", href: "/shop/room-sprays" },
  { label: "Fragrance Oils", href: "/shop/fragrance-oils" },
  { label: "Humidifiers", href: "/shop/humidifiers" },
  { label: "Snow Melon", href: "/products/snow-melon" },
  { label: "For Business", href: "/#for-business" },
];

export function Header() {
  return (
    <header className="border-border bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex max-w-310 items-center gap-4 px-4 py-3 md:px-8">
        {/* left: hamburger (mobile) / search (desktop) */}
        <div className="flex flex-1 items-center gap-2">
          <MobileNav links={primaryNav} />
          <button
            aria-label="Search"
            className="border-border text-muted-foreground hidden items-center gap-2 border-b pb-1 text-sm md:flex"
          >
            <Search className="size-4" />
            <span>Search fragrances…</span>
          </button>
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
          <button aria-label="Search" className="md:hidden">
            <Search className="size-5" />
          </button>
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
