import Image from "next/image";
import Link from "next/link";
import type { Category, Product } from "@/types";
import { getCategoryImage } from "@/lib/placeholder";
import { Reveal } from "@/components/motion/Reveal";

interface ShowcaseItem {
  category: Category;
  /** A random in-stock product from this category, rerolled per page load — null only if the category has no active product yet. */
  product: Product | null;
}

export function CategoryShowcase({ items }: { items: ShowcaseItem[] }) {
  return (
    <section className="mx-auto max-w-310 px-4 py-16 md:px-8">
      <Reveal trigger="mount">
        <div className="mb-8 text-center">
          <p className="eyebrow">Shop by category</p>
          <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">Find your atmosphere</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map(({ category: c, product }) => {
            const image = product?.imageUrl ?? getCategoryImage(c.slug);
            const hoverImage = product?.gallery[0] ?? null;
            return (
              <Link key={c.slug} href={`/shop/${c.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                  <Image
                    src={image}
                    alt={c.name}
                    fill
                    sizes="(min-width: 768px) 23vw, 47vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {hoverImage && (
                    <Image
                      src={hoverImage}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="(min-width: 768px) 23vw, 47vw"
                      className="object-cover opacity-0 transition-opacity duration-300 group-hover:scale-105 group-hover:opacity-100 motion-reduce:transition-none"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="font-heading text-lg font-bold text-white">{c.name}</h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
