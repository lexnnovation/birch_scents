import Link from "next/link";

const shopLinks = [
  { label: "Reed Diffusers", href: "/shop/reed-diffusers" },
  { label: "Room Sprays", href: "/shop/room-sprays" },
  { label: "Fragrance Oils", href: "/shop/fragrance-oils" },
  { label: "Humidifiers", href: "/shop/humidifiers" },
];

const helpLinks = [
  { label: "Shop All", href: "/shop" },
  { label: "For Wholesalers", href: "/#for-wholesalers" },
  { label: "My Orders", href: "/orders" },
];

export function Footer() {
  return (
    <footer className="site-footer bg-background text-foreground border-border mt-24 border-t">
      <div className="mx-auto grid max-w-310 gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <p className="font-heading text-2xl font-extrabold tracking-[0.04em] uppercase">
            Birchscents
          </p>
          <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
            Ghana&rsquo;s premier luxury home fragrance brand. FDA-approved, long-lasting scents
            crafted in Accra — inhale and feel the difference.
          </p>
        </div>

        <div>
          <p className="eyebrow mb-4">Shop</p>
          <ul className="space-y-2.5 text-sm">
            {shopLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted-foreground hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Explore</p>
          <ul className="space-y-2.5 text-sm">
            {helpLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted-foreground hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-border border-t">
        <div className="text-muted-foreground mx-auto flex max-w-310 flex-col gap-2 px-4 py-6 text-xs md:flex-row md:items-center md:justify-between md:px-8">
          <span>© {new Date().getFullYear()} Birchscents · Accra, Ghana</span>
          <span className="eyebrow">FDA Approved · Nationwide Delivery</span>
        </div>
      </div>
    </footer>
  );
}
