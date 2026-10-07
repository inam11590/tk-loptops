"use client";

import { getPublishedProducts } from "@/lib/productStore";
import { Container } from "@/components/common/container";
import { FadeIn } from "@/components/common/fade-in";
import { SectionHeading } from "@/components/common/section-heading";
import { ProductCard } from "@/components/product/product-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * 5. Featured Laptops
 * Interactive tabbed showcase ("Best Sellers", "New Arrivals", "Top Rated"),
 * each displaying 4 ProductCards filtered from the published product store.
 */
export function FeaturedLaptops() {
  const products = getPublishedProducts();
  const bestSellers = products
    .filter((p) => p.tags.includes("best-seller"))
    .slice(0, 4);

  const newArrivals = products
    .filter((p) => p.tags.includes("new-arrival"))
    .slice(0, 4);

  const topRated = [...products]
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 4);

  const tabGroups = [
    {
      value: "best-sellers",
      label: "Best Sellers",
      items: bestSellers,
    },
    {
      value: "new-arrivals",
      label: "New Arrivals",
      items: newArrivals,
    },
    {
      value: "top-rated",
      label: "Top Rated",
      items: topRated,
    },
  ];

  return (
    <section
      id="featured-laptops"
      aria-labelledby="featured-laptops-heading"
      className="scroll-mt-24 py-section-sm sm:py-section"
    >
      <Container className="space-y-8">
        <Tabs defaultValue="best-sellers" className="w-full">
          <FadeIn>
            <SectionHeading
              id="featured-laptops-heading"
              eyebrow="Curated Selection"
              title="Featured Laptops"
              description="Compare our most-requested HP and Dell configurations across executive ultrabooks, creator notebooks, and RTX gaming rigs."
              action={
                <TabsList aria-label="Filter featured laptops">
                  {tabGroups.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              }
            />
          </FadeIn>

          {tabGroups.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {tab.items.map((product, index) => (
                  <FadeIn key={product.id} delay={index * 0.07}>
                    <ProductCard product={product} />
                  </FadeIn>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Container>
    </section>
  );
}
