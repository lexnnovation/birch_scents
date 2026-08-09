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
        <div>
          <p className="eyebrow">The signature scent</p>
          <h2 className="mt-3 text-6xl font-extrabold md:text-8xl">Snow Melon</h2>
          <div className="mt-8">
            <Button asChild variant="brand" size="pill">
              <Link href="/products/snow-melon">Discover Snow Melon</Link>
            </Button>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl md:aspect-square">
          <Image
            src={product.imageUrl ?? getCategoryImage(product.categorySlug)}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 46vw, 100vw"
            className="object-cover"
          />
        </div>
      </Reveal>
    </section>
  );
}
