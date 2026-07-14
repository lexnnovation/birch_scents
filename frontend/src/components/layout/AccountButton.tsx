"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/supabase/use-user";
import { createClient } from "@/lib/supabase/client";

/**
 * Header account control, backed by the real Supabase session (CLAUDE.md
 * §6). Signed-out → link to sign in. Signed-in → a small menu with orders
 * + sign out.
 */
export function AccountButton() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Before the session check resolves, render a stable link so markup matches the server.
  if (loading || !user) {
    return (
      <Link href="/login" aria-label="Sign in" className="hidden md:inline-flex">
        <User className="size-5" />
      </Link>
    );
  }

  async function onSignOut() {
    await createClient().auth.signOut();
    setOpen(false);
    toast.success("Signed out");
    router.push("/");
  }

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex"
      >
        <User className="size-5" />
      </button>
      {open && (
        <div
          role="menu"
          className="border-border bg-card absolute top-full right-0 z-50 mt-3 w-52 rounded-xl border p-1.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.4)]"
        >
          <p className="text-muted-foreground truncate px-2.5 py-1.5 text-xs">{user.email}</p>
          <Link
            href="/account/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="hover:bg-muted block rounded-lg px-2.5 py-2 text-sm transition-colors"
          >
            Personal information
          </Link>
          <Link
            href="/orders"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="hover:bg-muted block rounded-lg px-2.5 py-2 text-sm transition-colors"
          >
            My orders
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={onSignOut}
            className="hover:bg-muted block w-full rounded-lg px-2.5 py-2 text-left text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
