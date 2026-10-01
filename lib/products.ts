import { PRODUCTS } from "@/data/products";
import { calculateDiscountPercentage } from "@/lib/config";
import { LaptopBrand, LaptopCategory, Product } from "@/types";

export const ITEMS_PER_PAGE = 12;

export type SortOption =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "top-rated"
  | "biggest-discount";

export type ViewMode = "grid" | "list";

export type GraphicsType = "Integrated" | "Dedicated";

export interface ProductFilterState {
  q: string;
  brands: LaptopBrand[];
  categories: LaptopCategory[];
  minPrice?: number;
  maxPrice?: number;
  ram: string[];
  storage: string[];
  processors: string[];
  screens: string[];
  graphics: GraphicsType[];
  rating4Plus: boolean;
  inStockOnly: boolean;
  dealsOnly: boolean;
  sort: SortOption;
  page: number;
  view: ViewMode;
}

export interface ListingRoutePreset {
  fixedBrand?: LaptopBrand;
  dealsOnly?: boolean;
}

export interface FacetOption<T extends string = string> {
  value: T;
  label: string;
  count: number;
}

export interface DerivedFilterFacets {
  priceBounds: {
    min: number;
    max: number;
  };
  brands: FacetOption<LaptopBrand>[];
  categories: FacetOption<LaptopCategory>[];
  ram: FacetOption[];
  storage: FacetOption[];
  processors: FacetOption[];
  screens: FacetOption[];
  graphics: FacetOption<GraphicsType>[];
  rating4PlusCount: number;
  inStockCount: number;
}

