"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Lock, ShoppingBag } from "lucide-react";

import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { calculateCartTotals } from "@/lib/cart";
import { formatPrice, SITE_CONFIG } from "@/lib/config";
import { useCartStore } from "@/store/cartStore";

/**
 * Checkout destination route (/checkout) so "Buy Now" and "Proceed to Checkout"
 * work smoothly and display the customer's live order summary.
 */
export default function CheckoutPage() {
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const couponCode = useCartStore((state) => state.couponCode);

  const totals = calculateCartTotals(
    hydrated ? items : [],
    hydrated ? couponCode : null
  );

  return (
    <Container className="py-14 md:py-20">
      <div className="mx-auto max-w-2xl rounded-3xl border border-border/80 bg-card p-8 sm:p-10 shadow-card">
        <div className="flex items-center gap-3 text-accent">
          <Lock className="h-6 w-6" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {SITE_CONFIG.name} • Secure Checkout
          </span>
        </div>

        <h1 className="mt-3 font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
          Checkout Ready
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Your cart items and pricing have been verified. Full multi-step
          shipping address and payment processing will be connected in the
          checkout step.
        </p>

        {hydrated && totals.reconciledItems.length > 0 ? (
          <div className="mt-6 space-y-4 rounded-2xl border border-border/70 bg-surface p-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <span>Order Summary ({totals.totalItems} items)</span>
              <span>Amount</span>
            </div>

            <ul className="divide-y divide-border/50 text-sm">
              {totals.reconciledItems.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center justify-between py-2.5 gap-4"
                >
                  <span className="truncate font-medium text-foreground">
                    {item.effectiveQuantity} × {item.name}
                  </span>
                  <span className="shrink-0 font-semibold text-foreground">
                    {formatPrice(item.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-1.5 border-t border-border/60 pt-3 text-xs sm:text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
              {totals.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Promo ({totals.couponCode})</span>
                  <span>- {formatPrice(totals.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>
                  {totals.qualifiesForFreeShipping
                    ? "FREE"
                    : formatPrice(totals.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Tax ({totals.taxRatePercent}%)</span>
                <span>{formatPrice(totals.tax)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2.5 font-heading text-base font-extrabold text-foreground">
                <span>Grand Total</span>
                <span>{formatPrice(totals.grandTotal)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3.5 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Includes {SITE_CONFIG.shipping.warrantyText} &amp; Cash on
                Delivery eligibility.
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-border/70 bg-surface p-6 text-center text-sm text-muted-foreground">
            Your cart is currently empty.
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="outline" size="lg" className="font-semibold">
            <Link href="/cart">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cart
            </Link>
          </Button>
          <Button asChild variant="accent" size="lg" className="font-semibold">
            <Link href="/laptops">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
