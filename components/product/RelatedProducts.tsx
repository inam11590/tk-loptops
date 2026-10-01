"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/common/section-heading";
import type { Product } from "@/types/product";

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scrollByAmount = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const amount = direction === "left" ? -360 : 360;
    scrollContainerRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="py-10 border-t border-border/70">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="More Options"
          title="You May Also Like"
          description="Explore similar configurations from our genuine HP and Dell lineup."
          align="left"
        />

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => scrollByAmount("left")}
            aria-label="Scroll related products left"
            className="h-9 w-9 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => scrollByAmount("right")}
            aria-label="Scroll related products right"
            className="h-9 w-9 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="mt-8 flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin"
      >
        {products.map((item) => (
          <div
            key={item.id}
            className="w-[290px] sm:w-[320px] shrink-0 snap-start"
          >
            <ProductCard product={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
