"use client";

import "./globals.css";

/**
 * Last-resort fallback for errors outside `(store)`'s reach (e.g. the
 * `(auth)` route group has no error boundary of its own). Replaces the
 * entire root layout, so it needs its own <html>/<body> and doesn't get
 * `app/layout.tsx`'s styles for free — importing globals.css directly gives
 * it the Tailwind/brand color tokens, though not the custom Google Fonts
 * (not worth the extra weight for what should be a rare, whole-app crash).
 */
export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="text-muted-foreground text-xs tracking-[0.14em] uppercase">
          Something went wrong
        </p>
        <h1 className="mt-3 text-2xl font-bold">Birchscents hit a snag</h1>
        <p className="text-muted-foreground mt-3 max-w-sm">Please try again in a moment.</p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="border-border bg-primary text-primary-foreground mt-8 rounded-full border px-7 py-2.5 text-xs font-semibold tracking-[0.14em] uppercase"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
