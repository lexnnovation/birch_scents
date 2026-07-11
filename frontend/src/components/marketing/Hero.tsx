import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 78% 18%, hsl(120 18% 96% / 0.25), transparent 45%), linear-gradient(155deg, #3a4a3f 0%, #566b58 42%, #9fae86 100%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/30" />
      <div className="relative mx-auto flex min-h-[560px] max-w-[1240px] flex-col items-center justify-center px-4 py-24 text-center text-white md:px-8">
        <p className="eyebrow text-white/85">Signature · Snow Melon</p>
        <h1 className="mt-4 max-w-[16ch] text-4xl leading-[1.05] font-extrabold text-balance md:text-6xl">
          Inhale and Feel the Difference
        </h1>
        <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-white/90 md:text-base">
          A crisp, sweet, refreshing scent that turns any room into a welcome. FDA-approved,
          long-lasting, and crafted in Accra.
        </p>
        <div className="mt-8">
          <Button asChild size="pill">
            <Link href="/products/snow-melon">Shop Snow Melon</Link>
          </Button>
        </div>
        <div className="mt-10 flex gap-2">
          <span className="h-1.5 w-5 rounded-full bg-white" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/45" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/45" />
        </div>
      </div>
    </section>
  );
}
