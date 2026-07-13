"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package, Boxes, ClipboardList, ArrowLeft, LogOut } from "lucide-react";
import { toast } from "sonner";
import type { ApiError } from "@/types";
import { getAdminOrders } from "@/lib/api/admin";
import { useUser } from "@/lib/supabase/use-user";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type AdminAccess = "checking" | "granted" | "denied";

const nav = [
  { label: "Products", href: "/bo/products", icon: Package },
  { label: "Inventory", href: "/bo/inventory", icon: Boxes },
  { label: "Orders", href: "/bo/orders", icon: ClipboardList },
];

/**
 * Admin chrome + access guard. The real gate is the Laravel `EnsureAdmin`
 * middleware (`is_admin`) — this component never decides admin status
 * itself, it only reflects what the API says. Until that's confirmed, it
 * renders nothing admin-shaped (no sidebar, no nav, no page content) — just
 * the same neutral loading text as the session check — so a signed-in
 * non-admin never sees evidence that an admin area exists here at all.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const isSignedIn = !!user;
  const pathname = usePathname();
  const router = useRouter();
  const [access, setAccess] = useState<AdminAccess>("checking");

  useEffect(() => {
    if (!loading && !isSignedIn) {
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [loading, isSignedIn, pathname, router]);

  useEffect(() => {
    if (!isSignedIn) return;
    let active = true;
    getAdminOrders({ perPage: 1 })
      .then(() => {
        if (active) setAccess("granted");
      })
      .catch((error: ApiError) => {
        if (!active) return;
        if (error.status !== 403) toast.error(error.message ?? "Could not verify admin access.");
        setAccess("denied");
        router.replace("/shop");
      });
    return () => {
      active = false;
    };
  }, [isSignedIn, router]);

  if (loading || !isSignedIn || access !== "granted") {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">Loading admin…</p>
      </div>
    );
  }

  async function onSignOut() {
    await createClient().auth.signOut();
    toast.success("Signed out");
    router.push("/");
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col md:flex-row">
      {/* Sidebar (desktop) / top rail (mobile) */}
      <aside className="border-border bg-secondary/30 md:w-60 md:shrink-0 md:border-r">
        <div className="border-border flex items-center justify-between border-b px-5 py-4 md:block md:border-b-0">
          <Link href="/bo" className="font-heading text-lg font-extrabold tracking-tight">
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
          <button
            type="button"
            onClick={onSignOut}
            className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-8 md:px-8">{children}</main>
    </div>
  );
}
