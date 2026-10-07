"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
  ShoppingBag,
  ShoppingCart,
  Star,
  Trash2,
} from "lucide-react";

import { EmptyWishlist } from "@/components/wishlist/EmptyWishlist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublishedProducts } from "@/lib/productStore";
import { useHydrated } from "@/hooks/use-hydrated";
import { productToCartItem } from "@/lib/cart";
import { calculateDiscountPercentage, formatPrice } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import type { Product } from "@/types/product";

/**
 * Interactive Wishlist grid with:
 * - Hydration skeleton
 * - "Move All to Cart" and "Clear Wishlist" actions
 * - Saved product cards with out-of-stock badges, specs, "Add to Cart" (disabled when out of stock), and "Remove"
 */
export function WishlistContent() {
  const hydrated = useHydrated();
  const wishlistIds = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const showToast = useCartStore((state) => state.showToast);
  const setMiniCartOpen = useCartStore((state) => state.setMiniCartOpen);

  if (!hydrated) {
    return (
      <div className="space-y-6 py-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-secondary" />
          <div className="h-10 w-40 animate-pulse rounded-xl bg-secondary" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[420px] animate-pulse rounded-2xl border border-border/60 bg-secondary/40"
            />
          ))}
        </div>
      </div>
    );
  }

  const publishedProducts = getPublishedProducts();
  const savedProducts: Product[] = wishlistIds
    .map((id) => publishedProducts.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  if (savedProducts.length === 0) {
    return <EmptyWishlist />;
  }

  const inStockProducts = savedProducts.filter((p) => p.stock > 0);

  const handleMoveAllToCart = () => {
    if (inStockProducts.length === 0) {
      showToast(
        "All items in your wishlist are currently out of stock.",
        "warning"
      );
      return;
    }

    let movedCount = 0;
    for (const product of inStockProducts) {
      const res = addItem(productToCartItem(product, 1), 1, {
        openMiniCart: false,
        silent: true,
      });
      if (res.added) {
        removeItem(product.id);
        movedCount += 1;
      }
    }

    if (movedCount > 0) {
      setMiniCartOpen(true);
      showToast(
        `Moved ${movedCount} ${
          movedCount === 1 ? "laptop" : "laptops"
        } from your wishlist to the cart.`,
        "success"
      );
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Action Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 shadow-card">
        <div>
          <p className="text-sm font-bold text-foreground">
            {savedProducts.length}{" "}
            {savedProducts.length === 1 ? "Saved Laptop" : "Saved Laptops"}
          </p>
          <p className="text-xs text-muted-foreground">
            {inStockProducts.length} available for immediate dispatch
            {savedProducts.length - inStockProducts.length > 0 &&
              ` • ${
                savedProducts.length - inStockProducts.length
              } out of stock`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="accent"
            size="sm"
            disabled={inStockProducts.length === 0}
            onClick={handleMoveAllToCart}
            className="h-10 rounded-xl px-4 font-semibold shadow-sm"
          >
            <ShoppingBag className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Move All to Cart ({inStockProducts.length})
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearWishlist}
            className="h-10 rounded-xl px-3.5 text-xs font-semibold text-muted-foreground hover:text-rose-500"
          >
            <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Clear Wishlist
          </Button>
        </div>
      </div>

      {/* Wishlist Product Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {savedProducts.map((product) => {
          const isOutOfStock = product.stock <= 0;
          const discountPercent = calculateDiscountPercentage(
            product.price,
            product.oldPrice
          );
          const cartQty =
            cartItems.find((i) => i.productId === product.id)?.quantity ?? 0;

          return (
            <article
              key={product.id}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-card transition-all duration-300 hover:border-accent/40 hover:shadow-card-hover"
            >
              {/* Top Image Area */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface p-4">
                <div className="relative z-10 flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={product.brand === "HP" ? "hp" : "dell"}>
                      {product.brand}
                    </Badge>
                    {discountPercent && (
                      <Badge variant="discount">-{discountPercent}%</Badge>
                    )}
                    {isOutOfStock && (
                      <Badge
                        variant="outline"
                        className="border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      >
                        Out of Stock
                      </Badge>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeItem(product.id, product.name)}
                    aria-label={`Remove ${product.name} from wishlist`}
                    title="Remove from wishlist"
                    className="h-9 w-9 rounded-full border-border/60 bg-background/85 text-muted-foreground backdrop-blur-sm transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>

                <Link
                  href={`/laptops/${product.slug}`}
                  className="mt-1 flex h-[calc(100%-2.25rem)] w-full items-center justify-center"
                >
                  <Image
                    src={product.images[0] ?? "/images/laptops/hp-business.svg"}
                    alt={product.name}
                    width={400}
                    height={300}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className={cn(
                      "h-full w-full object-contain transition-transform duration-500 group-hover:scale-105",
                      isOutOfStock && "opacity-60 grayscale-[35%]"
                    )}
                  />
                </Link>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div className="space-y-3">
                  {/* Rating & Stock */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Star
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                        aria-hidden="true"
                      />
                      <span>{product.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        ({product.reviewCount})
                      </span>
                    </div>

                    <span
                      className={cn(
                        "font-semibold",
                        isOutOfStock
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {isOutOfStock
                        ? "Out of Stock"
                        : product.stock <= 5
                        ? `Only ${product.stock} left`
                        : "In Stock"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading text-base font-bold leading-snug text-foreground group-hover:text-accent">
                    <Link
                      href={`/laptops/${product.slug}`}
                      className="line-clamp-2 hover:underline"
                    >
                      {product.name}
                    </Link>
                  </h3>

                  {/* Key Specs */}
                  <dl className="grid grid-cols-1 gap-1.5 rounded-xl bg-surface/80 p-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 truncate">
                      <Cpu className="h-3.5 w-3.5 shrink-0 text-accent" />
                      <dd className="truncate font-medium text-foreground/90">
                        {product.specs.processor}
                      </dd>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <MemoryStick className="h-3.5 w-3.5 shrink-0 text-accent" />
                      <dd className="truncate">
                        {product.specs.ram} • {product.specs.storage}
                      </dd>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Monitor className="h-3.5 w-3.5 shrink-0 text-accent" />
                      <dd className="truncate">{product.specs.display}</dd>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <HardDrive className="h-3.5 w-3.5 shrink-0 text-accent" />
                      <dd className="truncate">{product.specs.gpu}</dd>
                    </div>
                  </dl>
                </div>

                {/* Price & Actions */}
                <div className="mt-5 space-y-3 border-t border-border/60 pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Price
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-heading text-xl font-extrabold text-foreground">
                        {formatPrice(product.price)}
                      </span>
                      {product.oldPrice && product.oldPrice > product.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={
                        isOutOfStock
                          ? "secondary"
                          : cartQty > 0
                          ? "default"
                          : "accent"
                      }
                      disabled={isOutOfStock}
                      onClick={() =>
                        addItem(productToCartItem(product, 1), 1)
                      }
                      aria-label={
                        isOutOfStock
                          ? `${product.name} is out of stock`
                          : `Add ${product.name} to cart`
                      }
                      className="h-10 flex-1 rounded-xl font-semibold shadow-sm"
                    >
                      {isOutOfStock ? (
                        <span>Out of Stock</span>
                      ) : cartQty > 0 ? (
                        <>
                          <Check className="mr-1.5 h-4 w-4" />
                          <span>In Cart ({cartQty}) • Add More</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-1.5 h-4 w-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
