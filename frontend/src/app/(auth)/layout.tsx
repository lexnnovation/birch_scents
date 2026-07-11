import Link from "next/link";

/**
 * Minimal centered layout for sign-in / registration — no store header or
 * footer, just a calm field with the brand mark and a way back to the store.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col px-4 py-12">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-heading text-2xl font-extrabold tracking-[0.04em] uppercase"
          >
            Birchscents
          </Link>
          <p className="text-muted-foreground mt-2 text-[0.7rem] tracking-[0.16em] uppercase">
            Inhale and Feel the Difference
          </p>
        </div>
        {children}
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mt-8 text-center text-xs transition-colors"
        >
          ← Back to store
        </Link>
      </div>
    </main>
  );
}
