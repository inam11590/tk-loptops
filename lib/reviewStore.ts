import { PRODUCTS as SEED_PRODUCTS } from "@/data/products";
import { getReviewsForProduct as getSeedReviewsForProduct } from "@/data/reviews";
import {
  getProductBySlugFromStore,
  updateProductRatingStats,
} from "@/lib/productStore";
import type {
  Product,
  ProductReview,
  ReviewModerationStatus,
} from "@/types/product";

export interface ReviewRecord extends ProductReview {
  productId: string;
  productSlug: string;
  productName: string;
  status: ReviewModerationStatus;
  createdAt: string;
}

const globalForReviews = globalThis as unknown as {
  __tkReviewsCache?: ReviewRecord[];
};

function buildInitialSeedReviews(): ReviewRecord[] {
  const seeded: ReviewRecord[] = [];

  // Seed approved reviews for the main products + 3 realistic Pending reviews for admin moderation
  for (const product of SEED_PRODUCTS.slice(0, 6)) {
    const productReviews = getSeedReviewsForProduct(product);
    for (const rev of productReviews.slice(0, 4)) {
      seeded.push({
        ...rev,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        email: `${rev.author.toLowerCase().replace(/[^a-z0-9]/g, ".")}@example.com`,
        status: "Approved",
        createdAt: `${rev.isoDate}T12:00:00.000Z`,
      });
    }
  }

  // Add Pending reviews so the admin dashboard & /admin/reviews have actionable pending items
  const pendingSeeds: ReviewRecord[] = [
    {
      id: "rev-pending-1",
      productId: "hp-01",
      productSlug: "hp-spectre-x360-14-oled",
      productName: "HP Spectre x360 14 2-in-1 OLED",
      author: "Daniel Kim",
      email: "daniel.kim@example.com",
      avatar: "/images/avatars/avatar-1.svg",
      date: "October 6, 2026",
      isoDate: "2026-10-06",
      verifiedPurchase: true,
      rating: 5,
      title: "Best 2-in-1 OLED laptop I have ever owned",
      text: "The 2.8K 120Hz OLED touchscreen is breathtaking and the haptic touchpad feels just as good as any flagship notebook. Battery easily lasts 10 hours on balanced mode.",
      status: "Pending",
      createdAt: "2026-10-06T16:30:00.000Z",
    },
    {
      id: "rev-pending-2",
      productId: "dell-01",
      productSlug: "dell-xps-14-9440-oled",
      productName: "Dell XPS 14 9440 OLED Ultrabook",
      author: "Nadia Al-Farsi",
      email: "nadia.alfarsi@example.com",
      avatar: "/images/avatars/avatar-2.svg",
      date: "October 6, 2026",
      isoDate: "2026-10-06",
      verifiedPurchase: true,
      rating: 4,
      title: "Machined aluminum perfection with RTX 4050",
      text: "Gorgeous CNC chassis and edge-to-edge InfinityEdge OLED screen. Takes a day to get used to the capacitive function row, but performance in DaVinci Resolve is stellar.",
      status: "Pending",
      createdAt: "2026-10-06T19:15:00.000Z",
    },
    {
      id: "rev-pending-3",
      productId: "hp-03",
      productSlug: "hp-omen-transcend-14-rtx4070",
      productName: "HP OMEN Transcend 14 Gaming OLED",
      author: "Tariq Mahmood",
      email: "tariq.m@example.com",
      avatar: "/images/avatars/avatar-3.svg",
      date: "October 7, 2026",
      isoDate: "2026-10-07",
      verifiedPurchase: true,
      rating: 5,
      title: "Runs Cyberpunk at ultra settings while weighing only 3.6 lbs",
      text: "Fast express delivery from TK Laptop and 100% genuine HP warranty. The HyperX audio and lattice-less RGB keyboard make this the ultimate portable gaming laptop.",
      status: "Pending",
      createdAt: "2026-10-07T06:40:00.000Z",
    },
  ];

  return [...pendingSeeds, ...seeded];
}

function readReviewsFromStore(): ReviewRecord[] {
  if (typeof window === "undefined") {
    try {
      const nodeRequire = eval("require") as NodeRequire;
      const fs = nodeRequire("fs") as typeof import("fs");
      const path = nodeRequire("path") as typeof import("path");
      const dataDir = path.join(process.cwd(), ".data");
      const reviewsFile = path.join(dataDir, "reviews.json");

      if (fs.existsSync(reviewsFile)) {
        const raw = fs.readFileSync(reviewsFile, "utf8");
        const parsed = JSON.parse(raw) as ReviewRecord[];
        if (Array.isArray(parsed)) {
          globalForReviews.__tkReviewsCache = parsed;
          return parsed;
        }
      }

      const seeded = buildInitialSeedReviews();
      globalForReviews.__tkReviewsCache = seeded;
      try {
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(reviewsFile, JSON.stringify(seeded, null, 2), "utf8");
      } catch {
        // Keep in-memory cache
      }
      return seeded;
    } catch {
      // Fallback to in-memory cache
    }
  }

  if (!globalForReviews.__tkReviewsCache) {
    globalForReviews.__tkReviewsCache = buildInitialSeedReviews();
  }
  return globalForReviews.__tkReviewsCache;
}

