"use client";

import Link from "next/link";
import { ArrowRight, Heart, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Empty state for the /wishlist page when no products are saved.
 */
export function EmptyWishlist() {
  return (
    <div className="mx-auto my-8 max-w-xl rounded-3xl border border-border/80 bg-card p-8 sm:p-12 text-center shadow-card">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
        <Heart className="h-8 w-8" aria-hidden="true" />
      </div>

      <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
        Your wishlist is empty
      </h2>

      <p className="mt-2.5 text-sm sm:text-base text-muted-foreground leading-relaxed">
        Tap the heart icon on any HP or Dell laptop to save configurations for
        later comparison or quick checkout.
      </p>

      <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          asChild
          variant="accent"
          size="lg"
          className="w-full sm:w-auto font-semibold"
        >
          <Link href="/laptops">
            <Laptop className="mr-2 h-4 w-4" aria-hidden="true" />
            Explore All Laptops
            <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="w-full sm:w-auto font-semibold"
        >
          <Link href="/deals">Browse Deals</Link>
        </Button>
      </div>
    </div>
  );
}