export interface FilteredProductsResult {
  items: Product[];
  allMatched: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Extracts normalized RAM capacity tier (e.g. "8GB", "16GB", "32GB", "64GB") from a spec string.
 */
export function extractRamTier(ramSpec: string): string {
  const match = ramSpec.match(/(\d+\s*GB)/i);
  return match ? match[1].replace(/\s+/g, "").toUpperCase() : ramSpec;
}

/**
 * Extracts normalized storage capacity tier (e.g. "256GB", "512GB", "1TB", "2TB") from a spec string.
 */
export function extractStorageTier(storageSpec: string): string {
  const match = storageSpec.match(/(\d+\s*(?:GB|TB))/i);
  return match ? match[1].replace(/\s+/g, "").toUpperCase() : storageSpec;
}

/**
 * Extracts normalized processor family (e.g. "Intel Core i7", "Intel Core Ultra 7", "AMD Ryzen 7")
 * from a detailed processor specification string.
 */
export function extractProcessorFamily(processorSpec: string): string {
  const normalized = processorSpec.trim();

  const coreUltraMatch = normalized.match(/Intel\s+Core\s+Ultra\s+[579]/i);
  if (coreUltraMatch) {
    return coreUltraMatch[0].replace(/\s+/g, " ");
  }

  const coreIMatch = normalized.match(/Intel\s+Core\s+i[3579]/i);
  if (coreIMatch) {
    return coreIMatch[0].replace(/\s+/g, " ");
  }

  const ryzenMatch = normalized.match(/AMD\s+Ryzen\s+[3579]/i);
  if (ryzenMatch) {
    return ryzenMatch[0].replace(/\s+/g, " ");
  }

  return normalized.split("(")[0].trim();
}

/**
 * Extracts normalized screen size class (13", 14", 15.6", 16") from display spec.
 */
export function extractScreenSize(displaySpec: string): string {
  const match = displaySpec.match(/^(\d+(?:\.\d+)?)"/);
  if (!match) return '15.6"';
  const inches = parseFloat(match[1]);
  if (inches < 13.8) return '13" Class';
  if (inches < 15.0) return '14" Class';
  if (inches < 15.9) return '15.6"';
  return '16"';
}

/**
 * Determines whether a GPU specification is "Dedicated" or "Integrated".
 */
export function extractGraphicsType(gpuSpec: string): GraphicsType {
  const lower = gpuSpec.toLowerCase();
  if (
    lower.includes("nvidia") ||
    lower.includes("rtx") ||
    lower.includes("geforce") ||
    lower.includes("radeon rx") ||
    lower.includes("dedicated")
  ) {
    return "Dedicated";
  }
  return "Integrated";
}

/**
 * Sorts memory/storage capacity labels numerically in ascending order (e.g. 8GB -> 16GB -> 32GB -> 1TB).
 */
function capacityToMegabytes(label: string): number {
  const match = label.match(/^(\d+)(GB|TB)$/i);
  if (!match) return 0;
  const num = parseInt(match[1], 10);
  const unit = match[2].toUpperCase();
  return unit === "TB" ? num * 1024 * 1024 : num * 1024;
}

const CATEGORY_LABELS: Record<LaptopCategory, string> = {
  budget: "Budget",
  business: "Business",
  gaming: "Gaming",
  student: "Student",
  ultrabook: "Ultrabook",
};

/**
 * Derives all filter facets, price bounds, and product counts from a base product list.
 */
export function deriveFilterFacets(
  products: Product[] = PRODUCTS,
  preset?: ListingRoutePreset
): DerivedFilterFacets {
  const scoped = products.filter((p) => {
    if (preset?.fixedBrand && p.brand !== preset.fixedBrand) return false;
    if (preset?.dealsOnly && (!p.oldPrice || p.oldPrice <= p.price))
      return false;
    return true;
  });

  const prices = scoped.map((p) => p.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 3000;

  const brandCounts = new Map<LaptopBrand, number>([
    ["HP", 0],
    ["Dell", 0],
  ]);
  const categoryCounts = new Map<LaptopCategory, number>([
    ["budget", 0],
    ["business", 0],
    ["gaming", 0],
    ["student", 0],
    ["ultrabook", 0],
  ]);
  const ramCounts = new Map<string, number>();
  const storageCounts = new Map<string, number>();
  const processorCounts = new Map<string, number>();
  const screenCounts = new Map<string, number>();
  const graphicsCounts = new Map<GraphicsType, number>([
    ["Integrated", 0],
    ["Dedicated", 0],
  ]);

  let rating4PlusCount = 0;
  let inStockCount = 0;

  for (const product of scoped) {
    brandCounts.set(product.brand, (brandCounts.get(product.brand) ?? 0) + 1);
    categoryCounts.set(
      product.category,
      (categoryCounts.get(product.category) ?? 0) + 1
    );

    const ramTier = extractRamTier(product.specs.ram);
    ramCounts.set(ramTier, (ramCounts.get(ramTier) ?? 0) + 1);

    const storageTier = extractStorageTier(product.specs.storage);
    storageCounts.set(storageTier, (storageCounts.get(storageTier) ?? 0) + 1);

    const cpuFamily = extractProcessorFamily(product.specs.processor);
    processorCounts.set(cpuFamily, (processorCounts.get(cpuFamily) ?? 0) + 1);

    const screenSize = extractScreenSize(product.specs.display);
    screenCounts.set(screenSize, (screenCounts.get(screenSize) ?? 0) + 1);

    const gpuType = extractGraphicsType(product.specs.gpu);
    graphicsCounts.set(gpuType, (graphicsCounts.get(gpuType) ?? 0) + 1);

    if (product.rating >= 4) rating4PlusCount += 1;
    if (product.stock > 0) inStockCount += 1;
  }

  return {
    priceBounds: { min: minPrice, max: maxPrice },
    brands: (["HP", "Dell"] as LaptopBrand[]).map((brand) => ({
      value: brand,
      label: brand,
      count: brandCounts.get(brand) ?? 0,
    })),
    categories: (Object.keys(CATEGORY_LABELS) as LaptopCategory[]).map(
      (cat) => ({
        value: cat,
        label: CATEGORY_LABELS[cat],
        count: categoryCounts.get(cat) ?? 0,
      })
    ),
    ram: Array.from(ramCounts.entries())
      .sort(([a], [b]) => capacityToMegabytes(a) - capacityToMegabytes(b))
      .map(([value, count]) => ({ value, label: value, count })),
    storage: Array.from(storageCounts.entries())
      .sort(([a], [b]) => capacityToMegabytes(a) - capacityToMegabytes(b))
      .map(([value, count]) => ({ value, label: value, count })),
    processors: Array.from(processorCounts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, count]) => ({ value, label: value, count })),
    screens: Array.from(screenCounts.entries())
      .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
      .map(([value, count]) => ({ value, label: value, count })),
    graphics: (["Integrated", "Dedicated"] as GraphicsType[]).map((g) => ({
      value: g,
      label: `${g} Graphics`,
      count: graphicsCounts.get(g) ?? 0,
    })),
    rating4PlusCount,
    inStockCount,
  };
}

/**
 * Case-insensitive, partial-match tolerant search across product name, brand,
 * processor, category, and tags.
 */
export function matchesSearchQuery(product: Product, rawQuery: string): boolean {
  const cleaned = rawQuery.trim().toLowerCase();
  if (!cleaned) return true;

  const searchableText = [
    product.name,
    product.brand,
    product.category,
    product.specs.processor,
    product.specs.gpu,
    product.specs.ram,
    product.specs.storage,
    ...product.tags,
  ]
    .join(" ")
    .toLowerCase();

  // Support multi-token queries (e.g., "hp i7" or "dell oled")
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  return tokens.every((token) => searchableText.includes(token));
}

/**
 * Computes a search relevance score when a search query is present.
 */
function computeSearchScore(product: Product, rawQuery: string): number {
  const cleaned = rawQuery.trim().toLowerCase();
  if (!cleaned) return 0;

  let score = 0;
  const nameLower = product.name.toLowerCase();
  const brandLower = product.brand.toLowerCase();
  const cpuLower = product.specs.processor.toLowerCase();

  if (nameLower.includes(cleaned)) score += 10;
  if (brandLower === cleaned) score += 8;
  if (cpuLower.includes(cleaned)) score += 6;
  if (product.tags.some((t) => t.toLowerCase().includes(cleaned))) score += 4;

  const tokens = cleaned.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    if (nameLower.includes(token)) score += 3;
    if (cpuLower.includes(token)) score += 2;
  }

