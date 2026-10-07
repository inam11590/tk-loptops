import { PRODUCTS as SEED_PRODUCTS } from "@/data/products";
import { getSettings } from "@/lib/config";
import type {
  LaptopBrand,
  LaptopCategory,
  Product,
  ProductPublishStatus,
  ProductSpecs,
} from "@/types/product";

export interface ProductMutationInput {
  name: string;
  slug?: string;
  sku?: string;
  brand: LaptopBrand;
  category: LaptopCategory;
  price: number;
  oldPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  status?: ProductPublishStatus;
  shortDescription?: string;
  description: string;
  highlights?: string[];
  images: string[];
  tags: string[];
  specs: ProductSpecs;
  seoTitle?: string;
  seoDescription?: string;
}

const SLUG_ALIASES: Record<string, string> = {
  "hp-pavilion-15": "hp-pavilion-plus-14",
};

const globalForProductStore = globalThis as unknown as {
  __tkProductsCache?: Product[];
};

export function generateProductSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeProductRecord(product: Product, index = 0): Product {
  const defaultLowStock = getSettings().shipping.lowStockThreshold || 5;
  const fallbackCreated = new Date(
    Date.UTC(2026, 8, Math.max(1, 28 - index), 10, 0, 0)
  ).toISOString();

  return {
    ...product,
    sku:
      product.sku ||
      `TK-${product.brand.toUpperCase()}-${product.id.toUpperCase()}`,
    status: product.status === "draft" ? "draft" : "published",
    lowStockThreshold:
      typeof product.lowStockThreshold === "number"
        ? product.lowStockThreshold
        : defaultLowStock,
    shortDescription:
      product.shortDescription ||
      (product.highlights && product.highlights.length > 0
        ? product.highlights.join(" • ")
        : `${product.specs.processor} • ${product.specs.ram} • ${product.specs.storage}`),
    seoTitle:
      product.seoTitle ||
      `${product.name} (${product.specs.processor}, ${product.specs.ram})`,
    seoDescription: product.seoDescription || product.description,
    createdAt: product.createdAt || fallbackCreated,
    updatedAt: product.updatedAt || fallbackCreated,
  };
}

function readProductsFromStore(): Product[] {
  if (typeof window === "undefined") {
    try {
      const nodeRequire = eval("require") as NodeRequire;
      const fs = nodeRequire("fs") as typeof import("fs");
      const path = nodeRequire("path") as typeof import("path");
      const dataDir = path.join(process.cwd(), ".data");
      const productsFile = path.join(dataDir, "products.json");

      if (fs.existsSync(productsFile)) {
        const raw = fs.readFileSync(productsFile, "utf8");
        const parsed = JSON.parse(raw) as Product[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed.map((p, idx) =>
            normalizeProductRecord(p, idx)
          );
          globalForProductStore.__tkProductsCache = normalized;
          return normalized;
        }
      }

      const seeded = SEED_PRODUCTS.map((p, idx) =>
        normalizeProductRecord(p, idx)
      );
      globalForProductStore.__tkProductsCache = seeded;
      try {
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(productsFile, JSON.stringify(seeded, null, 2), "utf8");
      } catch {
        // Keep in-memory cache if filesystem is read-only
      }
      return seeded;
    } catch {
      // Fallback to in-memory cache
    }
  }

  if (!globalForProductStore.__tkProductsCache) {
    globalForProductStore.__tkProductsCache = SEED_PRODUCTS.map((p, idx) =>
      normalizeProductRecord(p, idx)
    );
  }
  return globalForProductStore.__tkProductsCache;
}

function writeProductsToStore(products: Product[]): void {
  const normalized = products.map((p, idx) => normalizeProductRecord(p, idx));
  globalForProductStore.__tkProductsCache = normalized;

  if (typeof window === "undefined") {
    try {
      const nodeRequire = eval("require") as NodeRequire;
      const fs = nodeRequire("fs") as typeof import("fs");
      const path = nodeRequire("path") as typeof import("path");
      const dataDir = path.join(process.cwd(), ".data");
      const productsFile = path.join(dataDir, "products.json");

      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(
        productsFile,
        JSON.stringify(normalized, null, 2),
        "utf8"
      );
    } catch {
      // Keep in-memory cache if disk write is restricted
    }
  }
}

/**
 * Hydrates the runtime product cache on the client from Server Component props.
 */
export function setRuntimeProducts(products: Product[]): void {
  globalForProductStore.__tkProductsCache = products.map((p, idx) =>
    normalizeProductRecord(p, idx)
  );
}

/**
 * Returns all products from the product store (including drafts when `includeDrafts: true`).
 */
export function getAllProducts(options?: { includeDrafts?: boolean }): Product[] {
  const all = readProductsFromStore();
  if (options?.includeDrafts) {
    return all;
  }
  return all.filter((p) => p.status !== "draft");
}

/**
 * Returns only published products for the storefront.
 */
export function getPublishedProducts(): Product[] {
  return getAllProducts({ includeDrafts: false });
}

/**
 * Finds a single product by ID (includes drafts for admin).
 */
