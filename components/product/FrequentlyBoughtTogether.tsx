"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, PackagePlus, Plus, ShoppingBag, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/section-heading";
import { ACCESSORIES } from "@/data/accessories";
import { formatPrice } from "@/lib/config";
import type { Product } from "@/types/product";

interface FrequentlyBoughtTogetherProps {
  product: Product;
}

export function FrequentlyBoughtTogether({
  product,
}: FrequentlyBoughtTogetherProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    ACCESSORIES.map((acc) => acc.id)
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleAccessory = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedAccessories = ACCESSORIES.filter((acc) =>
    selectedIds.includes(acc.id)
  );

  const accessoriesTotal = selectedAccessories.reduce(
    (sum, acc) => sum + acc.price,
    0
  );
  const bundleTotal = product.price + accessoriesTotal;
  const bundleOldTotal =
    (product.oldPrice ?? product.price) +
    selectedAccessories.reduce(
      (sum, acc) => sum + (acc.oldPrice ?? acc.price),
      0
    );
  const totalSavings = Math.max(0, bundleOldTotal - bundleTotal);

  const handleAddBundle = () => {
    // TODO: Wire Add Bundle to Cart to Zustand cart state in Step 5
    setToastMessage("Cart coming in the next step");
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  return (
    <section className="py-10 border-t border-border/70">
      <SectionHeading
        eyebrow="Complete Your Setup"
        title="Frequently Bought Together"
        description="Pair your laptop with essential protection, precision control, and active cooling accessories."
        align="left"
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Items selection list */}
        <div className="lg:col-span-8 space-y-3">
          {/* Primary Laptop (Always included) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border-2 border-primary/30 bg-primary/[0.03] p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Check className="h-4 w-4" />
              </div>
              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary/60 p-2">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-[10px] px-2 py-0">
                    Main Laptop
                  </Badge>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {product.brand}
                  </span>
                </div>
                <h3 className="mt-1 font-heading text-sm font-bold text-foreground">
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {product.specs.processor} · {product.specs.ram} ·{" "}
                  {product.specs.storage}
                </p>
              </div>
            </div>
            <div className="sm:text-right pl-10 sm:pl-0">
              <div className="font-heading text-base font-bold text-foreground">
                {formatPrice(product.price)}
              </div>
              {product.oldPrice && product.oldPrice > product.price && (
                <div className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.oldPrice)}
                </div>
              )}
            </div>
          </div>

          {/* Accessories with checkboxes */}
          {ACCESSORIES.map((acc) => {
            const isSelected = selectedIds.includes(acc.id);
            return (
              <label
                key={acc.id}
                htmlFor={`bundle-acc-${acc.id}`}
                className={`flex cursor-pointer flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? "border-primary/40 bg-card shadow-soft"
                    : "border-border/60 bg-secondary/15 opacity-75 hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  <input
                    id={`bundle-acc-${acc.id}`}
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleAccessory(acc.id)}
                    className="h-5 w-5 rounded border-border text-primary focus:ring-primary accent-blue-600"
                  />
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary/60 p-2">
                    <Image
                      src={acc.image}
                      alt={acc.name}
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-2 py-0 capitalize"
                      >
                        {acc.category}
                      </Badge>
                    </div>
                    <h4 className="mt-1 font-heading text-sm font-semibold text-foreground">
                      {acc.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {acc.shortSpec}
                    </p>
                  </div>
                </div>
                <div className="sm:text-right pl-9 sm:pl-0 shrink-0">
                  <div className="font-heading text-base font-bold text-foreground">
                    + {formatPrice(acc.price)}
                  </div>
                  {acc.oldPrice && acc.oldPrice > acc.price && (
                    <div className="text-xs text-muted-foreground line-through">
                      {formatPrice(acc.oldPrice)}
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        {/* Right: Bundle summary card */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-border/80 bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <PackagePlus className="h-4 w-4" />
              <span>Custom Bundle Summary</span>
            </div>

            <div className="mt-4 flex items-center gap-2 overflow-x-auto py-2">
              <div className="relative h-14 w-14 shrink-0 rounded-xl border border-border bg-secondary/50 p-1.5">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
              </div>
              {selectedAccessories.map((acc) => (
                <div key={acc.id} className="flex items-center gap-2 shrink-0">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                  <div className="relative h-14 w-14 rounded-xl border border-border bg-secondary/50 p-1.5">
                    <Image
                      src={acc.image}
                      alt={acc.name}
                      fill
                      sizes="56px"
                      className="object-contain p-1"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2.5 border-t border-border/60 pt-4 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Laptop (1 item)</span>
                <span className="font-medium text-foreground">
                  {formatPrice(product.price)}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>
                  Accessories ({selectedAccessories.length} selected)
                </span>
                <span className="font-medium text-foreground">
                  {formatPrice(accessoriesTotal)}
                </span>
              </div>
              {totalSavings > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    Bundle Savings
                  </span>
                  <span>- {formatPrice(totalSavings)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-border/60 pt-3">
                <span className="font-heading text-sm font-bold text-foreground">
                  Combined Total
                </span>
                <div className="text-right">
                  <span className="font-heading text-2xl font-bold text-primary">
                    {formatPrice(bundleTotal)}
                  </span>
                  {bundleOldTotal > bundleTotal && (
                    <div className="text-xs text-muted-foreground line-through">
                      {formatPrice(bundleOldTotal)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="button"
              size="lg"
              disabled={product.stock === 0}
              onClick={handleAddBundle}
              className="mt-5 w-full font-semibold shadow-glow"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {product.stock === 0
                ? "Laptop Out of Stock"
                : `Add Bundle to Cart (${1 + selectedAccessories.length} Items)`}
            </Button>

            {toastMessage && (
              <div
                role="status"
                aria-live="polite"
                className="mt-3 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2.5 text-center text-xs font-semibold text-primary"
              >
                {toastMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
