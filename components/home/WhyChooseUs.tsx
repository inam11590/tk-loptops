import { Cpu, Headphones, ShieldCheck, Zap } from "lucide-react";
import { SITE_CONFIG, formatPrice } from "@/lib/config";
import { Container } from "@/components/common/container";
import { FadeIn } from "@/components/common/fade-in";
import { SectionHeading } from "@/components/common/section-heading";

/**
 * 7. Why Choose TK Laptop
 * 4 benefit blocks with icons and clear copy:
 * Expert Support, Tested & Verified Devices, Secure Payments, Fast Delivery.
 */
export function WhyChooseUs() {
  const benefits = [
    {
      icon: Headphones,
      title: "Specialist Engineer Support",
      description:
        "Speak directly with hardware specialists who understand thermal TDP limits, OLED color gamut accuracy, and enterprise vPro manageability.",
      highlight: "7-Day Live Technical Advice",
    },
    {
      icon: Cpu,
      title: "Factory-Sealed & Verified",
      description:
        "Every HP and Dell unit undergoes serial-number verification and packaging inspection so you receive untouched, zero-bloatware hardware.",
      highlight: "100% Authentic Service Tags",
    },
    {
      icon: ShieldCheck,
      title: "Bank-Grade Secure Payments",
      description:
        "Checkout with confidence using 256-bit TLS encryption across Visa, Mastercard, American Express, Apple Pay, and PayPal.",
      highlight: "PCI-DSS Level 1 Protected",
    },
    {
      icon: Zap,
      title: "Insured Express Delivery",
      description: `Same-day dispatch on in-stock laptops with shock-absorbing double-box protection and free shipping on orders over ${formatPrice(
        SITE_CONFIG.shipping.freeDeliveryThreshold
      )}.`,
      highlight: "1–3 Day Nationwide Transit",
    },
  ];

  return (
    <section
      aria-labelledby="why-choose-heading"
      className="bg-surface py-section-sm sm:py-section"
    >
      <Container className="space-y-10">
        <FadeIn>
          <SectionHeading
            id="why-choose-heading"
            align="center"
            eyebrow="The TK Laptop Standard"
            title="Why Choose TK Laptop"
            description="We combine the curated precision of a flagship showroom with rapid nationwide fulfillment and dedicated post-purchase care."
          />
        </FadeIn>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <FadeIn key={benefit.title} delay={index * 0.08}>
                <article className="flex h-full flex-col justify-between rounded-xl border border-border/80 bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card-hover">
                  <div className="space-y-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>

                    <h3 className="font-heading text-lg font-bold text-foreground">
                      {benefit.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-border/60 pt-3">
                    <span className="text-xs font-semibold text-accent">
                      {benefit.highlight}
                    </span>
                  </div>
                </article>
              </FadeIn>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