export function getProductById(
  id: string,
  options?: { includeDrafts?: boolean }
): Product | null {
  const trimmed = id.trim();
  if (!trimmed) return null;
  const list = getAllProducts({ includeDrafts: options?.includeDrafts ?? true });
  return list.find((p) => p.id === trimmed) ?? null;
}

/**
 * Finds a single product by slug (or known alias). Defaults to published products only.
 */
export function getProductBySlugFromStore(
  slug: string,
  options?: { includeDrafts?: boolean }
): Product | undefined {
  const normalized = slug.trim().toLowerCase();
  const targetSlug = SLUG_ALIASES[normalized] ?? normalized;
  const list = getAllProducts({
    includeDrafts: options?.includeDrafts ?? false,
  });
  return list.find((p) => p.slug.toLowerCase() === targetSlug);
}

/**
 * Ensures a unique slug across the product catalog.
 */
function ensureUniqueSlug(
  desiredSlug: string,
  existingProducts: Product[],
  excludeId?: string
): string {
  const base = generateProductSlug(desiredSlug) || `laptop-${Date.now()}`;
  let candidate = base;
  let counter = 2;

  while (
    existingProducts.some(
      (p) => p.id !== excludeId && p.slug.toLowerCase() === candidate.toLowerCase()
    )
  ) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  return candidate;
}

/**
 * Creates a new product in `.data/products.json`.
 */
