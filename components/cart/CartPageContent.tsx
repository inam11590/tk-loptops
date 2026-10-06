"use client";

import { useState } from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AlertTriangle, ArrowLeft, Trash2, X } from "lucide-react";

import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { calculateCartTotals, getCartRecommendations } from "@/lib/cart";
import { useCartStore } from "@/store/cartStore";

/**
 * Main interactive Cart page content (/cart):
 * - Hydration skeleton while loading persisted localStorage state
 * - Desktop 2-column layout (items on left, sticky CartSummary on right), stacked on mobile
 * - Clear Cart with accessible Radix Dialog confirmation modal
 * - "Continue Shopping" link
 * - Dynamic "You May Also Like" carousel based on items currently in the cart
 */
export function CartPageContent() {
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const couponCode = useCartStore((state) => state.couponCode);
  const clearCart = useCartStore((state) => state.clearCart);

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  if (!hydrated) {
    return (
      <div className="grid grid-cols-1 gap-8 py-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-border/60 bg-secondary/40"
            />
          ))}
        </div>
        <div className="lg:col-span-4">
          <div className="h-96 animate-pulse rounded-2xl border border-border/60 bg-secondary/40" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  const totals = calculateCartTotals(items, couponCode);
  const recommendations = getCartRecommendations(items, 6);

  return (
    <div className="space-y-12 py-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Cart Items + Bottom Toolbar */}
        <div className="space-y-4 lg:col-span-8">
          {totals.reconciledItems.map((item) => (
            <CartItem key={item.productId} item={item} />
          ))}

          {/* Bottom Bar: Continue Shopping & Clear Cart Confirmation Modal */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/70 bg-surface/60 p-4">
            <Button asChild variant="outline" size="sm" className="rounded-xl font-semibold">
              <Link href="/laptops">
                <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Continue Shopping
              </Link>
            </Button>

            <DialogPrimitive.Root
              open={confirmClearOpen}
              onOpenChange={setConfirmClearOpen}
            >
              <DialogPrimitive.Trigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-xs font-semibold text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                >
                  <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Clear Cart
                </Button>
              </DialogPrimitive.Trigger>

              <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl focus:outline-none">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <DialogPrimitive.Title className="font-heading text-base font-bold text-foreground">
                          Clear your shopping cart?
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Description className="mt-1 text-xs text-muted-foreground">
                          This will remove all {totals.totalItems} items and any
                          applied promo code from your cart.
                        </DialogPrimitive.Description>
                      </div>
                    </div>

                    <DialogPrimitive.Close
                      aria-label="Close confirmation dialog"
                      className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </DialogPrimitive.Close>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-2.5">
                    <DialogPrimitive.Close asChild>
                      <Button type="button" variant="outline" size="sm">
                        Cancel
                      </Button>
                    </DialogPrimitive.Close>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        clearCart();
                        setConfirmClearOpen(false);
                      }}
                    >
                      Yes, Clear Cart
                    </Button>
                  </div>
                </DialogPrimitive.Content>
              </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
          </div>
        </div>

        {/* Right Column: Sticky Order Summary */}
        <div className="lg:col-span-4">
          <CartSummary totals={totals} />
        </div>
      </div>

      {/* You May Also Like Carousel based on items in the cart */}
      <RelatedProducts products={recommendations} />
    </div>
  );
}
