"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Heart,
  Info,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ReconciledCartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/config";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

interface CartItemProps {
  item: ReconciledCartItem;
}

/**
 * Full Cart Page line item component with:
 * - Image, name, brand badge, specs summary
 * - Unit price, oldPrice strikethrough, and live price-change notice
 * - Stock reduction / out-of-stock warning banner
 * - Accessible quantity stepper (- / +) bounded by [1, currentStock]
 * - Line total, "Move to Wishlist", and "Remove" actions
 */
export function CartItem({ item }: CartItemProps) {
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const showToast = useCartStore((state) => state.showToast);

  const isInWishlist = useWishlistStore((state) =>
    state.items.includes(item.productId)
  );
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);

  const isLaptop = item.itemType !== "accessory";
  const detailHref = isLaptop ? `/laptops/${item.slug}` : "/laptops";

  const handleMoveToWishlist = () => {
    if (!isInWishlist) {
      toggleWishlist(item.productId, item.name);
    }
    removeItem(item.productId);
    showToast(`Moved ${item.name} to your wishlist.`, "info");
  };

  return (
    <article className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-card transition-all">
      {/* Stock or Price Change Alerts */}
      {item.stockWarning && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-xs font-semibold text-amber-700 dark:text-amber-300"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{item.stockWarning}</span>
        </div>
      )}

      {item.priceChanged && item.previousPrice !== undefined && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2.5 rounded-xl border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-xs font-semibold text-accent"
        >
          <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Price updated in catalog from {formatPrice(item.previousPrice)} to{" "}
            {formatPrice(item.currentPrice)}.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {/* Thumbnail */}
        <Link
          href={detailHref}
          className="relative mx-auto flex h-28 w-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-surface p-3 sm:mx-0"
        >
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="144px"
            className="object-contain p-2 transition-transform duration-300 hover:scale-105"
          />
        </Link>

        {/* Details & Controls */}
        <div className="flex flex-1 flex-col justify-between gap-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    item.brand === "HP"
                      ? "hp"
                      : item.brand === "Dell"
                      ? "dell"
                      : "secondary"
                  }
                >
                  {item.brand}
                </Badge>
                {item.currentStock > 0 && item.currentStock <= 5 && (
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    Only {item.currentStock} left in stock
                  </span>
                )}
              </div>

              <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">
                <Link
                  href={detailHref}
                  className="hover:text-accent transition-colors"
                >
                  {item.name}
                </Link>
              </h3>

              {item.specsSummary && (
                <p className="text-xs text-muted-foreground">
                  {item.specsSummary}
                </p>
              )}
            </div>

            {/* Unit & Line Pricing */}
            <div className="sm:text-right">
              <div className="font-heading text-lg sm:text-xl font-extrabold text-foreground">
                {formatPrice(item.lineTotal)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:justify-end">
                <span>{formatPrice(item.currentPrice)} each</span>
                {item.currentOldPrice &&
                  item.currentOldPrice > item.currentPrice && (
                    <span className="line-through">
                      {formatPrice(item.currentOldPrice)}
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* Bottom Row: Quantity Stepper + Move to Wishlist / Remove */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
            {/* Accessible Stepper */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium text-muted-foreground">
                Qty:
              </span>
              <div className="inline-flex items-center rounded-xl border border-border bg-surface p-0.5">
                <button
                  type="button"
                  onClick={() => decrementItem(item.productId)}
                  disabled={item.effectiveQuantity <= 1 || item.isOutOfStock}
                  aria-label={`Decrease quantity of ${item.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>

                <input
                  type="number"
                  min={1}
                  max={Math.max(1, item.currentStock)}
                  value={item.effectiveQuantity}
                  disabled={item.isOutOfStock}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    if (!Number.isNaN(parsed)) {
                      updateQuantity(item.productId, parsed);
                    }
                  }}
                  aria-label={`Quantity for ${item.name}`}
                  className="h-8 w-11 bg-transparent text-center text-xs font-bold text-foreground focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />

                <button
                  type="button"
                  onClick={() => incrementItem(item.productId)}
                  disabled={
                    item.effectiveQuantity >= item.currentStock ||
                    item.isOutOfStock
                  }
                  aria-label={`Increase quantity of ${item.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {isLaptop && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleMoveToWishlist}
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-accent"
                >
                  <Heart className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  Move to Wishlist
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.productId)}
                aria-label={`Remove ${item.name} from cart`}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
