"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import type { CartTotals } from "@/lib/cart";
import { getDeliveryMethodConfig } from "@/lib/checkout";
import { formatPrice } from "@/lib/config";

interface OrderSummaryProps {
  totals: CartTotals;
}

/**
 * Checkout Order Summary:
 * - On mobile (< lg): renders a collapsible summary accordion at the top showing the Grand Total
 * - On desktop (>= lg): renders a sticky right-hand sidebar with items, subtotal, discount,
 *   delivery fee, COD fee, tax, and grand total.
 */
export function OrderSummary({ totals }: OrderSummaryProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const deliveryMethod = getDeliveryMethodConfig(totals.deliveryMethodId);

  const summaryContent = (
    <div className="space-y-5">
      {/* Items List */}
      <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
        {totals.reconciledItems.map((item) => (
          <div
            key={item.productId}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-surface p-1.5">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                  {item.effectiveQuantity}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate font-heading text-xs sm:text-sm font-bold text-foreground">
                  {item.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {item.brand} • Qty {item.effectiveQuantity}
                </p>
              </div>
            </div>
            <span className="shrink-0 font-heading text-xs sm:text-sm font-bold text-foreground">
              {formatPrice(item.lineTotal)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals Breakdown */}
      <dl className="space-y-2.5 border-t border-border/60 pt-4 text-xs sm:text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">
            Subtotal ({totals.totalItems}{" "}
            {totals.totalItems === 1 ? "item" : "items"})
          </dt>
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
          <dt className="text-muted-foreground">
            Delivery ({deliveryMethod.label})
          </dt>
          <dd className="font-semibold text-foreground">
            {totals.shipping === 0 ? (
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                FREE
              </span>
            ) : (
              formatPrice(totals.shipping)
            )}
          </dd>
        </div>

        {totals.codFee > 0 && (
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">COD Handling Fee</dt>
            <dd className="font-semibold text-foreground">
              {formatPrice(totals.codFee)}
            </dd>
          </div>
        )}

        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">
            Estimated Tax ({totals.taxRatePercent}%)
          </dt>
          <dd className="font-semibold text-foreground">
            {formatPrice(totals.tax)}
          </dd>
        </div>

        <div className="flex items-baseline justify-between border-t border-border pt-3">
          <dt className="font-heading text-base font-bold text-foreground">
            Grand Total
          </dt>
          <dd className="text-right">
            <span className="font-heading text-2xl font-extrabold text-foreground">
              {formatPrice(totals.grandTotal)}
            </span>
            {totals.totalSavings > 0 && (
              <span className="block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                You save {formatPrice(totals.totalSavings)}
              </span>
            )}
          </dd>
        </div>
      </dl>

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
    </div>
  );

  return (
    <>
      {/* Mobile Collapsible Order Summary Bar */}
      <div className="mb-6 rounded-2xl border border-border/80 bg-card shadow-card lg:hidden">
        <button
          type="button"
          onClick={() => setMobileExpanded((prev) => !prev)}
          aria-expanded={mobileExpanded}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <div className="flex items-center gap-2.5 text-sm font-semibold text-accent">
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span>
              {mobileExpanded ? "Hide" : "Show"} Order Summary (
              {totals.totalItems})
            </span>
            {mobileExpanded ? (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
          </div>
          <span className="font-heading text-lg font-extrabold text-foreground">
            {formatPrice(totals.grandTotal)}
          </span>
        </button>

        {mobileExpanded && (
          <div className="border-t border-border/60 px-5 pb-5 pt-4">
            {summaryContent}
          </div>
        )}
      </div>

      {/* Desktop Sticky Sidebar */}
      <aside
        aria-label="Checkout order summary"
        className="hidden lg:block lg:sticky lg:top-24 rounded-2xl border border-border/80 bg-card p-6 shadow-card"
      >
        <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Order Summary
          </h2>
          <span className="text-xs font-semibold text-muted-foreground">
            {totals.totalItems} {totals.totalItems === 1 ? "item" : "items"}
          </span>
        </div>

        {summaryContent}
      </aside>
    </>
  );
}
