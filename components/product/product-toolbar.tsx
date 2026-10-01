"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpDown,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from "lucide-react";
import {
  DerivedFilterFacets,
  GraphicsType,
  ListingRoutePreset,
  ProductFilterState,
  SortOption,
  ViewMode,
} from "@/lib/products";
import { LaptopBrand, LaptopCategory } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterSidebar } from "@/components/product/filter-sidebar";

interface ProductToolbarProps {
  totalCount: number;
  startIndex: number;
  endIndex: number;
  activeFilterCount: number;
  filters: ProductFilterState;
  facets: DerivedFilterFacets;
  preset?: ListingRoutePreset;
  onSortChange: (sort: SortOption) => void;
  onViewChange: (view: ViewMode) => void;
  onApplyDraftFilters: (draft: Partial<ProductFilterState>) => void;
  onClearAll: () => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "top-rated", label: "Top Rated" },
  { value: "biggest-discount", label: "Biggest Discount" },
];

/**
 * Product listing toolbar with mobile Filters drawer trigger ("Apply" and "Clear all"),
 * aria-live results summary, sort dropdown, and Grid/List view toggle.
 */
export function ProductToolbar({
  totalCount,
  startIndex,
  endIndex,
  activeFilterCount,
  filters,
  facets,
  preset,
  onSortChange,
  onViewChange,
  onApplyDraftFilters,
  onClearAll,
}: ProductToolbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [draft, setDraft] = useState<ProductFilterState>(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters, mobileOpen]);

  const toggleDraftArray = (
    key:
      | "brand"
      | "category"
      | "ram"
      | "storage"
      | "processor"
      | "screen"
      | "graphics",
    value: string
  ) => {
    setDraft((prev) => {
      const toggleList = <T extends string>(list: T[], item: T): T[] =>
        list.includes(item)
          ? list.filter((x) => x !== item)
          : [...list, item];

      switch (key) {
        case "brand":
          return {
            ...prev,
            brands: toggleList(prev.brands, value as LaptopBrand),
          };
        case "category":
          return {
            ...prev,
            categories: toggleList(prev.categories, value as LaptopCategory),
          };
        case "ram":
          return { ...prev, ram: toggleList(prev.ram, value) };
        case "storage":
          return { ...prev, storage: toggleList(prev.storage, value) };
        case "processor":
          return { ...prev, processors: toggleList(prev.processors, value) };
        case "screen":
          return { ...prev, screens: toggleList(prev.screens, value) };
        case "graphics":
          return {
            ...prev,
            graphics: toggleList(prev.graphics, value as GraphicsType),
          };
      }
    });
  };

  const handleMobileClear = () => {
    onClearAll();
    setMobileOpen(false);
  };

  const handleMobileApply = () => {
    onApplyDraftFilters(draft);
    setMobileOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/80 bg-card px-4 py-3.5 shadow-card sm:px-5">
      {/* Left: Mobile Filters Drawer Trigger + Results Count */}
      <div className="flex flex-wrap items-center gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 gap-2 lg:hidden"
              aria-label="Open product filters"
            >
              <SlidersHorizontal className="h-4 w-4 text-accent" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="flex w-[90vw] max-w-md flex-col justify-between p-0"
          >
            <SheetHeader className="border-b border-border px-6 py-4">
              <SheetTitle>Filter Laptops</SheetTitle>
              <SheetDescription>
                Refine by brand, specs, price range, and availability.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <FilterSidebar
                idPrefix="mobile"
                facets={facets}
                filters={draft}
                preset={preset}
                onToggleArray={toggleDraftArray}
                onPriceChange={(min, max) =>
                  setDraft((prev) => ({
                    ...prev,
                    minPrice: min,
                    maxPrice: max,
                  }))
                }
                onRating4PlusChange={(checked) =>
                  setDraft((prev) => ({ ...prev, rating4Plus: checked }))
                }
                onInStockChange={(checked) =>
                  setDraft((prev) => ({ ...prev, inStockOnly: checked }))
                }
                onClearAll={() =>
                  setDraft((prev) => ({
                    ...prev,
                    brands: preset?.fixedBrand ? [preset.fixedBrand] : [],
                    categories: [],
                    minPrice: undefined,
                    maxPrice: undefined,
                    ram: [],
                    storage: [],
                    processors: [],
                    screens: [],
                    graphics: [],
                    rating4Plus: false,
                    inStockOnly: false,
                  }))
                }
              />
            </div>

            {/* Mobile Drawer Sticky Footer: Clear all & Apply */}
            <div className="flex items-center gap-3 border-t border-border bg-card px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleMobileClear}
                className="flex-1"
              >
                Clear all
              </Button>
              <Button
                type="button"
                variant="accent"
                onClick={handleMobileApply}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Accessible Results Count */}
        <p
          aria-live="polite"
          aria-atomic="true"
          className="text-xs font-medium text-muted-foreground sm:text-sm"
        >
          {totalCount === 0 ? (
            <span>Showing 0 laptops</span>
          ) : (
            <>
              Showing{" "}
              <strong className="font-semibold text-foreground">
                {startIndex}
              </strong>{" "}
              to{" "}
              <strong className="font-semibold text-foreground">
                {endIndex}
              </strong>{" "}
              of{" "}
              <strong className="font-semibold text-foreground">
                {totalCount}
              </strong>{" "}
              laptops
            </>
          )}
        </p>
      </div>

      {/* Right: Sort Dropdown + Grid/List View Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor="sort-select"
            className="hidden items-center gap-1.5 text-xs font-semibold text-muted-foreground sm:inline-flex"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-accent" />
            <span>Sort by:</span>
          </label>
          <select
            id="sort-select"
            aria-label="Sort laptops by"
            value={filters.sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="h-10 cursor-pointer rounded-xl border border-input bg-surface px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-colors focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Grid / List View Switcher */}
        <div
          role="group"
          aria-label="View mode"
          className="inline-flex items-center rounded-xl border border-border/80 bg-surface p-1"
        >
          <button
            type="button"
            onClick={() => onViewChange("grid")}
            aria-pressed={filters.view === "grid"}
            aria-label="Grid view"
            title="Grid view"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              filters.view === "grid"
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange("list")}
            aria-pressed={filters.view === "list"}
            aria-label="List view"
            title="List view"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              filters.view === "list"
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
