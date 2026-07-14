import Link from "next/link";
import { Header } from "@/components/layout/Header";

/**
 * Sign-in / registration layout: the standard store header (nav, logo,
 * account, cart) on top, with a centered form below.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main-content" className="flex flex-1 flex-col px-4 py-12">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          {children}
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground mt-8 text-center text-xs transition-colors"
          >
            ← Back to store
          </Link>
        </div>
      </main>
    </>
  );
}
