import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCategoryImage } from "@/lib/placeholder";
import { Reveal } from "@/components/motion/Reveal";
import type { Product } from "@/types";

export function SignatureScent({ product }: { product: Product }) {
  return (
    <section className="bg-secondary/40">
      <Reveal className="mx-auto grid max-w-310 items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8">
        <div className="relative order-first aspect-[4/3] overflow-hidden rounded-2xl md:order-last md:aspect-square">
          <Image
            src={product.imageUrl ?? getCategoryImage(product.categorySlug)}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 46vw, 100vw"
            className="object-cover"
          />
        </div>
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
      </Reveal>
    </section>
  );
}
