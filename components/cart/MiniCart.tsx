"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FreeShippingBar } from "@/components/cart/FreeShippingBar";
import { useHydrated } from "@/hooks/use-hydrated";
import { calculateCartTotals } from "@/lib/cart";
import { formatPrice, SITE_CONFIG } from "@/lib/config";
import { CART_STORAGE_KEY, useCartStore } from "@/store/cartStore";
import { WISHLIST_STORAGE_KEY, useWishlistStore } from "@/store/wishlistStore";

/**
 * Global slide-over Mini-Cart Drawer (shadcn Sheet, slides in from the right)
 * + Cross-tab localStorage synchronizer + Global accessible Toast banner.
 */
export function MiniCart() {
  const hydrated = useHydrated();

  const items = useCartStore((state) => state.items);
  const couponCode = useCartStore((state) => state.couponCode);
  const isMiniCartOpen = useCartStore((state) => state.isMiniCartOpen);
  const setMiniCartOpen = useCartStore((state) => state.setMiniCartOpen);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const toast = useCartStore((state) => state.toast);
  const dismissToast = useCartStore((state) => state.dismissToast);
  const lastAnnouncement = useCartStore((state) => state.lastAnnouncement);

  // Keep cart and wishlist synchronized across multiple browser tabs via the storage event
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) {
        useCartStore.persist.rehydrate();
      } else if (event.key === WISHLIST_STORAGE_KEY) {
        useWishlistStore.persist.rehydrate();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const totals = calculateCartTotals(
    hydrated ? items : [],
    hydrated ? couponCode : null
  );

  return (
    <>
      {/* Global Screen Reader Live Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {lastAnnouncement}
      </div>

      {/* Global Floating Toast Notification */}
      {hydrated && toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-3 rounded-2xl border border-border/80 bg-card/95 px-4 py-3.5 text-xs sm:text-sm font-semibold text-foreground shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {toast.type === "success" && (
            <CheckCircle2
              className="h-5 w-5 shrink-0 text-emerald-500"
              aria-hidden="true"
            />
          )}
          {toast.type === "warning" && (
            <AlertTriangle
              className="h-5 w-5 shrink-0 text-amber-500"
              aria-hidden="true"
            />
          )}
          {toast.type === "error" && (
            <AlertTriangle
              className="h-5 w-5 shrink-0 text-rose-500"
              aria-hidden="true"
            />
          )}
          {toast.type === "info" && (
            <Info
              className="h-5 w-5 shrink-0 text-accent"
              aria-hidden="true"
            />
          )}
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            type="button"
            onClick={dismissToast}
            aria-label="Dismiss notification"
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Slide-in Right Mini-Cart Sheet */}
      <Sheet open={isMiniCartOpen} onOpenChange={setMiniCartOpen}>
        <SheetContent
          side="right"
          aria-label="Shopping cart drawer"
          className="flex w-full max-w-md flex-col justify-between p-0 sm:max-w-md"
        >
          {/* Drawer Header */}
          <div className="border-b border-border/80 px-6 py-5">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2.5 text-lg">
                <ShoppingBag className="h-5 w-5 text-accent" aria-hidden="true" />
                <span>Your Cart</span>
                {hydrated && totals.totalItems > 0 && (
                  <Badge variant="accent" className="ml-1">
                    {totals.totalItems}{" "}
                    {totals.totalItems === 1 ? "item" : "items"}
                  </Badge>
                )}
              </SheetTitle>
              <SheetDescription className="text-xs">
                Review your selected laptops and accessories before checkout.
              </SheetDescription>
            </SheetHeader>

            {/* Free Delivery Progress Bar */}
            {hydrated && totals.reconciledItems.length > 0 && (
              <div className="mt-4">
                <FreeShippingBar
                  subtotal={totals.subtotal}
                  threshold={SITE_CONFIG.shipping.freeDeliveryThreshold}
                  compact
                />
              </div>
            )}
          </div>

          {/* Drawer Body: Items List or Empty State */}
          {!hydrated ? (
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 rounded-xl border border-border/60 p-3"
                >
                  <div className="h-20 w-20 animate-pulse rounded-lg bg-secondary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
                    <div className="h-8 w-28 animate-pulse rounded bg-secondary" />
                  </div>
                </div>
              ))}
            </div>
          ) : totals.reconciledItems.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                <ShoppingBag className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">
                Your cart is empty
              </h3>
              <p className="mt-1.5 max-w-xs text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Explore our genuine HP and Dell laptops to find the ideal match
                for work, study, or gaming.
              </p>
              <SheetClose asChild>
                <Button asChild variant="accent" className="mt-6 font-semibold">
                  <Link href="/laptops">
                    Continue Shopping
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </SheetClose>
            </div>
          ) : (
            <div className="flex-1 divide-y divide-border/60 overflow-y-auto px-6">
              {totals.reconciledItems.map((item) => {
                const isLaptop = item.itemType !== "accessory";
                const itemHref = isLaptop ? `/laptops/${item.slug}` : "/cart";

                return (
                  <div key={item.productId} className="py-4">
                    <div className="flex gap-3.5">
                      {/* Product Thumbnail */}
                      <SheetClose asChild>
                        <Link
                          href={itemHref}
                          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-surface p-2"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-contain p-1"
                          />
                        </Link>
                      </SheetClose>

                      {/* Item Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Badge
                            variant={
                              item.brand === "HP"
                                ? "hp"
                                : item.brand === "Dell"
                                ? "dell"
                                : "secondary"
                            }
                            className="px-2 py-0 text-[10px]"
                          >
                            {item.brand}
                          </Badge>

                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            aria-label={`Remove ${item.name} from cart`}
                            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <SheetClose asChild>
                          <Link
                            href={itemHref}
                            className="mt-1 line-clamp-1 block font-heading text-sm font-bold text-foreground hover:text-accent"
                          >
                            {item.name}
                          </Link>
                        </SheetClose>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          {/* Quantity Stepper */}
                          <div className="inline-flex items-center rounded-lg border border-border bg-surface">
                            <button
                              type="button"
                              onClick={() => decrementItem(item.productId)}
                              disabled={item.effectiveQuantity <= 1}
                              aria-label={`Decrease quantity of ${item.name}`}
                              className="flex h-7 w-7 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span
                              aria-live="polite"
                              className="min-w-[1.75rem] text-center text-xs font-bold text-foreground"
                            >
                              {item.effectiveQuantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => incrementItem(item.productId)}
                              disabled={
                                item.effectiveQuantity >= item.currentStock
                              }
                              aria-label={`Increase quantity of ${item.name}`}
                              className="flex h-7 w-7 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right">
                            <span className="font-heading text-sm font-bold text-foreground">
                              {formatPrice(item.lineTotal)}
                            </span>
                            {item.effectiveQuantity > 1 && (
                              <span className="block text-[10px] text-muted-foreground">
                                {formatPrice(item.currentPrice)} each
                              </span>
                            )}
                          </div>
                        </div>

                        {item.stockWarning && (
                          <p className="mt-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            {item.stockWarning}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Drawer Footer */}
          {hydrated && totals.reconciledItems.length > 0 && (
            <div className="border-t border-border/80 bg-surface/60 p-6 space-y-4">
              <div className="space-y-1.5 text-sm">
                {totals.totalSavings > 0 && (
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Total Savings</span>
                    <span>- {formatPrice(totals.totalSavings)}</span>
                  </div>
                )}
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="font-heading text-xl font-extrabold text-foreground">
                    {formatPrice(totals.subtotal)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Taxes, promo codes, and shipping calculated in cart.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SheetClose asChild>
                  <Button asChild variant="outline" size="lg" className="w-full font-semibold">
                    <Link href="/cart">View Cart</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="accent" size="lg" className="w-full font-semibold shadow-sm">
                    <Link href="/checkout">
                      Checkout
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                </SheetClose>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
