"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ClipboardList, LogOut, Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/supabase/use-user";
import { createClient } from "@/lib/supabase/client";

/**
 * Mobile's substitute for the desktop header's account dropdown — every
 * other bottom-tab destination is already a full page, so this is too,
 * rather than a new sheet/menu pattern. Also reachable on desktop by typing
 * the URL directly.
 */
export default function AccountPage() {
  const { user, loading } = useUser();
  const isSignedIn = !!user;
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isSignedIn) {
      router.replace(`/login?redirectTo=${encodeURIComponent("/account")}`);
    }
  }, [loading, isSignedIn, router]);

  if (loading || !isSignedIn) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="text-muted-foreground mx-auto size-6 animate-spin" />
      </div>
    );
  }

  async function onSignOut() {
    await createClient().auth.signOut();
    toast.success("Signed out");
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-8">
      <h1 className="text-3xl font-extrabold md:text-4xl">Account</h1>
      <p className="text-muted-foreground mt-2 truncate text-sm">{user.email}</p>

      <div className="border-border mt-8 divide-y overflow-hidden rounded-2xl border">
        <Link
          href="/account/profile"
          className="hover:bg-muted/50 flex items-center gap-3 px-5 py-4 transition-colors"
        >
          <UserRound className="text-muted-foreground size-5" />
          <span className="flex-1 font-medium">Personal information</span>
          <ChevronRight className="text-muted-foreground size-4" />
        </Link>
        <Link
          href="/orders"
          className="hover:bg-muted/50 flex items-center gap-3 px-5 py-4 transition-colors"
        >
          <ClipboardList className="text-muted-foreground size-5" />
          <span className="flex-1 font-medium">My orders</span>
          <ChevronRight className="text-muted-foreground size-4" />
        </Link>
        <button
          type="button"
          onClick={() => void onSignOut()}
          className="hover:bg-muted/50 flex w-full items-center gap-3 px-5 py-4 text-left transition-colors"
        >
          <LogOut className="text-muted-foreground size-5" />
          <span className="flex-1 font-medium">Sign out</span>
        </button>
      </div>
    </div>
  );
}
