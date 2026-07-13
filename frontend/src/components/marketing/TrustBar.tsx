import { ShieldCheck, Sparkles, Truck, Headphones } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "FDA Approved" },
  { icon: Sparkles, label: "Long-lasting Throw" },
  { icon: Truck, label: "Nationwide Delivery" },
  { icon: Headphones, label: "Premium Support" },
];

export function TrustBar() {
  return (
    <section className="border-border bg-secondary/30 border-y">
      <div className="mx-auto grid max-w-310 grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4 md:px-8">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center justify-center gap-2.5">
            <Icon className="text-brand size-5" strokeWidth={1.5} />
            <span className="text-xs tracking-[0.1em] uppercase md:text-[13px]">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
