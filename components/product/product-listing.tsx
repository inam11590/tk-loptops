"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Laptop,
  RotateCcw,
  Search,
  SearchX,
  X,
} from "lucide-react";
import { Product } from "@/types";
import {
  deriveFilterFacets,
  filterAndSortProducts,
  ListingRoutePreset,
} from "@/lib/products";
import { useProductFilters } from "@/hooks/use-product-filters";
import { Container } from "@/components/common/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product/product-card";
import { FilterSidebar } from "@/components/product/filter-sidebar";
import { ProductToolbar } from "@/components/product/product-toolbar";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ProductListingProps {
  title: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  products: Product[];
  preset?: ListingRoutePreset;
  showSearchInput?: boolean;
}

/**
 * Shared reusable Product Listing experience used across:
 * - /laptops
 * - /laptops/hp
 * - /laptops/dell
 * - /deals
 * - /search
 */
export function ProductListing({
  title,
  description,
  breadcrumbs,
  products,
  preset,
  showSearchInput = false,
}: ProductListingProps) {
  const facets = useMemo(
    () => deriveFilterFacets(products, preset),
    [products, preset]
  );

  const {
    filters,
    activeChips,
    toggleArrayFilter,
    setPriceRange,
    setRating4Plus,
    setInStockOnly,
    setSearchQuery,
    setSort,
    setView,
    setPage,
    removeChip,
    clearAllFilters,
    applyDraftFilters,
  } = useProductFilters(preset, facets.priceBounds);

  const [localQuery, setLocalQuery] = useState(filters.q);

  useEffect(() => {
    setLocalQuery(filters.q);
  }, [filters.q]);

  const result = useMemo(
    () => filterAndSortProducts(products, filters),
    [products, filters]
  );

  const handleInlineSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchQuery(localQuery);
  };

  return (
    <div className="py-8 sm:py-12">
      <Container className="space-y-8">
        {/* 1. Page Header: Breadcrumbs, Title, Short Description & Total Results Badge */}
        <header className="relative overflow-hidden rounded-2xl border border-border/80 bg-surface p-6 shadow-soft sm:p-8">
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 transition-colors hover:text-accent focus-visible:outline-none focus-visible:underline"
                >
                  <Home className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Home</span>
                </Link>
              </li>
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <li
                    key={crumb.label}
                    className="inline-flex items-center gap-1.5"
                  >
                    <ChevronRight
                      className="h-3.5 w-3.5 text-muted-foreground/60"
                      aria-hidden="true"
                    />
                    {crumb.href && !isLast ? (
                      <Link
                        href={crumb.href}
                        className="transition-colors hover:text-accent focus-visible:outline-none focus-visible:underline"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        aria-current="page"
                        className="font-semibold text-foreground"
                      >
                        {crumb.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                  {filters.q && showSearchInput
                    ? `Search Results for "${filters.q}"`
                    : title}
                </h1>
                <Badge
                  variant="accent"
                  aria-live="polite"
                  className="rounded-full px-3 py-1 text-xs font-bold"
                >
                  {result.totalCount}{" "}
                  {result.totalCount === 1 ? "Laptop" : "Laptops"}
                </Badge>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {description}
              </p>
            </div>

            {showSearchInput && (
              <form
                role="search"
                aria-label="Refine search query"
                onSubmit={handleInlineSearchSubmit}
                className="flex w-full max-w-md items-center gap-2"
              >
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    type="search"
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    placeholder="Search model, brand, CPU (e.g. i7, Ryzen, OLED)..."
                    aria-label="Search laptops"
                    className="bg-background pl-10"
                  />
                </div>
                <Button type="submit" variant="accent">
                  Search
                </Button>
              </form>
            )}
          </div>
        </header>

        {/* 2. Main Desktop & Mobile Layout */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Desktop Left Sticky Filter Sidebar */}
          <aside
            aria-label="Product filters"
            className="hidden lg:sticky lg:top-24 lg:col-span-3 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1"
          >
            <FilterSidebar
              idPrefix="desktop"
              facets={facets}
              filters={filters}
              preset={preset}
              onToggleArray={toggleArrayFilter}
              onPriceChange={setPriceRange}
              onRating4PlusChange={setRating4Plus}
              onInStockChange={setInStockOnly}
              onClearAll={clearAllFilters}
            />
          </aside>

          {/* Right Column: Toolbar, Active Chips, Product Grid/List & Pagination */}
          <div className="space-y-6 lg:col-span-9">
            <ProductToolbar
              totalCount={result.totalCount}
              startIndex={result.startIndex}
              endIndex={result.endIndex}
              activeFilterCount={activeChips.length}
              filters={filters}
              facets={facets}
              preset={preset}
              onSortChange={setSort}
              onViewChange={setView}
              onApplyDraftFilters={applyDraftFilters}
              onClearAll={clearAllFilters}
            />

            {/* Removable Active Filter Chips */}
            {activeChips.length > 0 && (
              <div
                aria-label="Active filters"
                className="flex flex-wrap items-center gap-2"
              >
                <span className="text-xs font-semibold text-muted-foreground">
                  Active filters:
                </span>
                {activeChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => removeChip(chip)}
                    aria-label={`Remove filter ${chip.label}`}
                    className="group inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span>{chip.label}</span>
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-7 px-2.5 text-xs font-semibold text-muted-foreground hover:text-destructive"
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Product Grid / List or Friendly Empty State */}
            {result.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center">
                <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Laptop className="h-10 w-10 opacity-40" aria-hidden="true" />
                  <SearchX
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-background p-1 text-accent shadow-sm"
                    aria-hidden="true"
                  />
                </div>
                <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                  No matching laptops found
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  We couldn&apos;t find any HP or Dell laptops matching your
                  current combination of filters. Try broadening your price
                  range or clearing active filters.
                </p>
                <Button
                  type="button"
                  variant="accent"
                  onClick={clearAllFilters}
                  className="mt-6 gap-2"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>Clear filters</span>
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={
                    filters.view === "list"
                      ? "flex flex-col gap-5"
                      : "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
                  }
                >
                  {result.items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variant={filters.view}
                    />
                  ))}
                </div>

                {/* Numbered Pagination Controls (12 products per page) */}
                {result.totalPages > 1 && (
                  <nav
                    aria-label="Pagination"
                    className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6"
                  >
                    <p className="text-xs font-medium text-muted-foreground">
                      Page{" "}
                      <strong className="font-semibold text-foreground">
                        {result.currentPage}
                      </strong>{" "}
                      of{" "}
                      <strong className="font-semibold text-foreground">
                        {result.totalPages}
                      </strong>
                    </p>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={result.currentPage <= 1}
                        onClick={() => setPage(result.currentPage - 1)}
                        aria-label="Go to previous page"
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        <span>Previous</span>
                      </Button>

                      {Array.from(
                        { length: result.totalPages },
                        (_, idx) => idx + 1
                      ).map((pageNum) => {
                        const isActive = pageNum === result.currentPage;
                        return (
                          <Button
                            key={pageNum}
                            type="button"
                            variant={isActive ? "accent" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            aria-label={`Page ${pageNum}`}
                            aria-current={isActive ? "page" : undefined}
                            className="h-9 min-w-9 px-3 font-semibold"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={result.currentPage >= result.totalPages}
                        onClick={() => setPage(result.currentPage + 1)}
                        aria-label="Go to next page"
                        className="gap-1"
                      >
                        <span>Next</span>
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
