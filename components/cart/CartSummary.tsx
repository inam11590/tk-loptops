"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CouponForm } from "@/components/cart/CouponForm";
import { FreeShippingBar } from "@/components/cart/FreeShippingBar";
import type { CartTotals } from "@/lib/cart";
import { formatPrice, SITE_CONFIG } from "@/lib/config";

interface CartSummaryProps {
  totals: CartTotals;
}

/**
 * Sticky right-column Order Summary for /cart:
 * - Free shipping progress bar
 * - Subtotal, Product Savings, Coupon Discount, Shipping, Estimated Tax, Grand Total
 * - CouponForm
 * - Proceed to Checkout button
 * - Trust badges & Accepted Payment Methods
 */
export function CartSummary({ totals }: CartSummaryProps) {
  return (
    <aside
      aria-label="Order summary"
      className="sticky top-24 space-y-5 rounded-2xl border border-border/80 bg-card p-6 shadow-card"
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <h2 className="font-heading text-lg font-bold text-foreground">
          Order Summary
        </h2>
        <span className="text-xs font-semibold text-muted-foreground">
          {totals.totalItems} {totals.totalItems === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Free Delivery Progress Bar */}
      <FreeShippingBar
        subtotal={totals.subtotal}
        threshold={totals.freeShippingThreshold}
        compact
      />

      {/* Price Breakdown */}
      <dl className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-semibold text-foreground">
            {formatPrice(totals.subtotal)}
          </dd>
        </div>

        {totals.productSavings > 0 && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <dt className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Deal Savings</span>
            </dt>
            <dd className="font-semibold">
              - {formatPrice(totals.productSavings)}
            </dd>
          </div>
        )}

        {totals.couponDiscount > 0 && totals.couponCode && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <dt>Promo ({totals.couponCode})</dt>
            <dd className="font-semibold">
              - {formatPrice(totals.couponDiscount)}
            </dd>
          </div>
        )}

        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Insured Shipping</dt>
          <dd className="font-semibold text-foreground">
            {totals.qualifiesForFreeShipping ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                FREE
              </span>
            ) : (
              formatPrice(totals.shipping)
            )}
          </dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">
            Estimated Tax ({totals.taxRatePercent}%)
          </dt>
          <dd className="font-semibold text-foreground">
            {formatPrice(totals.tax)}
          </dd>
        </div>

        <div className="flex items-baseline justify-between border-t border-border pt-3.5">
          <dt className="font-heading text-base font-bold text-foreground">
            Grand Total
          </dt>
          <dd className="text-right">
            <span className="font-heading text-2xl font-extrabold text-foreground">
              {formatPrice(totals.grandTotal)}
            </span>
            {totals.totalSavings > 0 && (
              <span className="block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Total saved: {formatPrice(totals.totalSavings)}
              </span>
            )}
          </dd>
        </div>
      </dl>

      {/* Coupon Form */}
      <CouponForm
        appliedCouponCode={totals.couponCode}
        couponValidation={totals.couponValidation}
      />

      {/* Primary Checkout CTA */}
      <Button
        asChild
        variant="accent"
        size="lg"
        disabled={totals.totalItems === 0}
        className="w-full font-semibold shadow-md shadow-blue-600/20"
      >
        <Link href="/checkout">
          <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Proceed to Checkout</span>
          <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-center">
        <div className="flex flex-col items-center gap-1 rounded-xl bg-surface p-2.5">
          <BadgeCheck className="h-4 w-4 text-accent" aria-hidden="true" />
          <span className="text-[11px] font-semibold text-foreground">
            100% Genuine
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl bg-surface p-2.5">
          <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
          <span className="text-[11px] font-semibold text-foreground">
            1-Yr Warranty
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl bg-surface p-2.5">
          <RotateCcw className="h-4 w-4 text-accent" aria-hidden="true" />
          <span className="text-[11px] font-semibold text-foreground">
            Easy Returns
          </span>
        </div>
      </div>

      {/* Accepted Payment Methods */}
      <div className="border-t border-border/60 pt-4">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <CreditCard className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span>Accepted Payment Methods</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SITE_CONFIG.paymentMethods.map((method) => (
            <span
              key={method}
              className="rounded-md border border-border/70 bg-surface px-2.5 py-1 text-[11px] font-medium text-foreground/80"
            >
              {method}
            </span>
          ))}
          <span className="rounded-md border border-border/70 bg-surface px-2.5 py-1 text-[11px] font-medium text-foreground/80">
            Cash on Delivery
          </span>
        </div>
      </div>
    </aside>
  );
}
