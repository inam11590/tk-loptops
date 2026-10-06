export interface Coupon {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expiresAt: string; // ISO date string
}

/**
 * Mock promotional coupons for TK Laptop.
 * Includes active percentage/fixed coupons as well as an expired coupon (`EXPIRED20`)
 * for testing validation edge cases.
 */
export const COUPONS: Coupon[] = [
  {
    code: "TK10",
    description: "10% off orders of $800 or more (up to $350 max discount)",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 800,
    maxDiscountAmount: 350,
    expiresAt: "2027-12-31T23:59:59.000Z",
  },
  {
    code: "WELCOME5",
    description: "5% welcome discount on orders of $400 or more",
    discountType: "percentage",
    discountValue: 5,
    minOrderAmount: 400,
    maxDiscountAmount: 200,
    expiresAt: "2027-12-31T23:59:59.000Z",
  },
  {
    code: "SAVE100",
    description: "$100 flat discount on orders of $1,500 or more",
    discountType: "fixed",
    discountValue: 100,
    minOrderAmount: 1500,
    expiresAt: "2027-12-31T23:59:59.000Z",
  },
  {
    code: "EXPIRED20",
    description: "20% seasonal promotion (expired)",
    discountType: "percentage",
    discountValue: 20,
    minOrderAmount: 500,
    expiresAt: "2024-12-31T23:59:59.000Z",
  },
];
