import { ShieldCheck, Sparkles, Truck, Headphones } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

const items = [
  { icon: ShieldCheck, label: "FDA Approved", mobileLabel: ["FDA", "Approved"] },
  { icon: Sparkles, label: "Long-lasting Throw", mobileLabel: ["Long-lasting", "Throw"] },
  { icon: Truck, label: "Nationwide Delivery", mobileLabel: ["Nationwide", "Delivery"] },
  { icon: Headphones, label: "Premium Support", mobileLabel: ["Premium", "Support"] },
];

export function TrustBar() {
  return (
    <section className="border-border bg-secondary/30 border-y">
      <Reveal className="mx-auto grid max-w-310 grid-cols-2 items-start gap-4 px-4 py-6 md:grid-cols-4 md:items-center md:px-8">
        {items.map(({ icon: Icon, label, mobileLabel }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 text-center md:flex-row md:justify-center md:gap-2.5 md:text-left"
          >
            <Icon className="text-brand size-5" strokeWidth={1.5} />
            <span className="text-xs tracking-[0.1em] uppercase md:hidden">
              {mobileLabel[0]}
              <br />
              {mobileLabel[1]}
            </span>
            <span className="hidden text-[13px] tracking-[0.1em] uppercase md:inline">{label}</span>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
