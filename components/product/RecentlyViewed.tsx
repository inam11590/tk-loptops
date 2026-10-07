"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/common/section-heading";
import { getPublishedProducts } from "@/lib/productStore";
import { useShopStore } from "@/store/use-store";
import type { Product } from "@/types/product";

interface RecentlyViewedProps {
  currentSlug: string;
}

export function RecentlyViewed({ currentSlug }: RecentlyViewedProps) {
  const recentlyViewedSlugs = useShopStore((state) => state.recentlyViewedSlugs);
  const addRecentlyViewed = useShopStore((state) => state.addRecentlyViewed);
  const clearRecentlyViewed = useShopStore((state) => state.clearRecentlyViewed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    addRecentlyViewed(currentSlug);
  }, [currentSlug, addRecentlyViewed]);

  if (!hydrated) return null;

  const publishedProducts = getPublishedProducts();
  const viewedProducts: Product[] = recentlyViewedSlugs
    .filter((slug) => slug !== currentSlug)
    .map((slug) => publishedProducts.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 4);

  if (viewedProducts.length === 0) return null;

  return (
    <section className="py-10 border-t border-border/70">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Browsing History"
          title="Recently Viewed Laptops"
          description="Quickly jump back to other laptops you explored during your visit."
          align="left"
        />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearRecentlyViewed}
          className="self-start sm:self-auto text-xs text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Clear History
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {viewedProducts.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
}
