import { calculateDiscountPercentage } from "@/lib/config";
import { getPublishedProducts } from "@/lib/productStore";
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
  products: Product[] = getPublishedProducts(),
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
  products: Product[] = getPublishedProducts(),
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

const SLUG_ALIASES: Record<string, string> = {
  "hp-pavilion-15": "hp-pavilion-plus-14",
};

/**
 * Finds a single product by slug (or known alias).
 */
export function getProductBySlug(
  slug: string,
  products: Product[] = getPublishedProducts()
): Product | undefined {
  const normalized = slug.trim().toLowerCase();
  const targetSlug = SLUG_ALIASES[normalized] ?? normalized;
  return products.find((p) => p.slug.toLowerCase() === targetSlug);
}

/**
 * Returns N similar laptops (prioritizing same category, then same brand, closest price)
 * for the "Compare with similar laptops" table.
 */
export function getSimilarProductsForComparison(
  product: Product,
  products: Product[] = getPublishedProducts(),
  count = 2
): Product[] {
  return products
    .filter((p) => p.id !== product.id)
    .sort((a, b) => {
      const aScore =
        (a.category === product.category ? 4 : 0) +
        (a.brand === product.brand ? 2 : 0) -
        Math.abs(a.price - product.price) / 1000;
      const bScore =
        (b.category === product.category ? 4 : 0) +
        (b.brand === product.brand ? 2 : 0) -
        Math.abs(b.price - product.price) / 1000;
      return bScore - aScore;
    })
    .slice(0, count);
}

/**
 * Returns 4 to 6 related laptops (same category or brand) for the Related Products carousel.
 */
export function getRelatedProducts(
  product: Product,
  products: Product[] = getPublishedProducts(),
  limit = 6
): Product[] {
  return products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category || p.brand === product.brand)
    )
    .sort((a, b) => {
      const aSameCat = a.category === product.category ? 1 : 0;
      const bSameCat = b.category === product.category ? 1 : 0;
      if (bSameCat !== aSameCat) return bSameCat - aSameCat;
      return b.rating - a.rating;
    })
    .slice(0, limit);
}

export interface SpecGroup {
  groupTitle: string;
  rows: { label: string; value: string }[];
}

/**
 * Builds the 8 grouped specification sections required by the Specifications tab:
 * Performance, Display, Memory and Storage, Graphics, Battery,
 * Connectivity and Ports, Physical, and Software.
 */
