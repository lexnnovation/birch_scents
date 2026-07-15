import Link from "next/link";
import type { Category } from "@/types";
import { placeholderGradient } from "@/lib/placeholder";
import { Reveal } from "@/components/motion/Reveal";

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto max-w-310 px-4 py-16 md:px-8">
      <Reveal trigger="mount">
        <div className="mb-8 text-center">
          <p className="eyebrow">Shop by category</p>
          <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">Find your atmosphere</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.slug} href={`/shop/${c.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                <div
                  className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                  style={{ background: placeholderGradient(c.slug) }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-heading text-lg font-bold text-white">{c.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
