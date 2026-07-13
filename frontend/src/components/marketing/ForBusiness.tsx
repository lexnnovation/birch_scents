import { Button } from "@/components/ui/button";

export function ForBusiness() {
  return (
    <section id="for-wholesalers" className="mx-auto max-w-310 scroll-mt-24 px-4 py-16 md:px-8">
      <div className="bg-primary text-primary-foreground overflow-hidden rounded-2xl px-6 py-14 text-center md:px-16">
        <p className="eyebrow text-primary-foreground/70">For wholesalers</p>
        <h2 className="mx-auto mt-3 max-w-[20ch] text-2xl font-extrabold text-balance md:text-4xl">
          Premium scenting for hotels, spas, offices &amp; events
        </h2>
        <p className="text-primary-foreground/80 mx-auto mt-4 max-w-[52ch] leading-relaxed">
          Signature scents, bulk supply, and corporate gifting across Ghana. Tell us about your
          space and we&rsquo;ll craft the right atmosphere.
        </p>
        <div className="mt-8">
          <Button asChild variant="brand" size="pill">
            <a href="mailto:hello@birchscents.com?subject=Business%20enquiry">Talk to our team</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
