export interface Coupon {
  id?: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  usedCount?: number;
  usedByUser?: Record<string, number>;
  startDate?: string; // ISO date string
  expiresAt: string; // ISO date string
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Initial seed promotional coupons for TK Laptop.
 * Moved into the persistent mock store at `/lib/couponStore.ts` (`.data/coupons.json`).
 */
export const COUPONS: Coupon[] = [
  {
    id: "cpn-tk10",
    code: "TK10",
    description: "10% off orders of $800 or more (up to $350 max discount)",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 800,
    maxDiscountAmount: 350,
    usageLimit: 100,
    perUserLimit: 2,
    usedCount: 12,
    usedByUser: {},
    startDate: "2026-01-01T00:00:00.000Z",
    expiresAt: "2027-12-31T23:59:59.000Z",
    isActive: true,
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-10-05T00:00:00.000Z",
  },
  {
    id: "cpn-welcome5",
    code: "WELCOME5",
    description: "5% welcome discount on orders of $400 or more",
    discountType: "percentage",
    discountValue: 5,
    minOrderAmount: 400,
    maxDiscountAmount: 200,
    usageLimit: 250,
    perUserLimit: 1,
    usedCount: 28,
    usedByUser: {},
    startDate: "2026-01-01T00:00:00.000Z",
    expiresAt: "2027-12-31T23:59:59.000Z",
    isActive: true,
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "cpn-save100",
    code: "SAVE100",
    description: "$100 flat discount on orders of $1,500 or more",
    discountType: "fixed",
    discountValue: 100,
    minOrderAmount: 1500,
    usageLimit: 50,
    perUserLimit: 1,
    usedCount: 9,
    usedByUser: {},
    startDate: "2026-01-01T00:00:00.000Z",
    expiresAt: "2027-12-31T23:59:59.000Z",
    isActive: true,
    createdAt: "2026-09-05T00:00:00.000Z",
    updatedAt: "2026-10-02T00:00:00.000Z",
  },
  {
    id: "cpn-expired20",
    code: "EXPIRED20",
    description: "20% seasonal promotion (expired)",
    discountType: "percentage",
    discountValue: 20,
    minOrderAmount: 500,
    usageLimit: 50,
    perUserLimit: 1,
    usedCount: 50,
    usedByUser: {},
    startDate: "2024-01-01T00:00:00.000Z",
    expiresAt: "2024-12-31T23:59:59.000Z",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-12-31T23:59:59.000Z",
  },
];
