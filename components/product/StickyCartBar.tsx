"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/config";
import type { Product } from "@/types/product";

interface StickyCartBarProps {
  product: Product;
}

export function StickyCartBar({ product }: StickyCartBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    // TODO: Wire mobile sticky Add to Cart button to Zustand cart store in Step 5
    setToastMessage("Cart coming in the next step");
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 p-3 shadow-2xl backdrop-blur-md md:hidden">
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="mb-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-center text-xs font-semibold text-primary"
        >
          {toastMessage}
        </div>
      )}
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
          size="default"
          disabled={product.stock === 0}
          onClick={handleAddToCart}
          className="shrink-0 font-semibold shadow-glow"
        >
          <ShoppingBag className="mr-1.5 h-4 w-4" />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
