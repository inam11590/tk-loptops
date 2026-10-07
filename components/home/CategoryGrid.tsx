import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Feather,
  Gamepad2,
  GraduationCap,
  Wallet,
} from "lucide-react";
import { formatPrice } from "@/lib/config";
import { getPublishedProducts } from "@/lib/productStore";
import { LaptopCategory } from "@/types";
import { Container } from "@/components/common/container";
import { FadeIn } from "@/components/common/fade-in";
import { SectionHeading } from "@/components/common/section-heading";

interface CategoryConfig {
  slug: LaptopCategory;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

const CATEGORIES: CategoryConfig[] = [
  {
    slug: "budget",
    name: "Budget",
    description: "Reliable daily productivity & FHD displays",
    icon: Wallet,
  },
  {
    slug: "business",
    name: "Business",
    description: "vPro security, MIL-STD durability & all-day battery",
    icon: Briefcase,
  },
  {
    slug: "gaming",
    name: "Gaming",
    description: "RTX 40-Series GPUs & 144Hz–240Hz displays",
    icon: Gamepad2,
  },
  {
    slug: "student",
    name: "Student",
    description: "Lightweight all-metal build for campus & coding",
    icon: GraduationCap,
  },
  {
    slug: "ultrabook",
    name: "Ultrabook",
    description: "Flagship CNC-machined OLED & 2-in-1 convertibles",
    icon: Feather,
  },
];

/**
 * 4. Shop by Category
 * Cards for Budget, Business, Gaming, Student, and Ultrabook,
 * each with an icon, model count, starting price, and link to /laptops?category=...
 */
export function CategoryGrid() {
  const products = getPublishedProducts();
  return (
    <section
      aria-labelledby="categories-heading"
      className="bg-surface py-section-sm sm:py-section"
    >
      <Container className="space-y-10">
        <FadeIn>
          <SectionHeading
            id="categories-heading"
            eyebrow="Tailored Workloads"
            title="Shop by Category"
            description="Find the exact hardware configuration matched to your workflow, from everyday study to high-FPS gaming and executive travel."
          />
        </FadeIn>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((category, index) => {
            const Icon = category.icon;
            const matching = products.filter(
              (p) => p.category === category.slug
            );
            const minPrice =
              matching.length > 0
                ? Math.min(...matching.map((p) => p.price))
                : null;

            return (
              <FadeIn key={category.slug} delay={index * 0.06}>
                <Link
                  href={`/laptops?category=${category.slug}`}
                  aria-label={`Browse ${category.name} laptops`}
                  className="group flex h-full flex-col justify-between rounded-xl border border-border/80 bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-accent-foreground">
                        <Icon className="h-6 w-6" aria-hidden={true} />
                      </span>
                      <span className="rounded-lg bg-surface px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                        {matching.length} models
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading text-lg font-bold text-foreground transition-colors group-hover:text-accent">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-xs font-semibold">
                    <span className="text-muted-foreground">
                      {minPrice !== null
                        ? `From ${formatPrice(minPrice)}`
                        : "Explore"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-accent">
                      <span>Explore</span>
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
