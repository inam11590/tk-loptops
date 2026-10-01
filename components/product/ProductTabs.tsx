"use client";

import {
  CheckCircle2,
  Layers,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { Product, ProductReview } from "@/types";
import { formatPrice, SITE_CONFIG } from "@/lib/config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpecsTable } from "@/components/product/SpecsTable";
import { ReviewsSection } from "@/components/product/ReviewsSection";

interface ProductTabsProps {
  product: Product;
  reviews: ProductReview[];
}

/**
 * Tabbed content below the main product overview:
 * 1. Description (rich copy + feature highlights)
 * 2. Specifications (8-section grouped two-column table)
 * 3. Reviews (rating summary, sortable reviews, load more & write a review form)
 * 4. Warranty and Returns (clear policy blocks)
 */
export function ProductTabs({ product, reviews }: ProductTabsProps) {
  return (
    <section
      id="reviews-section"
      aria-label="Detailed product information"
      className="scroll-mt-24 pt-6"
    >
      <Tabs defaultValue="description" className="w-full">
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-12 w-full justify-start gap-1 sm:w-auto">
            <TabsTrigger value="description" className="px-5 py-2.5">
              Description
            </TabsTrigger>
            <TabsTrigger value="specifications" className="px-5 py-2.5">
              Specifications
            </TabsTrigger>
            <TabsTrigger value="reviews" className="px-5 py-2.5">
              Reviews ({product.reviewCount})
            </TabsTrigger>
            <TabsTrigger value="warranty" className="px-5 py-2.5">
              Warranty &amp; Returns
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. Description Tab */}
        <TabsContent value="description" className="mt-6">
          <div className="grid grid-cols-1 gap-8 rounded-2xl border border-border/80 bg-card p-6 shadow-card sm:p-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>Engineered for Excellence</span>
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Why the {product.name} Stands Out
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {product.description}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Designed by{" "}
                <strong className="font-semibold text-foreground">
                  {product.brand}
                </strong>{" "}
                for demanding {product.category} workflows, this configuration
                pairs the{" "}
                <strong className="font-semibold text-foreground">
                  {product.specs.processor}
                </strong>{" "}
                with{" "}
                <strong className="font-semibold text-foreground">
                  {product.specs.ram}
                </strong>{" "}
                of high-bandwidth memory and a rapid{" "}
                <strong className="font-semibold text-foreground">
                  {product.specs.storage}
                </strong>{" "}
                solid-state drive. Whether you are compiling large codebases,
                presenting in boardrooms, or rendering high-frame-rate 3D
                scenes, the{" "}
                <strong className="font-semibold text-foreground">
                  {product.specs.display}
                </strong>{" "}
                delivers lifelike clarity with reduced eye strain.
              </p>
            </div>

            <div className="space-y-4 rounded-xl bg-surface p-5 lg:col-span-5">
              <h3 className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-foreground">
                <Layers className="h-4 w-4 text-accent" aria-hidden="true" />
                <span>What&apos;s Included in the Box</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-foreground/90 sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                    aria-hidden="true"
                  />
                  <span>Factory-Sealed {product.name}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                    aria-hidden="true"
                  />
                  <span>
                    Official {product.brand} Fast-Charge AC Power Adapter &amp;
                    Cord
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                    aria-hidden="true"
                  />
                  <span>
                    Pre-installed genuine {product.specs.os} (Zero Bloatware)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                    aria-hidden="true"
                  />
                  <span>
                    {SITE_CONFIG.name} 1-Year Official Warranty Certificate &amp;
                    Tax Invoice
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>

        {/* 2. Specifications Tab */}
        <TabsContent value="specifications" className="mt-6">
          <SpecsTable product={product} />
        </TabsContent>

        {/* 3. Reviews Tab */}
        <TabsContent value="reviews" className="mt-6">
          <ReviewsSection product={product} initialReviews={reviews} />
        </TabsContent>

        {/* 4. Warranty & Returns Tab */}
        <TabsContent value="warranty" className="mt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-base font-bold text-foreground">
                1-Year Official Hardware Warranty
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Every {product.brand} laptop includes our comprehensive 1-Year
                Official Warranty covering motherboard, display, SSD, RAM, and
                power adapter defects—plus direct manufacturer serial tag
                support.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <RotateCcw className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-base font-bold text-foreground">
                30-Day Easy Returns &amp; Exchanges
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Not the right fit for your workflow? Initiate a return or model
                exchange within 30 days of delivery. We provide a prepaid
                insured return label with zero restocking fees on defective
                units.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Truck className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-base font-bold text-foreground">
                Insured Express Shipping &amp; COD
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Orders above{" "}
                <strong className="font-semibold text-foreground">
                  {formatPrice(SITE_CONFIG.shipping.freeDeliveryThreshold)}
                </strong>{" "}
                ship free via insured express courier in shock-absorbing
                double-boxed packaging. Cash on Delivery is supported
                nationwide.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