function writeReviewsToStore(reviews: ReviewRecord[]): void {
  globalForReviews.__tkReviewsCache = reviews;

  if (typeof window === "undefined") {
    try {
      const nodeRequire = eval("require") as NodeRequire;
      const fs = nodeRequire("fs") as typeof import("fs");
      const path = nodeRequire("path") as typeof import("path");
      const dataDir = path.join(process.cwd(), ".data");
      const reviewsFile = path.join(dataDir, "reviews.json");

      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(reviewsFile, JSON.stringify(reviews, null, 2), "utf8");
    } catch {
      // Keep in-memory cache if disk write is restricted
    }
  }
}

/**
 * Returns all reviews in the store (Pending, Approved, Rejected), sorted newest-first.
 */
export function getAllReviews(options?: {
  status?: ReviewModerationStatus | "all";
  productSlug?: string;
}): ReviewRecord[] {
  const all = readReviewsFromStore().sort(
    (a, b) =>
      new Date(b.createdAt || b.isoDate).getTime() -
      new Date(a.createdAt || a.isoDate).getTime()
  );

  return all.filter((rev) => {
    if (options?.status && options.status !== "all" && rev.status !== options.status) {
      return false;
    }
    if (
      options?.productSlug &&
      rev.productSlug.toLowerCase() !== options.productSlug.toLowerCase()
    ) {
      return false;
    }
    return true;
  });
}

/**
 * Returns only Approved reviews for a given product on the storefront.
 * If the product was part of the initial catalog and has no explicit reviews in the store yet,
 * returns its approved template reviews merged with any approved custom reviews.
 */
export function getApprovedReviewsForProduct(product: Product): ProductReview[] {
  const allForProduct = readReviewsFromStore().filter(
    (r) =>
      r.productSlug.toLowerCase() === product.slug.toLowerCase() ||
      r.productId === product.id
  );

  if (allForProduct.length > 0) {
    return allForProduct
      .filter((r) => r.status === "Approved")
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.isoDate).getTime() -
          new Date(a.createdAt || a.isoDate).getTime()
      );
  }

  return getSeedReviewsForProduct(product).map((r) => ({
    ...r,
    productId: product.id,
    productName: product.name,
    status: "Approved" as const,
  }));
}

/**
 * Recomputes a product's average `rating` and `reviewCount` from its Approved reviews
 * and updates `/lib/productStore.ts`.
 */
export function recomputeProductRatingFromReviews(
  productSlug: string
): { rating: number; reviewCount: number } | null {
  const product = getProductBySlugFromStore(productSlug, {
    includeDrafts: true,
  });
  if (!product) return null;

  const approved = getAllReviews({
    status: "Approved",
    productSlug: product.slug,
  });

  if (approved.length === 0) {
    return { rating: product.rating, reviewCount: 0 };
  }

  const totalStars = approved.reduce((sum, r) => sum + r.rating, 0);
  const average = Math.round((totalStars / approved.length) * 10) / 10;

  updateProductRatingStats(product.slug, average, approved.length);
  return { rating: average, reviewCount: approved.length };
}

/**
 * Saves a newly submitted customer review with status `"Pending"` for admin moderation.
 */
export function createPendingReview(input: {
  productSlug: string;
  productName?: string;
  author: string;
  email: string;
  rating: number;
  title: string;
  text: string;
}): ReviewRecord {
  const product = getProductBySlugFromStore(input.productSlug, {
    includeDrafts: true,
  });
  const now = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(now);

  const created: ReviewRecord = {
    id: `rev-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    productId: product?.id ?? input.productSlug,
    productSlug: product?.slug ?? input.productSlug,
    productName: product?.name ?? input.productName ?? input.productSlug,
    author: input.author.trim(),
    email: input.email.trim().toLowerCase(),
    avatar: "/images/avatars/avatar-1.svg",
    date: formattedDate,
    isoDate: now.toISOString().slice(0, 10),
    verifiedPurchase: true,
    rating: Math.max(1, Math.min(5, Math.round(input.rating))),
    title: input.title.trim(),
    text: input.text.trim(),
    status: "Pending",
    createdAt: now.toISOString(),
  };

  const existing = readReviewsFromStore();
  writeReviewsToStore([created, ...existing]);
  return created;
}

/**
 * Updates the status (`Approved` | `Rejected` | `Pending`) of one or more reviews
 * and recomputes the affected products' average ratings.
 */
export function bulkUpdateReviewStatus(
  reviewIds: string[],
  status: ReviewModerationStatus
): { updatedCount: number; affectedProductSlugs: string[] } {
  const idSet = new Set(reviewIds);
  if (idSet.size === 0) {
    return { updatedCount: 0, affectedProductSlugs: [] };
  }

  const existing = readReviewsFromStore();
  let updatedCount = 0;
  const affectedSlugs = new Set<string>();

  const next = existing.map((rev) => {
    if (!idSet.has(rev.id)) return rev;
    updatedCount += 1;
    affectedSlugs.add(rev.productSlug);
    return {
      ...rev,
      status,
    };
  });

  if (updatedCount > 0) {
    writeReviewsToStore(next);
    for (const slug of affectedSlugs) {
      recomputeProductRatingFromReviews(slug);
    }
  }

  return {
    updatedCount,
    affectedProductSlugs: Array.from(affectedSlugs),
  };
}

/**
 * Deletes a review by ID and recomputes the product's rating.
 */
export function deleteReviewById(reviewId: string): ReviewRecord | null {
  const existing = readReviewsFromStore();
  const target = existing.find((r) => r.id === reviewId);
  if (!target) return null;

  const filtered = existing.filter((r) => r.id !== reviewId);
  writeReviewsToStore(filtered);
  recomputeProductRatingFromReviews(target.productSlug);
  return target;
}
