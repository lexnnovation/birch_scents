import Link from "next/link";
import { Button } from "@/components/ui/button";
import { placeholderGradient } from "@/lib/placeholder";

export function SignatureScent() {
  return (
    <section className="bg-secondary/40">
      <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8">
        <div
          className="order-first aspect-[4/3] rounded-2xl md:order-last md:aspect-square"
          style={{ background: placeholderGradient("snow-melon") }}
        />
        <div>
          <p className="eyebrow">The signature scent</p>
          <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Snow Melon</h2>
          <p className="text-muted-foreground mt-5 max-w-[46ch] leading-relaxed">
            A crisp, sweet and refreshing fragrance that instantly brightens any room while creating
            a welcoming luxury atmosphere. Our most-loved scent — clean, bright, and unmistakably
            Birchscents.
          </p>
          <p className="text-muted-foreground mt-4 text-sm">
            <span className="eyebrow">Notes</span> &nbsp;Crisp melon · Sweet citrus · Clean musk
          </p>
          <div className="mt-8">
            <Button asChild variant="brand" size="pill">
              <Link href="/products/snow-melon">Discover Snow Melon</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
