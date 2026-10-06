import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

import { Container } from "@/components/common/container";
import { WishlistContent } from "@/components/wishlist/WishlistContent";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: `View and manage your saved HP and Dell laptops at ${SITE_CONFIG.name}. Move your favorites straight to the cart.`,
};

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Breadcrumb & Page Header */}
      <div className="border-b border-border/60 bg-secondary/25">
        <Container className="py-6 sm:py-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1 font-medium hover:text-accent transition-colors"
            >
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span aria-current="page" className="font-semibold text-foreground">
              Wishlist
            </span>
          </nav>

          <h1 className="mt-3 font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Saved Wishlist
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Compare your favorite HP and Dell laptops or move them all to your
            cart in one click.
          </p>
        </Container>
      </div>

      <Container>
        <WishlistContent />
      </Container>
    </div>
  );
}
