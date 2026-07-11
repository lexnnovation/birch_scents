import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-3xl font-extrabold">This page drifted away</h1>
      <p className="text-muted-foreground mt-3">
        We couldn&rsquo;t find what you were looking for — it may have moved or sold out.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild size="pill">
          <Link href="/shop">Shop fragrances</Link>
        </Button>
        <Button asChild variant="outline" size="pill">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
