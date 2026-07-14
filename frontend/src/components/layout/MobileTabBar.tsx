import Link from "next/link";
import { Home, LayoutGrid, Sparkles, User, ShoppingBag } from "lucide-react";

const tabs = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/shop", icon: LayoutGrid },
  { label: "Signature", href: "/products/snow-melon", icon: Sparkles },
  { label: "Account", href: "/account", icon: User },
  { label: "Cart", href: "/cart", icon: ShoppingBag },
];

/** App-style sticky bottom nav (mobile only) — Bella Vita pattern. */
export function MobileTabBar() {
  return (
    <nav className="border-border bg-background/95 fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border py-2 shadow-[0_14px_30px_-14px_rgba(0,0,0,0.35)] backdrop-blur md:hidden">
      {tabs.map(({ label, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="text-muted-foreground flex flex-col items-center gap-1 text-[10px] tracking-wide"
        >
          <Icon className="size-[18px]" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
