import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Scale, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/section-heading";
import { formatPrice } from "@/lib/config";
import type { Product } from "@/types/product";

interface CompareSimilarProps {
  currentProduct: Product;
  similarProducts: Product[];
}

export function CompareSimilar({
  currentProduct,
  similarProducts,
}: CompareSimilarProps) {
  if (similarProducts.length === 0) return null;

  const allItems = [currentProduct, ...similarProducts.slice(0, 2)];

  const rows: {
    label: string;
    getValue: (p: Product) => string;
  }[] = [
    { label: "Brand", getValue: (p) => p.brand },
    { label: "Category", getValue: (p) => p.category },
    { label: "Price", getValue: (p) => formatPrice(p.price) },
    {
      label: "Rating",
      getValue: (p) => `${p.rating.toFixed(1)} ★ (${p.reviewCount})`,
    },
    { label: "Processor (CPU)", getValue: (p) => p.specs.processor },
    { label: "Memory (RAM)", getValue: (p) => p.specs.ram },
    { label: "Storage", getValue: (p) => p.specs.storage },
    { label: "Display", getValue: (p) => p.specs.display },
    { label: "Graphics (GPU)", getValue: (p) => p.specs.gpu },
    { label: "Battery", getValue: (p) => p.specs.battery },
    { label: "Weight", getValue: (p) => p.specs.weight },
    { label: "Operating System", getValue: (p) => p.specs.os },
  ];

  return (
    <section className="py-10 border-t border-border/70">
      <SectionHeading
        eyebrow="Side-by-Side Comparison"
        title="Compare With Similar Laptops"
        description="See how this configuration stacks up against comparable alternatives in the same category and price tier."
        align="left"
      />

      <div className="mt-8 overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-soft">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border/70 bg-secondary/25">
              <th className="w-[210px] p-5 align-top">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Scale className="h-4 w-4" />
                  <span>Specification</span>
                </div>
                <p className="mt-2 text-xs font-normal text-muted-foreground leading-relaxed">
                  Differences across models are highlighted to help you pick the
                  right configuration.
                </p>
              </th>
              {allItems.map((item, idx) => {
                const isCurrent = idx === 0;
                return (
                  <th
                    key={item.id}
                    className={`p-5 align-top transition-colors ${
                      isCurrent
                        ? "bg-primary/[0.04] border-x border-primary/20"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        {isCurrent ? (
                          <Badge className="bg-primary text-primary-foreground gap-1">
                            <Sparkles className="h-3 w-3" />
                            Viewing Now
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Alternative #{idx}
                          </Badge>
                        )}
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {item.brand}
                        </span>
                      </div>

                      <Link
                        href={`/laptops/${item.slug}`}
                        className="group relative mx-auto mb-3 flex h-32 w-44 items-center justify-center rounded-xl bg-secondary/50 p-3"
                      >
                        <Image
                          src={item.images[0]}
                          alt={item.name}
                          fill
                          sizes="180px"
                          className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                        />
                      </Link>

                      <Link
                        href={`/laptops/${item.slug}`}
                        className="line-clamp-2 font-heading text-sm font-bold text-foreground hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>

                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-heading text-lg font-bold text-foreground">
                          {formatPrice(item.price)}
                        </span>
                        {item.oldPrice && item.oldPrice > item.price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(item.oldPrice)}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 pt-2">
                        {isCurrent ? (
                          <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
                            <Check className="h-3.5 w-3.5" />
                            Current Selection
                          </span>
                        ) : (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full text-xs font-semibold"
                          >
                            <Link href={`/laptops/${item.slug}`}>
                              View Laptop
                              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60 text-sm">
            {rows.map((row) => {
              const values = allItems.map((p) => row.getValue(p));
              const hasDifference = new Set(values).size > 1;

              return (
                <tr
                  key={row.label}
                  className={
                    hasDifference
                      ? "bg-amber-500/[0.03] dark:bg-amber-500/[0.05]"
                      : "hover:bg-secondary/20"
                  }
                >
                  <td className="p-4 font-medium text-muted-foreground">
                    <div className="flex items-center justify-between gap-2">
                      <span>{row.label}</span>
                      {hasDifference && (
                        <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                          Differs
                        </span>
                      )}
                    </div>
                  </td>
                  {allItems.map((item, idx) => {
                    const isCurrent = idx === 0;
                    const val = row.getValue(item);
                    const differsFromCurrent =
                      !isCurrent && val !== row.getValue(currentProduct);

                    return (
                      <td
                        key={`${item.id}-${row.label}`}
                        className={`p-4 capitalize ${
                          isCurrent
                            ? "bg-primary/[0.04] border-x border-primary/20 font-semibold text-foreground"
                            : differsFromCurrent
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
