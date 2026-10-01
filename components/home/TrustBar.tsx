import { BadgeCheck, Headset, RotateCcw, Truck } from "lucide-react";
import { SITE_CONFIG, formatPrice } from "@/lib/config";
import { Container } from "@/components/common/container";
import { FadeIn } from "@/components/common/fade-in";

/**
 * 2. Trust Bar
 * 4 icon items in a row: Genuine Products, Free Delivery, Easy Returns, Warranty Support.
 */
export function TrustBar() {
  const trustItems = [
    {
      icon: BadgeCheck,
      title: "Genuine Products",
      description:
        "100% factory-sealed HP & Dell units with verifiable serial tags.",
    },
    {
      icon: Truck,
      title: "Free Delivery",
      description: `Complimentary insured express shipping over ${formatPrice(
        SITE_CONFIG.shipping.freeDeliveryThreshold
      )}.`,
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description:
        "30-day hassle-free return and exchange guarantee on every order.",
    },
    {
      icon: Headset,
      title: "Warranty Support",
      description: `${SITE_CONFIG.shipping.warrantyText} backed by certified laptop technicians.`,
    },
  ];

  return (
    <section
      aria-label="Store trust guarantees"
      className="relative z-20 -mt-8 sm:-mt-10"
    >
      <Container>
        <FadeIn>
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-border/80 bg-card p-5 shadow-soft sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 lg:p-6">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-3.5 rounded-xl p-2 transition-colors hover:bg-surface/70"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-heading text-sm font-semibold text-foreground">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