  return score;
}

/**
 * Returns top N matching products for the live header search autocomplete dropdown.
 */
export function getSearchSuggestions(
  query: string,
  products: Product[] = PRODUCTS,
  limit = 5
): Product[] {
  const cleaned = query.trim();
  if (!cleaned) return [];

  return products
    .filter((product) => matchesSearchQuery(product, cleaned))
    .sort((a, b) => computeSearchScore(b, cleaned) - computeSearchScore(a, cleaned))
    .slice(0, limit);
}

/**
 * Parses URL search parameters into a clean, validated ProductFilterState.
 */
export function parseFilterParams(
  rawParams: Record<string, string | string[] | undefined> | URLSearchParams,
  preset?: ListingRoutePreset
): ProductFilterState {
  const getString = (key: string): string => {
    if (rawParams instanceof URLSearchParams) {
      return rawParams.get(key) ?? "";
    }
    const val = rawParams[key];
    if (Array.isArray(val)) return val[0] ?? "";
    return val ?? "";
  };

  const getList = (key: string): string[] => {
    const raw = getString(key);
    if (!raw) return [];
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const validBrands: LaptopBrand[] = ["HP", "Dell"];
  const parsedBrands = preset?.fixedBrand
    ? [preset.fixedBrand]
    : (getList("brand").filter((b): b is LaptopBrand =>
        validBrands.includes(b as LaptopBrand)
      ) as LaptopBrand[]);

  const validCategories: LaptopCategory[] = [
    "budget",
    "business",
    "gaming",
    "student",
    "ultrabook",
  ];
  const parsedCategories = getList("category")
    .map((c) => c.toLowerCase())
    .filter((c): c is LaptopCategory =>
      validCategories.includes(c as LaptopCategory)
    );

  const minPriceNum = Number(getString("minPrice"));
  const maxPriceNum = Number(getString("maxPrice"));

  const validGraphics: GraphicsType[] = ["Integrated", "Dedicated"];
  const parsedGraphics = getList("graphics").filter((g): g is GraphicsType =>
    validGraphics.includes(g as GraphicsType)
  );

  const validSorts: SortOption[] = [
    "relevance",
    "price-asc",
    "price-desc",
    "newest",
    "top-rated",
    "biggest-discount",
  ];
  const rawSort = getString("sort") as SortOption;
  const sort: SortOption = validSorts.includes(rawSort)
    ? rawSort
    : preset?.dealsOnly
      ? "biggest-discount"
      : "relevance";

  const rawPage = parseInt(getString("page"), 10);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

  const rawView = getString("view");
  const view: ViewMode = rawView === "list" ? "list" : "grid";

  return {
    q: getString("q").trim(),
    brands: parsedBrands,
    categories: parsedCategories,
    minPrice:
      getString("minPrice") !== "" && Number.isFinite(minPriceNum)
        ? minPriceNum
        : undefined,
    maxPrice:
      getString("maxPrice") !== "" && Number.isFinite(maxPriceNum)
        ? maxPriceNum
        : undefined,
    ram: getList("ram"),
    storage: getList("storage"),
    processors: getList("processor"),
    screens: getList("screen"),
    graphics: parsedGraphics,
    rating4Plus: getString("rating") === "4",
    inStockOnly: getString("inStock") === "true",
    dealsOnly: Boolean(preset?.dealsOnly || getString("deals") === "true"),
    sort,
    page,
    view,
  };
}

/**
 * Pure filtering, sorting, and pagination function for products.
 */
export function filterAndSortProducts(
  products: Product[],
  filters: ProductFilterState
): FilteredProductsResult {
  // 1. Filter
  const matched = products.filter((product) => {
    // Deals filter
    if (filters.dealsOnly) {
      if (!product.oldPrice || product.oldPrice <= product.price) {
        return false;
      }
    }

    // Search query
    if (filters.q && !matchesSearchQuery(product, filters.q)) {
      return false;
    }

    // Brand
    if (
      filters.brands.length > 0 &&
      !filters.brands.includes(product.brand)
    ) {
      return false;
    }

    // Category
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(product.category)
    ) {
      return false;
    }

    // Price range
    if (filters.minPrice !== undefined && product.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
      return false;
    }

    // RAM
    if (filters.ram.length > 0) {
      const productRam = extractRamTier(product.specs.ram);
      if (!filters.ram.includes(productRam)) {
        return false;
      }
    }

    // Storage
    if (filters.storage.length > 0) {
      const productStorage = extractStorageTier(product.specs.storage);
      if (!filters.storage.includes(productStorage)) {
        return false;
      }
    }

    // Processor
    if (filters.processors.length > 0) {
      const cpuFamily = extractProcessorFamily(product.specs.processor);
      if (!filters.processors.includes(cpuFamily)) {
        return false;
      }
    }

    // Screen size
    if (filters.screens.length > 0) {
      const screenSize = extractScreenSize(product.specs.display);
      if (!filters.screens.includes(screenSize)) {
        return false;
      }
    }

    // Graphics
    if (filters.graphics.length > 0) {
      const gpuType = extractGraphicsType(product.specs.gpu);
      if (!filters.graphics.includes(gpuType)) {
        return false;
      }
    }

    // Rating 4+
    if (filters.rating4Plus && product.rating < 4) {
      return false;
    }

    // In stock only
    if (filters.inStockOnly && product.stock <= 0) {
      return false;
    }

    return true;
  });

  // 2. Sort
  const sorted = [...matched].sort((a, b) => {
    switch (filters.sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "top-rated":
        return b.rating - a.rating || b.reviewCount - a.reviewCount;
      case "newest": {
        const aNew = a.tags.includes("new-arrival") ? 1 : 0;
        const bNew = b.tags.includes("new-arrival") ? 1 : 0;
        if (bNew !== aNew) return bNew - aNew;
        return b.id.localeCompare(a.id);
      }
      case "biggest-discount": {
        const aDisc = calculateDiscountPercentage(a.price, a.oldPrice) ?? 0;
        const bDisc = calculateDiscountPercentage(b.price, b.oldPrice) ?? 0;
        if (bDisc !== aDisc) return bDisc - aDisc;
        const aSavings = (a.oldPrice ?? a.price) - a.price;
        const bSavings = (b.oldPrice ?? b.price) - b.price;
        return bSavings - aSavings;
      }
      case "relevance":
      default: {
        if (filters.q) {
          const scoreDiff =
            computeSearchScore(b, filters.q) -
            computeSearchScore(a, filters.q);
          if (scoreDiff !== 0) return scoreDiff;
        }
        const aBest = a.tags.includes("best-seller") ? 1 : 0;
        const bBest = b.tags.includes("best-seller") ? 1 : 0;
        if (bBest !== aBest) return bBest - aBest;
        return b.rating - a.rating;
      }
    }
  });

  // 3. Paginate
  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, filters.page), totalPages);
  const startIndex =
    totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);
  const items = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return {
    items,
    allMatched: sorted,
    totalCount,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
  };
}
