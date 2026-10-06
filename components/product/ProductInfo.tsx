"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Banknote,
  Check,
  Copy,
  Cpu,
  HardDrive,
  Heart,
  MemoryStick,
  MessageCircle,
  Monitor,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import { Product } from "@/types";
import { useHydrated } from "@/hooks/use-hydrated";
import { productToCartItem } from "@/lib/cart";
import {
  calculateDiscountPercentage,
  formatPrice,
  SITE_CONFIG,
} from "@/lib/config";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/product/QuantitySelector";

interface ProductInfoProps {
  product: Product;
}

/**
 * Right-column Product Info panel:
 * - Brand badge, title, SKU, star rating link (scrolls to #reviews-section)
 * - Price, old price, discount % badge, and "You save X"
 * - Stock status (In Stock, Low Stock, Out of Stock) with aria-live
 * - Short highlights list
 * - QuantitySelector (1..stock) + Add to Cart, Buy Now (redirects to /checkout), Wishlist toggle
 * - Delivery info box, Trust badges & Share buttons
 */
export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const hydrated = useHydrated();

  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const showToast = useCartStore((state) => state.showToast);
  const cartQty = useCartStore((state) =>
    hydrated
      ? state.items.find((i) => i.productId === product.id)?.quantity ?? 0
      : 0
  );

  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const wishlisted = useWishlistStore((state) =>
    hydrated ? state.items.includes(product.id) : false
  );

  const sku = product.sku ?? `TK-${product.id.toUpperCase()}`;
  const discountPercent = calculateDiscountPercentage(
    product.price,
    product.oldPrice
  );
  const savingsAmount =
    product.oldPrice && product.oldPrice > product.price
      ? product.oldPrice - product.price
      : 0;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(productToCartItem(product, quantity), quantity, {
      openMiniCart: true,
    });
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(productToCartItem(product, quantity), quantity, {
      openMiniCart: false,
    });
    router.push("/checkout");
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product.id, product.name);
  };

  const handleCopyLink = async () => {
    const shareUrl =
      typeof window !== "undefined"
        ? window.location.href
        : `${SITE_CONFIG.url}/laptops/${product.slug}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast("Product link copied to clipboard.", "info");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast("Link ready to share.", "info");
    }
  };

  const shareUrlEncoded = encodeURIComponent(
    `${SITE_CONFIG.url}/laptops/${product.slug}`
  );
  const shareTextEncoded = encodeURIComponent(
    `Check out the ${product.name} (${formatPrice(product.price)}) at ${
      SITE_CONFIG.name
    }`
  );

  return (
    <div id="product-main-cta" className="space-y-6">
      {/* Top Row: Brand Badge, Category Badge & SKU */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={product.brand === "HP" ? "hp" : "dell"}>
            {product.brand} Official
          </Badge>
          <Badge variant="secondary" className="capitalize">
            {product.category} Series
          </Badge>
          {cartQty > 0 && (
            <Badge
              variant="outline"
              className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            >
              <Check className="mr-1 h-3 w-3" />
              In Cart ({cartQty})
            </Badge>
          )}
        </div>
        <span className="font-mono text-xs font-medium text-muted-foreground">
          SKU: <strong className="text-foreground">{sku}</strong>
        </span>
      </div>

      {/* Product Title & Rating Anchor */}
      <div className="space-y-3">
        <h1 className="font-heading text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          {product.name}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <a
            href="#reviews-section"
            aria-label={`Rated ${product.rating} out of 5 stars. Click to read ${product.reviewCount} customer reviews`}
            className="inline-flex items-center gap-1.5 rounded-lg py-0.5 font-semibold text-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center text-amber-400">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={cn(
                    "h-4 w-4",
                    idx < Math.round(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  )}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-muted-foreground underline underline-offset-4">
              ({product.reviewCount} reviews)
            </span>
          </a>

          <span className="text-border" aria-hidden="true">
            |
          </span>

          {/* Accessible Stock Status */}
          <div aria-live="polite" className="inline-flex items-center gap-1.5">
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                isOutOfStock
                  ? "bg-rose-500"
                  : isLowStock
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                "text-xs font-bold uppercase tracking-wider",
                isOutOfStock
                  ? "text-rose-600 dark:text-rose-400"
                  : isLowStock
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              )}
            >
              {isOutOfStock
                ? "Out of Stock"
                : isLowStock
                ? `Low Stock (Only ${product.stock} left)`
                : `In Stock (${product.stock} available)`}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Block */}
      <div className="rounded-2xl border border-border/80 bg-surface p-5">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-lg font-medium text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
          {discountPercent && (
            <Badge variant="discount" className="px-2.5 py-1 text-xs">
              -{discountPercent}% OFF
            </Badge>
          )}
        </div>

        {savingsAmount > 0 && (
          <p className="mt-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            You save {formatPrice(savingsAmount)} • Inclusive of all taxes &amp;{" "}
            {SITE_CONFIG.shipping.warrantyText}
          </p>
        )}
      </div>

      {/* Short Hardware Highlights List */}
      <div className="space-y-2.5">
        <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Key Hardware Highlights
        </h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <li className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card p-3 text-xs">
            <Cpu
              className="h-4 w-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            <span className="truncate font-medium text-foreground">
              {product.specs.processor}
            </span>
          </li>
          <li className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card p-3 text-xs">
            <MemoryStick
              className="h-4 w-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            <span className="truncate font-medium text-foreground">
              {product.specs.ram} • {product.specs.storage}
            </span>
          </li>
          <li className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card p-3 text-xs">
            <Monitor
              className="h-4 w-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            <span className="truncate font-medium text-foreground">
              {product.specs.display}
            </span>
          </li>
          <li className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card p-3 text-xs">
            <HardDrive
              className="h-4 w-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            <span className="truncate font-medium text-foreground">
              {product.specs.gpu}
            </span>
          </li>
        </ul>
      </div>

      {/* Quantity Selector & Primary Action Buttons */}
      <div className="space-y-3 border-t border-border pt-5">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Quantity
            </span>
            <QuantitySelector
              quantity={quantity}
              maxStock={product.stock}
              onChange={(next) => {
                if (next > product.stock) {
                  showToast(
                    `Maximum available stock is ${product.stock}.`,
                    "warning"
                  );
                }
                setQuantity(next);
              }}
              disabled={isOutOfStock}
            />
          </div>

          <div className="flex flex-1 flex-wrap items-end gap-3 pt-5">
            <Button
              type="button"
              variant="accent"
              size="lg"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="min-w-[160px] flex-1 shadow-md shadow-blue-600/20"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              <span>
                {isOutOfStock
                  ? "Out of Stock"
                  : `Add to Cart • ${formatPrice(product.price * quantity)}`}
              </span>
            </Button>

            <Button
              type="button"
              variant="default"
              size="lg"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className="min-w-[130px]"
            >
              <Zap className="h-4 w-4" aria-hidden="true" />
              <span>Buy Now</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleWishlistToggle}
              aria-pressed={wishlisted}
              aria-label={
                wishlisted
                  ? `Remove ${product.name} from wishlist`
                  : `Add ${product.name} to wishlist`
              }
              className={cn(
                "h-12 w-12 shrink-0 rounded-xl",
                wishlisted &&
                  "border-rose-500/40 bg-rose-500/10 text-rose-500 hover:bg-rose-500/15 hover:text-rose-500"
              )}
            >
              <Heart
                className={cn("h-5 w-5", wishlisted && "fill-rose-500")}
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Delivery Info Box */}
      <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-4 shadow-card sm:p-5">
        <div className="flex items-start gap-3">
          <Truck
            className="mt-0.5 h-5 w-5 shrink-0 text-accent"
            aria-hidden="true"
          />
          <div className="text-xs leading-relaxed">
            <p className="font-semibold text-foreground">
              Estimated Express Delivery: Within 1–3 Business Days
            </p>
            <p className="text-muted-foreground">
              {product.price >= SITE_CONFIG.shipping.freeDeliveryThreshold
                ? `Qualifies for FREE insured express shipping (orders over ${formatPrice(
                    SITE_CONFIG.shipping.freeDeliveryThreshold
                  )}).`
                : `Free shipping on orders over ${formatPrice(
                    SITE_CONFIG.shipping.freeDeliveryThreshold
                  )}.`}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 border-t border-border/60 pt-3">
          <Banknote
            className="mt-0.5 h-5 w-5 shrink-0 text-accent"
            aria-hidden="true"
          />
          <div className="text-xs leading-relaxed">
            <p className="font-semibold text-foreground">
              Cash on Delivery (COD) &amp; Split Corporate Invoicing Available
            </p>
            <p className="text-muted-foreground">
              Inspect your factory-sealed {product.brand} box upon courier
              arrival.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Badges Row */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border/70 bg-surface p-3">
          <BadgeCheck className="h-5 w-5 text-accent" aria-hidden="true" />
          <span className="text-xs font-semibold text-foreground">
            Genuine Product
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border/70 bg-surface p-3">
          <ShieldCheck className="h-5 w-5 text-accent" aria-hidden="true" />
          <span className="text-xs font-semibold text-foreground">
            1-Year Warranty
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border/70 bg-surface p-3">
          <RotateCcw className="h-5 w-5 text-accent" aria-hidden="true" />
          <span className="text-xs font-semibold text-foreground">
            Easy Returns
          </span>
        </div>
      </div>

      {/* Share Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs">
        <span className="inline-flex items-center gap-1.5 font-semibold text-muted-foreground">
          <Share2 className="h-4 w-4 text-accent" aria-hidden="true" />
          <span>Share this laptop:</span>
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            aria-label="Copy product link"
            className="h-8 gap-1.5 text-xs"
          >
            {copied ? (
              <>
                <Check
                  className="h-3.5 w-3.5 text-emerald-500"
                  aria-hidden="true"
                />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Copy Link</span>
              </>
            )}
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
          >
            <a
              href={`https://wa.me/?text=${shareTextEncoded}%20${shareUrlEncoded}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
          >
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrlEncoded}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Facebook"
            >
              <span>Facebook</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
