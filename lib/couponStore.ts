import { COUPONS as SEED_COUPONS, type Coupon } from "@/data/coupons";

export interface CouponRecord extends Required<
  Pick<
    Coupon,
    | "id"
    | "code"
    | "description"
    | "discountType"
    | "discountValue"
    | "minOrderAmount"
    | "usedCount"
    | "usedByUser"
    | "startDate"
    | "expiresAt"
    | "isActive"
    | "createdAt"
    | "updatedAt"
  >
> {
  maxDiscountAmount?: number;
  usageLimit?: number;
  perUserLimit?: number;
}

export interface CouponMutationInput {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  startDate?: string;
  expiresAt: string;
  isActive?: boolean;
}

const globalForCoupons = globalThis as unknown as {
  __tkCouponsCache?: CouponRecord[];
};

function normalizeCouponRecord(c: Coupon, index = 0): CouponRecord {
  const now = "2026-09-01T00:00:00.000Z";
  return {
    id: c.id || `cpn-${c.code.toLowerCase()}-${index}`,
    code: c.code.trim().toUpperCase(),
    description: c.description || `${c.discountValue}${c.discountType === "percentage" ? "%" : "$"} promotional discount`,
    discountType: c.discountType === "fixed" ? "fixed" : "percentage",
    discountValue: Number(c.discountValue) || 0,
    minOrderAmount: Math.max(0, Number(c.minOrderAmount) || 0),
    maxDiscountAmount:
      typeof c.maxDiscountAmount === "number" && c.maxDiscountAmount > 0
        ? c.maxDiscountAmount
        : undefined,
    usageLimit:
      typeof c.usageLimit === "number" && c.usageLimit > 0
        ? Math.floor(c.usageLimit)
        : undefined,
    perUserLimit:
      typeof c.perUserLimit === "number" && c.perUserLimit > 0
        ? Math.floor(c.perUserLimit)
        : undefined,
    usedCount: Math.max(0, Math.floor(Number(c.usedCount) || 0)),
    usedByUser:
      c.usedByUser && typeof c.usedByUser === "object" ? c.usedByUser : {},
    startDate: c.startDate || "2026-01-01T00:00:00.000Z",
    expiresAt: c.expiresAt,
    isActive: c.isActive !== undefined ? Boolean(c.isActive) : true,
    createdAt: c.createdAt || now,
    updatedAt: c.updatedAt || now,
  };
}

function readCouponsFromStore(): CouponRecord[] {
  if (typeof window === "undefined") {
    try {
      const nodeRequire = eval("require") as NodeRequire;
      const fs = nodeRequire("fs") as typeof import("fs");
      const path = nodeRequire("path") as typeof import("path");
      const dataDir = path.join(process.cwd(), ".data");
      const couponsFile = path.join(dataDir, "coupons.json");

      if (fs.existsSync(couponsFile)) {
        const raw = fs.readFileSync(couponsFile, "utf8");
        const parsed = JSON.parse(raw) as Coupon[];
        if (Array.isArray(parsed)) {
          const normalized = parsed.map((c, idx) =>
            normalizeCouponRecord(c, idx)
          );
          globalForCoupons.__tkCouponsCache = normalized;
          return normalized;
        }
      }

      const seeded = SEED_COUPONS.map((c, idx) =>
        normalizeCouponRecord(c, idx)
      );
      globalForCoupons.__tkCouponsCache = seeded;
      try {
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(couponsFile, JSON.stringify(seeded, null, 2), "utf8");
      } catch {
        // Keep in-memory cache
      }
      return seeded;
    } catch {
      // Fallback to in-memory cache
    }
  }

  if (!globalForCoupons.__tkCouponsCache) {
    globalForCoupons.__tkCouponsCache = SEED_COUPONS.map((c, idx) =>
      normalizeCouponRecord(c, idx)
    );
  }
  return globalForCoupons.__tkCouponsCache;
}

function writeCouponsToStore(coupons: CouponRecord[]): void {
  globalForCoupons.__tkCouponsCache = coupons;

  if (typeof window === "undefined") {
    try {
      const nodeRequire = eval("require") as NodeRequire;
      const fs = nodeRequire("fs") as typeof import("fs");
      const path = nodeRequire("path") as typeof import("path");
      const dataDir = path.join(process.cwd(), ".data");
      const couponsFile = path.join(dataDir, "coupons.json");

      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(couponsFile, JSON.stringify(coupons, null, 2), "utf8");
    } catch {
      // Keep in-memory cache if disk write is restricted
    }
  }
}

/**
 * Hydrates the runtime coupon cache on the client from Server Component props.
 */
export function setRuntimeCoupons(coupons: CouponRecord[]): void {
  globalForCoupons.__tkCouponsCache = coupons.map((c, idx) =>
    normalizeCouponRecord(c, idx)
  );
}

/**
 * Returns all coupons from the store.
 */
