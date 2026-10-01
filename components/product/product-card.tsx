import Image from "next/image";
import Link from "next/link";
import {
  BatteryCharging,
  Cpu,
  HardDrive,
  Heart,
  MemoryStick,
  Monitor,
  ShoppingCart,
  Star,
} from "lucide-react";
import { Product } from "@/types";
import { calculateDiscountPercentage, formatPrice } from "@/lib/config";
import { ViewMode } from "@/lib/products";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
  variant?: ViewMode;
}

/**
 * Reusable ProductCard supporting both vertical "grid" and horizontal "list" variants.
 * Displays laptop image, brand & discount badges, rating, title, key hardware specs,
 * formatted pricing via formatPrice(), and wishlist / add-to-cart action buttons.
 */
export function ProductCard({ product, variant = "grid" }: ProductCardProps) {
  const discountPercent = calculateDiscountPercentage(
    product.price,
    product.oldPrice
  );
  const primaryImage = product.images[0] ?? "/images/laptops/hp-business.svg";
  const isOutOfStock = product.stock <= 0;

  if (variant === "list") {
    return (
      <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card text-card-foreground shadow-card transition-all duration-300 hover:border-accent/40 hover:shadow-card-hover sm:flex-row">
        {/* Left Image Area */}
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-surface p-4 sm:aspect-auto sm:w-64 lg:w-72">
          <div className="relative z-10 flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={product.brand === "HP" ? "hp" : "dell"}>
                {product.brand}
              </Badge>
              {discountPercent && (
                <Badge variant="discount">-{discountPercent}%</Badge>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`Add ${product.name} to wishlist`}
              className="h-9 w-9 rounded-full border-border/60 bg-background/85 text-muted-foreground backdrop-blur-sm transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-500"
            >
              <Heart className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <Link
            href={`/laptops/${product.slug}`}
            aria-label={`View details for ${product.name}`}
            className="mt-2 flex h-40 w-full items-center justify-center focus-visible:outline-none sm:h-[calc(100%-2.5rem)]"
          >
            <Image
              src={primaryImage}
              alt={product.name}
              width={400}
              height={300}
              sizes="(max-width: 640px) 100vw, 288px"
              className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Right Details & Pricing Column */}
        <div className="flex flex-1 flex-col justify-between gap-4 p-5 sm:p-6 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-3">
            {/* Rating, Category & Stock */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div
                className="flex items-center gap-1.5 font-medium text-foreground"
                aria-label={`Rated ${product.rating} out of 5 stars based on ${product.reviewCount} reviews`}
              >
                <Star
                  className="h-4 w-4 fill-amber-400 text-amber-400"
                  aria-hidden="true"
                />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({product.reviewCount} reviews)
                </span>
              </div>
              <span className="text-border">•</span>
              <span className="capitalize text-muted-foreground">
                {product.category} Series
              </span>
              <span className="text-border">•</span>
              <span
                className={cn(
                  "font-medium",
                  isOutOfStock
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : product.stock > 10
                    ? "In Stock"
                    : `Only ${product.stock} left`}
              </span>
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="font-heading text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-accent sm:text-xl">
                <Link
                  href={`/laptops/${product.slug}`}
                  className="focus-visible:outline-none focus-visible:underline"
                >
                  {product.name}
                </Link>
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {product.description}
              </p>
            </div>

            {/* 2-Column Hardware Specs Grid */}
            <dl className="grid grid-cols-1 gap-2 rounded-xl bg-surface/80 p-3 text-xs text-muted-foreground sm:grid-cols-2">
              <div className="flex items-center gap-2 truncate">
                <Cpu
                  className="h-3.5 w-3.5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <dt className="sr-only">Processor</dt>
                <dd className="truncate font-medium text-foreground/90">
                  {product.specs.processor}
                </dd>
              </div>
              <div className="flex items-center gap-2 truncate">
                <MemoryStick
                  className="h-3.5 w-3.5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <dt className="sr-only">Memory and Storage</dt>
                <dd className="truncate">
                  {product.specs.ram} • {product.specs.storage}
                </dd>
              </div>
              <div className="flex items-center gap-2 truncate">
                <Monitor
                  className="h-3.5 w-3.5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <dt className="sr-only">Display</dt>
                <dd className="truncate">{product.specs.display}</dd>
              </div>
              <div className="flex items-center gap-2 truncate">
                <HardDrive
                  className="h-3.5 w-3.5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <dt className="sr-only">Graphics</dt>
                <dd className="truncate">{product.specs.gpu}</dd>
              </div>
            </dl>
          </div>

          {/* Right Action Box */}
          <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-border/60 pt-4 lg:w-48 lg:flex-col lg:items-end lg:justify-center lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div className="lg:text-right">
              <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Price
              </span>
              <div className="flex items-baseline gap-2 lg:justify-end">
                <span className="font-heading text-2xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-xs font-medium text-muted-foreground line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>
              <span className="mt-1 hidden items-center justify-end gap-1 text-[11px] text-muted-foreground lg:inline-flex">
                <BatteryCharging className="h-3 w-3 text-accent" />
                {product.specs.weight}
              </span>
            </div>

            <Button
              type="button"
              variant={isOutOfStock ? "secondary" : "accent"}
              disabled={isOutOfStock}
              aria-label={
                isOutOfStock
                  ? `${product.name} is out of stock`
                  : `Add ${product.name} to cart`
              }
              className="h-10 rounded-xl px-5 font-semibold shadow-sm lg:w-full"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </Button>
          </div>
        </div>
      </article>
    );
  }

  // Default "grid" vertical card variant
  return (
    <article className="product-card-container group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card text-card-foreground shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card-hover">
      {/* Top Image & Badges Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface p-4">
        {/* Top Row: Brand Badge + Discount % + Wishlist Button */}
        <div className="relative z-10 flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={product.brand === "HP" ? "hp" : "dell"}>
              {product.brand}
            </Badge>
            {discountPercent && (
              <Badge variant="discount">-{discountPercent}%</Badge>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={`Add ${product.name} to wishlist`}
            className="h-9 w-9 rounded-full border-border/60 bg-background/85 text-muted-foreground backdrop-blur-sm transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-500"
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Product Illustration / Image */}
        <Link
          href={`/laptops/${product.slug}`}
          aria-label={`View details for ${product.name}`}
          className="mt-1 flex h-[calc(100%-2.25rem)] w-full items-center justify-center focus-visible:outline-none"
        >
          <Image
            src={primaryImage}
            alt={product.name}
            width={400}
            height={300}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-3">
          {/* Rating & Stock Status */}
          <div className="flex items-center justify-between text-xs">
            <div
              className="flex items-center gap-1.5 font-medium text-foreground"
              aria-label={`Rated ${product.rating} out of 5 stars based on ${product.reviewCount} reviews`}
            >
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
                "font-medium",
                isOutOfStock
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400"
              )}
            >
              {isOutOfStock
                ? "Out of Stock"
                : product.stock > 10
                  ? "In Stock"
                  : `Only ${product.stock} left`}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="font-heading text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-accent sm:text-lg">
            <Link
              href={`/laptops/${product.slug}`}
              className="line-clamp-2 focus-visible:outline-none focus-visible:underline"
            >
              {product.name}
            </Link>
          </h3>

          {/* Key Hardware Specs Grid */}
          <dl className="grid grid-cols-1 gap-1.5 rounded-xl bg-surface/80 p-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 truncate">
              <Cpu
                className="h-3.5 w-3.5 shrink-0 text-accent"
                aria-hidden="true"
              />
              <dt className="sr-only">Processor</dt>
              <dd className="truncate font-medium text-foreground/90">
                {product.specs.processor}
              </dd>
            </div>
            <div className="flex items-center gap-2 truncate">
              <MemoryStick
                className="h-3.5 w-3.5 shrink-0 text-accent"
                aria-hidden="true"
              />
              <dt className="sr-only">Memory and Storage</dt>
              <dd className="truncate">
                {product.specs.ram} • {product.specs.storage}
              </dd>
            </div>
            <div className="flex items-center gap-2 truncate">
              <Monitor
                className="h-3.5 w-3.5 shrink-0 text-accent"
                aria-hidden="true"
              />
              <dt className="sr-only">Display</dt>
              <dd className="truncate">{product.specs.display}</dd>
            </div>
            <div className="flex items-center gap-2 truncate">
              <HardDrive
                className="h-3.5 w-3.5 shrink-0 text-accent"
                aria-hidden="true"
              />
              <dt className="sr-only">Graphics</dt>
              <dd className="truncate">{product.specs.gpu}</dd>
            </div>
          </dl>
        </div>

        {/* Footer: Price & Add to Cart */}
        <div className="mt-5 flex items-end justify-between gap-3 border-t border-border/60 pt-4">
          <div>
            <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Price
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-xl font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-xs font-medium text-muted-foreground line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant={isOutOfStock ? "secondary" : "accent"}
            size="sm"
            disabled={isOutOfStock}
            aria-label={
              isOutOfStock
                ? `${product.name} is out of stock`
                : `Add ${product.name} to cart`
            }
            className="h-10 rounded-xl px-4 font-semibold shadow-sm"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            <span>{isOutOfStock ? "Sold Out" : "Add to Cart"}</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
