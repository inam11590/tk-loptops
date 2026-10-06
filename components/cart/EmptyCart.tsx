"use client";

import Link from "next/link";
import { ArrowRight, Laptop, ShoppingBag, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/data/products";

/**
 * Empty cart view with friendly message, quick category links, and suggested laptops.
 */
export function EmptyCart() {
  const suggestedProducts = PRODUCTS.filter((p) => p.stock > 0).slice(0, 4);

  return (
    <div className="space-y-14 py-8">
      <div className="mx-auto max-w-xl rounded-3xl border border-border/80 bg-card p-8 sm:p-12 text-center shadow-card">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <ShoppingBag className="h-8 w-8" aria-hidden="true" />
        </div>

        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
          Your shopping cart is empty
        </h2>

        <p className="mt-2.5 text-sm sm:text-base text-muted-foreground leading-relaxed">
          Looks like you haven&apos;t added any laptops or accessories yet.
          Explore our certified HP and Dell configurations backed by a 1-year
          official warranty.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild variant="accent" size="lg" className="w-full sm:w-auto font-semibold">
            <Link href="/laptops">
              <Laptop className="mr-2 h-4 w-4" aria-hidden="true" />
              Shop All Laptops
              <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto font-semibold">
            <Link href="/deals">
              <Sparkles className="mr-2 h-4 w-4 text-amber-500" aria-hidden="true" />
              View Today&apos;s Deals
            </Link>
          </Button>
        </div>
      </div>

      {/* Suggested Laptops */}
      <section className="border-t border-border/70 pt-10">
        <SectionHeading
          eyebrow="Popular Picks"
          title="Suggested Laptops For You"
          description="Top-rated HP and Dell laptops ready for immediate dispatch."
          align="left"
        />

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {suggestedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