export function getAllCoupons(): CouponRecord[] {
  return readCouponsFromStore();
}

/**
 * Finds a coupon by its code (case-insensitive).
 */
export function getCouponByCode(code: string): CouponRecord | null {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  const list = readCouponsFromStore();
  return list.find((c) => c.code.toUpperCase() === normalized) ?? null;
}

/**
 * Finds a coupon by its ID.
 */
export function getCouponById(id: string): CouponRecord | null {
  const trimmed = id.trim();
  if (!trimmed) return null;
  const list = readCouponsFromStore();
  return list.find((c) => c.id === trimmed) ?? null;
}

/**
 * Creates a new coupon in `.data/coupons.json`. Throws if code already exists.
 */
export function createCoupon(input: CouponMutationInput): CouponRecord {
  const normalizedCode = input.code.trim().toUpperCase();
  const existing = readCouponsFromStore();

  if (existing.some((c) => c.code.toUpperCase() === normalizedCode)) {
    throw new Error("DUPLICATE_COUPON_CODE");
  }

  const now = new Date().toISOString();
  const created = normalizeCouponRecord({
    id: `cpn-${Date.now().toString(36)}`,
    code: normalizedCode,
    description: input.description.trim(),
    discountType: input.discountType,
    discountValue: input.discountValue,
    minOrderAmount: input.minOrderAmount,
    maxDiscountAmount: input.maxDiscountAmount,
    usageLimit: input.usageLimit,
    perUserLimit: input.perUserLimit,
    usedCount: 0,
    usedByUser: {},
    startDate: input.startDate || now,
    expiresAt: input.expiresAt,
    isActive: input.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  });

  writeCouponsToStore([created, ...existing]);
  return created;
}

/**
 * Updates an existing coupon by ID.
 */
export function updateCoupon(
  id: string,
  updates: Partial<CouponMutationInput>
): CouponRecord | null {
  const existing = readCouponsFromStore();
  const idx = existing.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  const current = existing[idx]!;
  const nextCode =
    updates.code !== undefined
      ? updates.code.trim().toUpperCase()
      : current.code;

  if (
    existing.some(
      (c, i) => i !== idx && c.code.toUpperCase() === nextCode.toUpperCase()
    )
  ) {
    throw new Error("DUPLICATE_COUPON_CODE");
  }

  const updated = normalizeCouponRecord({
    ...current,
    code: nextCode,
    description:
      updates.description !== undefined
        ? updates.description.trim()
        : current.description,
    discountType: updates.discountType ?? current.discountType,
    discountValue:
      updates.discountValue !== undefined
        ? updates.discountValue
        : current.discountValue,
    minOrderAmount:
      updates.minOrderAmount !== undefined
        ? updates.minOrderAmount
        : current.minOrderAmount,
    maxDiscountAmount:
      "maxDiscountAmount" in updates
        ? updates.maxDiscountAmount
        : current.maxDiscountAmount,
    usageLimit:
      "usageLimit" in updates ? updates.usageLimit : current.usageLimit,
    perUserLimit:
      "perUserLimit" in updates ? updates.perUserLimit : current.perUserLimit,
    startDate: updates.startDate ?? current.startDate,
    expiresAt: updates.expiresAt ?? current.expiresAt,
    isActive: updates.isActive ?? current.isActive,
    updatedAt: new Date().toISOString(),
  });

  const nextList = [...existing];
  nextList[idx] = updated;
  writeCouponsToStore(nextList);
  return updated;
}

/**
 * Deletes a coupon by ID.
 */
export function deleteCoupon(id: string): CouponRecord | null {
  const existing = readCouponsFromStore();
  const target = existing.find((c) => c.id === id);
  if (!target) return null;

  const filtered = existing.filter((c) => c.id !== id);
  writeCouponsToStore(filtered);
  return target;
}

/**
 * Increments a coupon's `usedCount` and optional per-user usage counter when an order is placed.
 */
export function incrementCouponUsage(
  code: string,
  userIdentifier?: string
): CouponRecord | null {
  const normalized = code.trim().toUpperCase();
  const existing = readCouponsFromStore();
  const idx = existing.findIndex((c) => c.code.toUpperCase() === normalized);
  if (idx === -1) return null;

  const current = existing[idx]!;
  const userKey = userIdentifier?.trim().toLowerCase();
  const nextUsedByUser = { ...(current.usedByUser ?? {}) };
  if (userKey) {
    nextUsedByUser[userKey] = (nextUsedByUser[userKey] ?? 0) + 1;
  }

  const updated: CouponRecord = {
    ...current,
    usedCount: current.usedCount + 1,
    usedByUser: nextUsedByUser,
    updatedAt: new Date().toISOString(),
  };

  const nextList = [...existing];
  nextList[idx] = updated;
  writeCouponsToStore(nextList);
  return updated;
}
