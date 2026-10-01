import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { formatPrice } from "@/lib/config";
import { Container } from "@/components/common/container";
import { FadeIn } from "@/components/common/fade-in";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * 3. Shop by Brand
 * Two large visual cards for HP and Dell with brand name, short tagline,
 * dynamically calculated product count & starting price, and hover zoom effect.
 */
export function BrandCards() {
  const hpProducts = PRODUCTS.filter((p) => p.brand === "HP");
  const dellProducts = PRODUCTS.filter((p) => p.brand === "Dell");

  const hpLowestPrice = Math.min(...hpProducts.map((p) => p.price));
  const dellLowestPrice = Math.min(...dellProducts.map((p) => p.price));

  const brands = [
    {
      id: "hp-laptops",
      name: "HP",
      tagline:
        "Convertible Spectre OLEDs, Wolf-secured EliteBooks, and OMEN Transcend gaming rigs engineered for creators and executives.",
      count: hpProducts.length,
      startingPrice: hpLowestPrice,
      series: ["Spectre x360", "EliteBook", "OMEN", "Victus", "Pavilion"],
      image: "/images/laptops/hp-business.svg",
      href: "/laptops/hp",
      buttonLabel: "Shop HP",
      badgeVariant: "hp" as const,
    },
    {
      id: "dell-laptops",
      name: "Dell",
      tagline:
        "Iconic XPS InfinityEdge craftsmanship, ultralight Latitude enterprise fleets, and Alienware Cryo-Tech gaming powerhouses.",
      count: dellProducts.length,
      startingPrice: dellLowestPrice,
      series: ["XPS", "Latitude", "Alienware", "G-Series", "Inspiron"],
      image: "/images/laptops/dell-business.svg",
      href: "/laptops/dell",
      buttonLabel: "Shop Dell",
      badgeVariant: "dell" as const,
    },
  ];

  return (
    <section
      id="brands"
      aria-labelledby="brands-heading"
      className="py-section-sm sm:py-section"
    >
      <Container className="space-y-10">
        <FadeIn>
          <SectionHeading
            id="brands-heading"
            eyebrow="Authorized Partner"
            title="Shop by Brand"
            description="We specialize exclusively in HP and Dell laptops—giving you hand-picked configurations, verified service tags, and direct manufacturer warranty coverage."
          />
        </FadeIn>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {brands.map((brand, index) => (
            <FadeIn key={brand.name} delay={index * 0.1}>
              <article
                id={brand.id}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card p-6 shadow-card transition-all duration-300 hover:border-accent/40 hover:shadow-card-hover sm:p-8"
              >
                <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-12">
                  {/* Brand Copy */}
                  <div className="space-y-4 sm:col-span-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={brand.badgeVariant}>
                        {brand.count} Laptops Available
                      </Badge>
                      <span className="text-xs font-medium text-muted-foreground">
                        From {formatPrice(brand.startingPrice)}
                      </span>
                    </div>

                    <h3 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                      {brand.name} Laptops
                    </h3>

                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {brand.tagline}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {brand.series.map((seriesName) => (
                        <span
                          key={seriesName}
                          className="rounded-lg bg-surface px-2.5 py-1 text-xs font-medium text-foreground/80"
                        >
                          {seriesName}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2">
                      <Button asChild variant="accent" className="rounded-xl">
                        <Link href={brand.href}>
                          <span>{brand.buttonLabel}</span>
                          <ArrowUpRight
                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            aria-hidden="true"
                          />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Brand Laptop Visual with Hover Zoom */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface p-3 sm:col-span-5">
                    <Image
                      src={brand.image}
                      alt={`${brand.name} laptop lineup`}
                      width={400}
                      height={300}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 280px"
                      className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                  </div>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
