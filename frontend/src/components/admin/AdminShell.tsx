"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package, Boxes, ClipboardList, ArrowLeft } from "lucide-react";
import { useAuth, selectIsSignedIn } from "@/stores/auth";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList },
];

/**
 * Admin chrome + access guard. For the mock UI the guard only checks the mock
 * session; the real gate is the Laravel `EnsureAdmin` middleware (`is_admin`),
 * and Phase 10 wires this to the authenticated user's admin flag.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const isSignedIn = useAuth(selectIsSignedIn);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !isSignedIn) {
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, isSignedIn, pathname, router]);

  if (!hydrated || !isSignedIn) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">Loading admin…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col md:flex-row">
      {/* Sidebar (desktop) / top rail (mobile) */}
      <aside className="border-border bg-secondary/30 md:w-60 md:shrink-0 md:border-r">
        <div className="border-border flex items-center justify-between border-b px-5 py-4 md:block md:border-b-0">
          <Link href="/admin" className="font-heading text-lg font-extrabold tracking-tight">
            Birchscents
          </Link>
          <p className="text-muted-foreground text-[0.7rem] tracking-[0.16em] uppercase md:mt-1">
            Admin
          </p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-col md:gap-0.5">
          {nav.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden px-3 py-3 md:block">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to store
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-8 md:px-8">{children}</main>
    </div>
  );
}
