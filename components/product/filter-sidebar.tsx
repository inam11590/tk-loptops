"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Star } from "lucide-react";
import { formatPrice, SITE_CONFIG } from "@/lib/config";
import {
  DerivedFilterFacets,
  GraphicsType,
  ListingRoutePreset,
  ProductFilterState,
} from "@/lib/products";
import { LaptopBrand, LaptopCategory } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface FilterSidebarProps {
  facets: DerivedFilterFacets;
  filters: ProductFilterState;
  preset?: ListingRoutePreset;
  onToggleArray: (
    key:
      | "brand"
      | "category"
      | "ram"
      | "storage"
      | "processor"
      | "screen"
      | "graphics",
    value: string
  ) => void;
  onPriceChange: (min?: number, max?: number) => void;
  onRating4PlusChange: (checked: boolean) => void;
  onInStockChange: (checked: boolean) => void;
  onClearAll: () => void;
  idPrefix?: string;
}

/**
 * Collapsible filter sidebar supporting all 10 hardware & store filter dimensions:
 * Brand, Category, Price Range (dual-handle slider + min/max inputs), RAM, Storage,
 * Processor, Screen Size, Graphics, Rating (4+ stars), and Availability (In stock only).
 */
export function FilterSidebar({
  facets,
  filters,
  preset,
  onToggleArray,
  onPriceChange,
  onRating4PlusChange,
  onInStockChange,
  onClearAll,
  idPrefix = "desktop",
}: FilterSidebarProps) {
  const minBound = facets.priceBounds.min;
  const maxBound = facets.priceBounds.max;

  const activeMin = filters.minPrice ?? minBound;
  const activeMax = filters.maxPrice ?? maxBound;

  const [priceDraft, setPriceDraft] = useState<[number, number]>([
    activeMin,
    activeMax,
  ]);

  useEffect(() => {
    setPriceDraft([
      filters.minPrice ?? minBound,
      filters.maxPrice ?? maxBound,
    ]);
  }, [filters.minPrice, filters.maxPrice, minBound, maxBound]);

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    if (Number.isNaN(raw)) return;
    const clamped = Math.max(minBound, Math.min(raw, priceDraft[1]));
    setPriceDraft([clamped, priceDraft[1]]);
    onPriceChange(clamped, priceDraft[1]);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    if (Number.isNaN(raw)) return;
    const clamped = Math.min(maxBound, Math.max(raw, priceDraft[0]));
    setPriceDraft([priceDraft[0], clamped]);
    onPriceChange(priceDraft[0], clamped);
  };

  const defaultOpenSections = [
    "brand",
    "category",
    "price",
    "ram",
    "storage",
    "processor",
    "screen",
    "graphics",
    "rating-stock",
  ];

  return (
    <div className="space-y-4">
      {/* Sidebar Header with Clear All */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="font-heading text-base font-bold text-foreground">
          Filters
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-8 gap-1.5 px-2.5 text-xs font-semibold text-muted-foreground hover:text-accent"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Clear all filters</span>
        </Button>
      </div>

      <Accordion
        type="multiple"
        defaultValue={defaultOpenSections}
        className="space-y-3"
      >
        {/* 1. Brand Filter (unless locked by /laptops/hp or /laptops/dell) */}
        {!preset?.fixedBrand && (
          <AccordionItem value="brand" className="px-4">
            <AccordionTrigger className="py-3.5 text-sm">
              Brand
            </AccordionTrigger>
            <AccordionContent className="space-y-2.5 pb-4">
              {facets.brands.map((brand) => {
                const inputId = `${idPrefix}-brand-${brand.value}`;
                const checked = filters.brands.includes(
                  brand.value as LaptopBrand
                );
                return (
                  <div
                    key={brand.value}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <Checkbox
                        id={inputId}
                        checked={checked}
                        onCheckedChange={() =>
                          onToggleArray("brand", brand.value)
                        }
                      />
                      <label
                        htmlFor={inputId}
                        className="cursor-pointer text-sm font-medium text-foreground/90"
                      >
                        {brand.label}
                      </label>
                    </div>
                    <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {brand.count}
                    </span>
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* 2. Category Filter */}
        <AccordionItem value="category" className="px-4">
          <AccordionTrigger className="py-3.5 text-sm">
            Category
          </AccordionTrigger>
          <AccordionContent className="space-y-2.5 pb-4">
            {facets.categories.map((cat) => {
              const inputId = `${idPrefix}-category-${cat.value}`;
              const checked = filters.categories.includes(
                cat.value as LaptopCategory
              );
              return (
                <div
                  key={cat.value}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      id={inputId}
                      checked={checked}
                      onCheckedChange={() =>
                        onToggleArray("category", cat.value)
                      }
                    />
                    <label
                      htmlFor={inputId}
                      className="cursor-pointer text-sm font-medium text-foreground/90"
                    >
                      {cat.label}
                    </label>
                  </div>
                  <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {cat.count}
                  </span>
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>

        {/* 3. Price Range (Dual-handle slider + Min/Max inputs) */}
        <AccordionItem value="price" className="px-4">
          <AccordionTrigger className="py-3.5 text-sm">
            Price Range
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>{formatPrice(priceDraft[0])}</span>
              <span>{formatPrice(priceDraft[1])}</span>
            </div>

            <Slider
              min={minBound}
              max={maxBound}
              step={50}
              value={priceDraft}
              thumbLabels={["Minimum price", "Maximum price"]}
              onValueChange={(val) =>
                setPriceDraft([val[0] ?? minBound, val[1] ?? maxBound])
              }
              onValueCommit={(val) =>
                onPriceChange(val[0] ?? minBound, val[1] ?? maxBound)
              }
            />

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div>
                <label
                  htmlFor={`${idPrefix}-min-price`}
                  className="mb-1 block text-[11px] font-medium text-muted-foreground"
                >
                  Min ({SITE_CONFIG.currency.symbol})
                </label>
                <Input
                  id={`${idPrefix}-min-price`}
                  type="number"
                  min={minBound}
                  max={priceDraft[1]}
                  step={50}
                  value={priceDraft[0]}
                  onChange={handleMinInputChange}
                  className="h-9 px-2.5 text-xs"
                />
              </div>
              <div>
                <label
                  htmlFor={`${idPrefix}-max-price`}
                  className="mb-1 block text-[11px] font-medium text-muted-foreground"
                >
                  Max ({SITE_CONFIG.currency.symbol})
                </label>
                <Input
                  id={`${idPrefix}-max-price`}
                  type="number"
                  min={priceDraft[0]}
                  max={maxBound}
                  step={50}
                  value={priceDraft[1]}
                  onChange={handleMaxInputChange}
                  className="h-9 px-2.5 text-xs"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4. RAM Filter */}
        <AccordionItem value="ram" className="px-4">
          <AccordionTrigger className="py-3.5 text-sm">
            Memory (RAM)
          </AccordionTrigger>
          <AccordionContent className="space-y-2.5 pb-4">
            {facets.ram.map((ram) => {
              const inputId = `${idPrefix}-ram-${ram.value}`;
              const checked = filters.ram.includes(ram.value);
              return (
                <div
                  key={ram.value}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      id={inputId}
                      checked={checked}
                      onCheckedChange={() => onToggleArray("ram", ram.value)}
                    />
                    <label
                      htmlFor={inputId}
                      className="cursor-pointer text-sm font-medium text-foreground/90"
                    >
                      {ram.label}
                    </label>
                  </div>
                  <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {ram.count}
                  </span>
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>

        {/* 5. Storage Filter */}
        <AccordionItem value="storage" className="px-4">
          <AccordionTrigger className="py-3.5 text-sm">
            SSD Storage
          </AccordionTrigger>
          <AccordionContent className="space-y-2.5 pb-4">
            {facets.storage.map((storage) => {
              const inputId = `${idPrefix}-storage-${storage.value}`;
              const checked = filters.storage.includes(storage.value);
              return (
                <div
                  key={storage.value}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      id={inputId}
                      checked={checked}
                      onCheckedChange={() =>
                        onToggleArray("storage", storage.value)
                      }
                    />
                    <label
                      htmlFor={inputId}
                      className="cursor-pointer text-sm font-medium text-foreground/90"
                    >
                      {storage.label}
                    </label>
                  </div>
                  <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {storage.count}
                  </span>
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>

        {/* 6. Processor Filter */}
        <AccordionItem value="processor" className="px-4">
          <AccordionTrigger className="py-3.5 text-sm">
            Processor
          </AccordionTrigger>
          <AccordionContent className="space-y-2.5 pb-4">
            {facets.processors.map((cpu) => {
              const inputId = `${idPrefix}-cpu-${cpu.value.replace(/\s+/g, "-")}`;
              const checked = filters.processors.includes(cpu.value);
              return (
                <div
                  key={cpu.value}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      id={inputId}
                      checked={checked}
                      onCheckedChange={() =>
                        onToggleArray("processor", cpu.value)
                      }
                    />
                    <label
                      htmlFor={inputId}
                      className="cursor-pointer text-sm font-medium text-foreground/90"
                    >
                      {cpu.label}
                    </label>
                  </div>
                  <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {cpu.count}
                  </span>
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>

        {/* 7. Screen Size Filter */}
        <AccordionItem value="screen" className="px-4">
          <AccordionTrigger className="py-3.5 text-sm">
            Screen Size
          </AccordionTrigger>
          <AccordionContent className="space-y-2.5 pb-4">
            {facets.screens.map((screen) => {
              const inputId = `${idPrefix}-screen-${screen.value.replace(/[^a-zA-Z0-9]/g, "")}`;
              const checked = filters.screens.includes(screen.value);
              return (
                <div
                  key={screen.value}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      id={inputId}
                      checked={checked}
                      onCheckedChange={() =>
                        onToggleArray("screen", screen.value)
                      }
                    />
                    <label
                      htmlFor={inputId}
                      className="cursor-pointer text-sm font-medium text-foreground/90"
                    >
                      {screen.label}
                    </label>
                  </div>
                  <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {screen.count}
                  </span>
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>

        {/* 8. Graphics Filter */}
        <AccordionItem value="graphics" className="px-4">
          <AccordionTrigger className="py-3.5 text-sm">
            Graphics Type
          </AccordionTrigger>
          <AccordionContent className="space-y-2.5 pb-4">
            {facets.graphics.map((gpu) => {
              const inputId = `${idPrefix}-gpu-${gpu.value}`;
              const checked = filters.graphics.includes(
                gpu.value as GraphicsType
              );
              return (
                <div
                  key={gpu.value}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      id={inputId}
                      checked={checked}
                      onCheckedChange={() =>
                        onToggleArray("graphics", gpu.value)
                      }
                    />
                    <label
                      htmlFor={inputId}
                      className="cursor-pointer text-sm font-medium text-foreground/90"
                    >
                      {gpu.label}
                    </label>
                  </div>
                  <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {gpu.count}
                  </span>
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>

        {/* 9 & 10. Customer Rating (4+ Stars) & Availability (In Stock Only) */}
        <AccordionItem value="rating-stock" className="px-4">
          <AccordionTrigger className="py-3.5 text-sm">
            Rating &amp; Availability
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id={`${idPrefix}-rating-4plus`}
                  checked={filters.rating4Plus}
                  onCheckedChange={(val) => onRating4PlusChange(Boolean(val))}
                />
                <label
                  htmlFor={`${idPrefix}-rating-4plus`}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-foreground/90"
                >
                  <span className="inline-flex items-center text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                  </span>
                  <span>&amp; Up</span>
                </label>
              </div>
              <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {facets.rating4PlusCount}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id={`${idPrefix}-in-stock`}
                  checked={filters.inStockOnly}
                  onCheckedChange={(val) => onInStockChange(Boolean(val))}
                />
                <label
                  htmlFor={`${idPrefix}-in-stock`}
                  className="cursor-pointer text-sm font-medium text-foreground/90"
                >
                  In Stock Only
                </label>
              </div>
              <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {facets.inStockCount}
              </span>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