export function createProduct(input: ProductMutationInput): Product {
  const existing = readProductsFromStore();
  const prefix = input.brand.toLowerCase();
  const id = `${prefix}-${Date.now().toString(36)}`;
  const slug = ensureUniqueSlug(input.slug || input.name, existing);
  const now = new Date().toISOString();

  const highlights =
    input.highlights && input.highlights.length > 0
      ? input.highlights
      : input.shortDescription
      ? input.shortDescription
          .split(/\n|•/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [
          input.specs.processor,
          `${input.specs.ram} & ${input.specs.storage}`,
          input.specs.display,
        ];

  const created: Product = normalizeProductRecord({
    id,
    sku:
      input.sku?.trim() ||
      `TK-${input.brand.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    slug,
    name: input.name.trim(),
    brand: input.brand,
    category: input.category,
    price: Math.max(1, Math.round(input.price)),
    oldPrice:
      input.oldPrice && input.oldPrice > input.price
        ? Math.round(input.oldPrice)
        : undefined,
    images:
      input.images.length > 0
        ? input.images
        : [
            input.brand === "HP"
              ? "/images/laptops/hp-business.svg"
              : "/images/laptops/dell-business.svg",
          ],
    rating: 4.8,
    reviewCount: 8,
    stock: Math.max(0, Math.floor(input.stock)),
    lowStockThreshold:
      typeof input.lowStockThreshold === "number"
        ? Math.max(1, Math.floor(input.lowStockThreshold))
        : 5,
    status: input.status === "draft" ? "draft" : "published",
    shortDescription: input.shortDescription?.trim() || highlights.join(" • "),
    specs: input.specs,
    tags: input.tags,
    description: input.description.trim(),
    highlights,
    seoTitle: input.seoTitle?.trim() || input.name.trim(),
    seoDescription: input.seoDescription?.trim() || input.description.trim(),
    createdAt: now,
    updatedAt: now,
  });

  writeProductsToStore([created, ...existing]);
  return created;
}

/**
 * Updates an existing product by ID in `.data/products.json`.
 */
export function updateProduct(
  id: string,
  updates: Partial<ProductMutationInput>
): Product | null {
  const existing = readProductsFromStore();
  const idx = existing.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  const current = existing[idx]!;
  const nextName =
    updates.name !== undefined ? updates.name.trim() : current.name;
  const nextSlug =
    updates.slug !== undefined && updates.slug.trim().length > 0
      ? ensureUniqueSlug(updates.slug, existing, id)
      : current.slug;
  const nextPrice =
    updates.price !== undefined
      ? Math.max(1, Math.round(updates.price))
      : current.price;
  const rawOldPrice =
    updates.oldPrice !== undefined ? updates.oldPrice : current.oldPrice;
  const nextOldPrice =
    rawOldPrice && rawOldPrice > nextPrice ? Math.round(rawOldPrice) : undefined;

  const nextSpecs: ProductSpecs = updates.specs
    ? { ...current.specs, ...updates.specs }
    : current.specs;

  const nextShortDesc =
    updates.shortDescription !== undefined
      ? updates.shortDescription.trim()
      : current.shortDescription;

  const nextHighlights =
    updates.highlights !== undefined
      ? updates.highlights
      : nextShortDesc
      ? nextShortDesc
          .split(/\n|•/)
          .map((s) => s.trim())
          .filter(Boolean)
      : current.highlights;

  const updated: Product = normalizeProductRecord({
    ...current,
    name: nextName,
    slug: nextSlug,
    sku: updates.sku !== undefined ? updates.sku.trim() : current.sku,
    brand: updates.brand ?? current.brand,
    category: updates.category ?? current.category,
    price: nextPrice,
    oldPrice: nextOldPrice,
    stock:
      updates.stock !== undefined
        ? Math.max(0, Math.floor(updates.stock))
        : current.stock,
    lowStockThreshold:
      updates.lowStockThreshold !== undefined
        ? Math.max(1, Math.floor(updates.lowStockThreshold))
        : current.lowStockThreshold,
    status: updates.status ?? current.status,
    shortDescription: nextShortDesc,
    description:
      updates.description !== undefined
        ? updates.description.trim()
        : current.description,
    highlights: nextHighlights,
    images:
      updates.images && updates.images.length > 0
        ? updates.images
        : current.images,
    tags: updates.tags !== undefined ? updates.tags : current.tags,
    specs: nextSpecs,
    seoTitle:
      updates.seoTitle !== undefined ? updates.seoTitle.trim() : current.seoTitle,
    seoDescription:
      updates.seoDescription !== undefined
        ? updates.seoDescription.trim()
        : current.seoDescription,
    updatedAt: new Date().toISOString(),
  });

  const nextList = [...existing];
  nextList[idx] = updated;
  writeProductsToStore(nextList);
  return updated;
}

/**
 * Deletes a product by ID.
 */
export function deleteProduct(id: string): Product | null {
  const existing = readProductsFromStore();
  const target = existing.find((p) => p.id === id);
  if (!target) return null;

  const filtered = existing.filter((p) => p.id !== id);
  writeProductsToStore(filtered);
  return target;
}

/**
 * Duplicates an existing product as a Draft with "(Copy)" appended to the name.
 */
export function duplicateProduct(id: string): Product | null {
  const source = getProductById(id, { includeDrafts: true });
  if (!source) return null;

  return createProduct({
    name: `${source.name} (Copy)`,
    slug: `${source.slug}-copy`,
    sku: `${source.sku || "TK"}-COPY`,
    brand: source.brand,
    category: source.category,
    price: source.price,
    oldPrice: source.oldPrice,
    stock: source.stock,
    lowStockThreshold: source.lowStockThreshold,
    status: "draft",
    shortDescription: source.shortDescription,
    description: source.description,
    highlights: source.highlights,
    images: [...source.images],
    tags: [...source.tags],
    specs: { ...source.specs },
    seoTitle: source.seoTitle,
    seoDescription: source.seoDescription,
  });
}

/**
 * Bulk updates multiple products at once (publish, unpublish, delete, or set_category).
 */
export function bulkUpdateProducts(
  ids: string[],
  action: {
    type: "publish" | "unpublish" | "delete" | "set_category";
    category?: LaptopCategory;
  }
): { count: number } {
  const targetSet = new Set(ids);
  if (targetSet.size === 0) return { count: 0 };

  const existing = readProductsFromStore();
  const now = new Date().toISOString();

  if (action.type === "delete") {
    const remaining = existing.filter((p) => !targetSet.has(p.id));
    const count = existing.length - remaining.length;
    if (count > 0) {
      writeProductsToStore(remaining);
    }
    return { count };
  }

  let count = 0;
  const updated = existing.map((product) => {
    if (!targetSet.has(product.id)) return product;
    count += 1;

    if (action.type === "publish") {
      return { ...product, status: "published" as const, updatedAt: now };
    }
    if (action.type === "unpublish") {
      return { ...product, status: "draft" as const, updatedAt: now };
    }
    if (action.type === "set_category" && action.category) {
      return { ...product, category: action.category, updatedAt: now };
    }
    return product;
  });

  if (count > 0) {
    writeProductsToStore(updated);
  }
  return { count };
}

/**
 * Adjusts a product's stock by `delta` (negative to deduct, positive to restore).
 * Never lets stock drop below 0.
 */
export function adjustProductStock(
  productIdOrSlug: string,
  delta: number
): Product | null {
  const existing = readProductsFromStore();
  const idx = existing.findIndex(
    (p) => p.id === productIdOrSlug || p.slug === productIdOrSlug
  );
  if (idx === -1) return null;

  const current = existing[idx]!;
  const nextStock = Math.max(0, current.stock + Math.round(delta));
  const updated: Product = {
    ...current,
    stock: nextStock,
    updatedAt: new Date().toISOString(),
  };

  const nextList = [...existing];
  nextList[idx] = updated;
  writeProductsToStore(nextList);
  return updated;
}

/**
 * Updates a product's average `rating` and `reviewCount` when reviews are approved/rejected.
 */
export function updateProductRatingStats(
  productSlugOrId: string,
  rating: number,
  reviewCount: number
): Product | null {
  const existing = readProductsFromStore();
  const idx = existing.findIndex(
    (p) => p.slug === productSlugOrId || p.id === productSlugOrId
  );
  if (idx === -1) return null;

  const current = existing[idx]!;
  const updated: Product = {
    ...current,
    rating: Math.round(rating * 10) / 10,
    reviewCount: Math.max(0, reviewCount),
    updatedAt: new Date().toISOString(),
  };

  const nextList = [...existing];
  nextList[idx] = updated;
  writeProductsToStore(nextList);
  return updated;
}
