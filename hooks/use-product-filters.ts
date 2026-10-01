"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/config";
import {
  GraphicsType,
  ListingRoutePreset,
  parseFilterParams,
  ProductFilterState,
  SortOption,
  ViewMode,
} from "@/lib/products";
import { LaptopBrand, LaptopCategory } from "@/types";

export interface ActiveFilterChip {
  id: string;
  key:
    | "q"
    | "brand"
    | "category"
    | "price"
    | "ram"
    | "storage"
    | "processor"
    | "screen"
    | "graphics"
    | "rating"
    | "inStock";
  value: string;
  label: string;
}

const CATEGORY_LABELS: Record<LaptopCategory, string> = {
  budget: "Budget",
  business: "Business",
  gaming: "Gaming",
  student: "Student",
  ultrabook: "Ultrabook",
};

/**
 * Custom hook managing URL-synchronized filter, sort, view, search, and pagination state.
 * Ensures shareable URLs and full browser back/forward navigation support.
 */
export function useProductFilters(
  preset?: ListingRoutePreset,
  priceBounds?: { min: number; max: number }
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseFilterParams(searchParams, preset),
    [searchParams, preset]
  );

  const pushParams = useCallback(
    (updater: (params: URLSearchParams) => void, resetPage = true) => {
      const next = new URLSearchParams(searchParams.toString());
      updater(next);
      if (resetPage) {
        next.delete("page");
      }
      const queryStr = next.toString();
      router.push(queryStr ? `${pathname}?${queryStr}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  const toggleArrayFilter = useCallback(
    (
      paramKey:
        | "brand"
        | "category"
        | "ram"
        | "storage"
        | "processor"
        | "screen"
        | "graphics",
      value: string
    ) => {
      pushParams((params) => {
        const raw = params.get(paramKey);
        const current = raw
          ? raw
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
        const exists = current.some(
          (item) => item.toLowerCase() === value.toLowerCase()
        );
        const updated = exists
          ? current.filter((item) => item.toLowerCase() !== value.toLowerCase())
          : [...current, value];

        if (updated.length > 0) {
          params.set(paramKey, updated.join(","));
        } else {
          params.delete(paramKey);
        }
      }, true);
    },
    [pushParams]
  );

  const setPriceRange = useCallback(
    (min?: number, max?: number) => {
      pushParams((params) => {
        if (
          min !== undefined &&
          (!priceBounds || min > priceBounds.min)
        ) {
          params.set("minPrice", String(min));
        } else {
          params.delete("minPrice");
        }

        if (
          max !== undefined &&
          (!priceBounds || max < priceBounds.max)
        ) {
          params.set("maxPrice", String(max));
        } else {
          params.delete("maxPrice");
        }
      }, true);
    },
    [priceBounds, pushParams]
  );

  const setRating4Plus = useCallback(
    (checked: boolean) => {
      pushParams((params) => {
        if (checked) {
          params.set("rating", "4");
        } else {
          params.delete("rating");
        }
      }, true);
    },
    [pushParams]
  );

  const setInStockOnly = useCallback(
    (checked: boolean) => {
      pushParams((params) => {
        if (checked) {
          params.set("inStock", "true");
        } else {
          params.delete("inStock");
        }
      }, true);
    },
    [pushParams]
  );

  const setSearchQuery = useCallback(
    (q: string) => {
      pushParams((params) => {
        const trimmed = q.trim();
        if (trimmed) {
          params.set("q", trimmed);
        } else {
          params.delete("q");
        }
      }, true);
    },
    [pushParams]
  );

  const setSort = useCallback(
    (sort: SortOption) => {
      pushParams((params) => {
        const defaultSort = preset?.dealsOnly
          ? "biggest-discount"
          : "relevance";
        if (sort && sort !== defaultSort) {
          params.set("sort", sort);
        } else {
          params.delete("sort");
        }
      }, true);
    },
    [preset?.dealsOnly, pushParams]
  );

  const setView = useCallback(
    (view: ViewMode) => {
      pushParams((params) => {
        if (view === "list") {
          params.set("view", "list");
        } else {
          params.delete("view");
        }
      }, false);
    },
    [pushParams]
  );

  const setPage = useCallback(
    (page: number) => {
      pushParams((params) => {
        if (page > 1) {
          params.set("page", String(page));
        } else {
          params.delete("page");
        }
      }, false);
    },
    [pushParams]
  );

  const clearAllFilters = useCallback(() => {
    pushParams((params) => {
      const preservedView = params.get("view");
      const preservedSort = params.get("sort");
      Array.from(params.keys()).forEach((key) => params.delete(key));
      if (preservedView) params.set("view", preservedView);
      if (preservedSort) params.set("sort", preservedSort);
    }, true);
  }, [pushParams]);

  const applyDraftFilters = useCallback(
    (draft: Partial<ProductFilterState>) => {
      pushParams((params) => {
        const setArray = (key: string, arr?: string[]) => {
          if (arr && arr.length > 0) {
            params.set(key, arr.join(","));
          } else {
            params.delete(key);
          }
        };

        if (!preset?.fixedBrand && draft.brands !== undefined) {
          setArray("brand", draft.brands);
        }
        if (draft.categories !== undefined) {
          setArray("category", draft.categories);
        }
        if (draft.ram !== undefined) {
          setArray("ram", draft.ram);
        }
        if (draft.storage !== undefined) {
          setArray("storage", draft.storage);
        }
        if (draft.processors !== undefined) {
          setArray("processor", draft.processors);
        }
        if (draft.screens !== undefined) {
          setArray("screen", draft.screens);
        }
        if (draft.graphics !== undefined) {
          setArray("graphics", draft.graphics);
        }

        if (
          draft.minPrice !== undefined &&
          (!priceBounds || draft.minPrice > priceBounds.min)
        ) {
          params.set("minPrice", String(draft.minPrice));
        } else {
          params.delete("minPrice");
        }

        if (
          draft.maxPrice !== undefined &&
          (!priceBounds || draft.maxPrice < priceBounds.max)
        ) {
          params.set("maxPrice", String(draft.maxPrice));
        } else {
          params.delete("maxPrice");
        }

        if (draft.rating4Plus) {
          params.set("rating", "4");
        } else {
          params.delete("rating");
        }

        if (draft.inStockOnly) {
          params.set("inStock", "true");
        } else {
          params.delete("inStock");
        }
      }, true);
    },
    [preset?.fixedBrand, priceBounds, pushParams]
  );

  const activeChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];

    if (filters.q) {
      chips.push({
        id: `q-${filters.q}`,
        key: "q",
        value: filters.q,
        label: `Search: "${filters.q}"`,
      });
    }

    if (!preset?.fixedBrand) {
      for (const brand of filters.brands) {
        chips.push({
          id: `brand-${brand}`,
          key: "brand",
          value: brand,
          label: `Brand: ${brand}`,
        });
      }
    }

    for (const cat of filters.categories) {
      chips.push({
        id: `category-${cat}`,
        key: "category",
        value: cat,
        label: `Category: ${CATEGORY_LABELS[cat] ?? cat}`,
      });
    }

    const hasMin =
      filters.minPrice !== undefined &&
      (!priceBounds || filters.minPrice > priceBounds.min);
    const hasMax =
      filters.maxPrice !== undefined &&
      (!priceBounds || filters.maxPrice < priceBounds.max);
    if (hasMin || hasMax) {
      const minLabel = formatPrice(filters.minPrice ?? priceBounds?.min ?? 0);
      const maxLabel = formatPrice(
        filters.maxPrice ?? priceBounds?.max ?? 3000
      );
      chips.push({
        id: "price-range",
        key: "price",
        value: `${minLabel}-${maxLabel}`,
        label: `Price: ${minLabel} – ${maxLabel}`,
      });
    }

    for (const ram of filters.ram) {
      chips.push({
        id: `ram-${ram}`,
        key: "ram",
        value: ram,
        label: `RAM: ${ram}`,
      });
    }

    for (const storage of filters.storage) {
      chips.push({
        id: `storage-${storage}`,
        key: "storage",
        value: storage,
        label: `Storage: ${storage}`,
      });
    }

    for (const cpu of filters.processors) {
      chips.push({
        id: `processor-${cpu}`,
        key: "processor",
        value: cpu,
        label: `CPU: ${cpu}`,
      });
    }

    for (const screen of filters.screens) {
      chips.push({
        id: `screen-${screen}`,
        key: "screen",
        value: screen,
        label: `Screen: ${screen}`,
      });
    }

    for (const gpu of filters.graphics) {
      chips.push({
        id: `graphics-${gpu}`,
        key: "graphics",
        value: gpu,
        label: `Graphics: ${gpu}`,
      });
    }

    if (filters.rating4Plus) {
      chips.push({
        id: "rating-4plus",
        key: "rating",
        value: "4",
        label: "Rating: 4★ & Up",
      });
    }

    if (filters.inStockOnly) {
      chips.push({
        id: "in-stock",
        key: "inStock",
        value: "true",
        label: "In Stock Only",
      });
    }

    return chips;
  }, [filters, preset?.fixedBrand, priceBounds]);

  const removeChip = useCallback(
    (chip: ActiveFilterChip) => {
      switch (chip.key) {
        case "q":
          setSearchQuery("");
          break;
        case "brand":
          toggleArrayFilter("brand", chip.value as LaptopBrand);
          break;
        case "category":
          toggleArrayFilter("category", chip.value as LaptopCategory);
          break;
        case "price":
          setPriceRange(undefined, undefined);
          break;
        case "ram":
          toggleArrayFilter("ram", chip.value);
          break;
        case "storage":
          toggleArrayFilter("storage", chip.value);
          break;
        case "processor":
          toggleArrayFilter("processor", chip.value);
          break;
        case "screen":
          toggleArrayFilter("screen", chip.value);
          break;
        case "graphics":
          toggleArrayFilter("graphics", chip.value as GraphicsType);
          break;
        case "rating":
          setRating4Plus(false);
          break;
        case "inStock":
          setInStockOnly(false);
          break;
      }
    },
    [
      setInStockOnly,
      setPriceRange,
      setRating4Plus,
      setSearchQuery,
      toggleArrayFilter,
    ]
  );

  return {
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
  };
}
