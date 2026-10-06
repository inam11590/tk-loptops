"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { productToCartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/config";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/product";

interface StickyCartBarProps {
  product: Product;
}

export function StickyCartBar({ product }: StickyCartBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const hydrated = useHydrated();

  const addItem = useCartStore((state) => state.addItem);
  const cartQty = useCartStore((state) =>
    hydrated
      ? state.items.find((i) => i.productId === product.id)?.quantity ?? 0
      : 0
  );

  useEffect(() => {
    const handleScroll = () => {
      const mainCta = document.getElementById("product-main-cta");
      if (!mainCta) {
        setIsVisible(window.scrollY > 520);
        return;
      }
      const rect = mainCta.getBoundingClientRect();
      // Show sticky bar when the main CTA block scrolls above the viewport
      setIsVisible(rect.bottom < 64);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addItem(productToCartItem(product, 1), 1, { openMiniCart: true });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 p-3 shadow-2xl backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">
            {product.name}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-lg font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant={
            product.stock === 0
              ? "secondary"
              : cartQty > 0
              ? "default"
              : "accent"
          }
          size="default"
          disabled={product.stock === 0}
          onClick={handleAddToCart}
          className="shrink-0 font-semibold shadow-sm"
        >
          {product.stock === 0 ? (
            <span>Out of Stock</span>
          ) : cartQty > 0 ? (
            <>
              <Check className="mr-1.5 h-4 w-4" />
              <span>In Cart ({cartQty})</span>
            </>
          ) : (
            <>
              <ShoppingBag className="mr-1.5 h-4 w-4" />
              <span>Add to Cart</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
