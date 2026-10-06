import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

import { Container } from "@/components/common/container";
import { OrderTrackingContent } from "@/components/checkout/OrderTrackingContent";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: `Track the live status and estimated delivery date of your ${SITE_CONFIG.name} order.`,
};

export default function OrderTrackingPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
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
              Track Order
            </span>
          </nav>

          <h1 className="mt-3 font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Track Your Order
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Check real-time fulfillment milestones and courier dispatch updates.
          </p>
        </Container>
      </div>

      <Container>
        <Suspense
          fallback={
            <div className="mx-auto max-w-4xl py-8">
              <div className="h-64 animate-pulse rounded-3xl border border-border/60 bg-secondary/40" />
            </div>
          }
        >
          <OrderTrackingContent />
        </Suspense>
      </Container>
    </div>
  );
}