export function getGroupedSpecsForProduct(product: Product): SpecGroup[] {
  const { specs, brand, category } = product;
  const gpuType = extractGraphicsType(specs.gpu);
  const screenSize = extractScreenSize(specs.display);

  const isGaming = category === "gaming";
  const isBusiness = category === "business" || category === "ultrabook";

  return [
    {
      groupTitle: "Performance",
      rows: [
        { label: "Processor", value: specs.processor },
        {
          label: "Architecture & Cache",
          value: specs.processor.includes("Ultra")
            ? "Intel Meteor Lake with Integrated AI NPU (Up to 24MB L3 Cache)"
            : specs.processor.includes("Ryzen")
              ? "AMD Zen 4 Architecture with Ryzen AI Engine (Up to 16MB L3 Cache)"
              : "Multi-Core Hybrid Performance Architecture (Up to 24MB Smart Cache)",
        },
        {
          label: "Thermal Solution",
          value: isGaming
            ? brand === "HP"
              ? "OMEN Tempest Cooling with Dual 12V Fans & Vapor Chamber"
              : "Alienware Cryo-Tech™ Quad-Fan Thermal Architecture"
            : "Whisper-Quiet Dual Heat-Pipe Adaptive Thermal System",
        },
      ],
    },
    {
      groupTitle: "Display",
      rows: [
        { label: "Panel Specification", value: specs.display },
        { label: "Screen Size Class", value: screenSize },
        {
          label: "Color Gamut & Brightness",
          value: specs.display.includes("OLED")
            ? "100% DCI-P3, VESA DisplayHDR TrueBlack 500, 500 nits Peak"
            : isGaming
              ? "100% sRGB, NVIDIA G-SYNC / Adaptive-Sync, 350 nits"
              : "100% sRGB Low Blue Light Eye-Safe Certified",
        },
      ],
    },
    {
      groupTitle: "Memory and Storage",
      rows: [
        { label: "System Memory (RAM)", value: specs.ram },
        { label: "Primary SSD Storage", value: specs.storage },
        {
          label: "Storage Interface",
          value: "M.2 2280 PCIe Gen4 x4 NVMe Solid State Drive",
        },
      ],
    },
    {
      groupTitle: "Graphics",
      rows: [
        { label: "Graphics Processor (GPU)", value: specs.gpu },
        { label: "Graphics Type", value: `${gpuType} Graphics` },
        {
          label: "External Display Support",
          value: "Supports up to 3 external 4K@60Hz displays via Thunderbolt / HDMI 2.1",
        },
      ],
    },
    {
      groupTitle: "Battery",
      rows: [
        { label: "Battery Capacity & Life", value: specs.battery },
        {
          label: "Power Adapter",
          value:
            specs.chargerWattage ??
            (isGaming
              ? "240W Slim Gallium-Nitride (GaN) AC Power Adapter"
              : "65W / 100W USB Type-C Fast Charge Power Adapter"),
        },
        {
          label: "Fast Charge Technology",
          value: "0% to 50% charge in approximately 30 minutes",
        },
      ],
    },
    {
      groupTitle: "Connectivity and Ports",
      rows: [
        {
          label: "External I/O Ports",
          value:
            specs.ports ??
            (isGaming
              ? "2x Thunderbolt 4 / USB4 Type-C, 2x USB 3.2 Gen 1 Type-A, 1x HDMI 2.1, 1x RJ-45 Gigabit Ethernet, 1x 3.5mm Audio Combo"
              : "2x Thunderbolt 4 (USB4 Type-C Power Delivery & DisplayPort 2.1), 1x USB 3.2 Type-A, 1x HDMI 2.1, 1x 3.5mm Headphone/Mic Combo"),
        },
        {
          label: "Wireless & Bluetooth",
          value:
            specs.wireless ??
            (isBusiness || isGaming
              ? "Intel Wi-Fi 7 BE200 (2x2) + Bluetooth 5.4 Wireless Card"
              : "Wi-Fi 6E (802.11ax 2x2) + Bluetooth 5.3"),
        },
        {
          label: "Webcam & Microphones",
          value:
            specs.webcam ??
            "1080p FHD IR Windows Hello Camera with Privacy Shutter & Dual-Array AI Noise-Canceling Mics",
        },
      ],
    },
    {
      groupTitle: "Physical",
      rows: [
        { label: "Starting Weight", value: specs.weight },
        {
          label: "Chassis Material",
          value:
            specs.chassisMaterial ??
            (isBusiness || isGaming
              ? "CNC-Machined Recycled Aluminum & Magnesium Alloy"
              : "Anodized Aluminum Top Cover & Precision Polycarbonate Deck"),
        },
        {
          label: "Keyboard & Touchpad",
          value:
            specs.keyboard ??
            (isGaming
              ? "Per-Key / 4-Zone RGB Backlit Anti-Ghosting Keyboard + Precision Mylar Touchpad"
              : "Spill-Resistant Multi-Level Backlit Keyboard + Precision Glass Touchpad"),
        },
        {
          label: "Audio System",
          value:
            specs.audio ??
            (brand === "HP"
              ? "Poly Studio / Bang & Olufsen Quad Speakers with Discrete Smart Amp"
              : "Dolby Atmos Spatial Audio Speakers with Waves MaxxAudio Pro"),
        },
      ],
    },
    {
      groupTitle: "Software",
      rows: [
        { label: "Operating System", value: specs.os },
        {
          label: "Security Features",
          value:
            specs.security ??
            (brand === "HP"
              ? "TPM 2.0 Embedded Security Chip, Windows Hello IR / Fingerprint Reader, HP Wolf Security"
              : "TPM 2.0 FIPS-140-2 Certified, Windows Hello Biometrics, Dell SafeBIOS"),
        },
        {
          label: "Warranty Coverage",
          value:
            specs.warranty ??
            "1-Year Official TK Laptop Hardware Warranty + Manufacturer Serial Coverage",
        },
      ],
    },
  ];
}

