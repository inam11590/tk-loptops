import { ACCESSORIES } from "@/data/accessories";
import { COUPONS, type Coupon } from "@/data/coupons";
import { PRODUCTS } from "@/data/products";
import { formatPrice, SITE_CONFIG } from "@/lib/config";
import type { Product } from "@/types/product";

export interface CartItemData {
  productId: string;
  slug: string;
  name: string;
  brand: "HP" | "Dell" | "TK Accessory";
  image: string;
  price: number;
  oldPrice?: number;
  quantity: number;
  stock: number;
  specsSummary?: string;
  itemType?: "laptop" | "accessory";
}

export interface ReconciledCartItem extends CartItemData {
  /** Current live price from product catalog */
  currentPrice: number;
  /** Current live oldPrice from product catalog */
  currentOldPrice?: number;
  /** Current live stock from product catalog */
  currentStock: number;
  /** Effective quantity capped at currentStock */
  effectiveQuantity: number;
  /** Line total (currentPrice * effectiveQuantity) */
  lineTotal: number;
  /** True if catalog price differs from price when item was added */
  priceChanged: boolean;
  /** Price when originally added to cart if it changed */
  previousPrice?: number;
  /** Warning message if stock was reduced or depleted after adding */
  stockWarning?: string;
  /** True if item is currently out of stock */
  isOutOfStock: boolean;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  message: string;
}

export interface CartTotals {
  reconciledItems: ReconciledCartItem[];
  totalItems: number;
  subtotal: number;
  productSavings: number;
  couponCode: string | null;
  couponDiscount: number;
  couponValidation: CouponValidationResult | null;
  totalSavings: number;
  shipping: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  freeShippingProgress: number;
  qualifiesForFreeShipping: boolean;
  tax: number;
  taxRatePercent: number;
  grandTotal: number;
  hasStockIssues: boolean;
  hasPriceChanges: boolean;
}

/**
 * Resolves a cart item (`productId` or `slug`) against the live PRODUCTS and ACCESSORIES catalogs.
 */
export function resolveCatalogItem(productIdOrSlug: string): {
  productId: string;
  slug: string;
  name: string;
  brand: "HP" | "Dell" | "TK Accessory";
  image: string;
  price: number;
  oldPrice?: number;
  stock: number;
  specsSummary: string;
  itemType: "laptop" | "accessory";
  product?: Product;
} | null {
  const laptop = PRODUCTS.find(
    (p) => p.id === productIdOrSlug || p.slug === productIdOrSlug
  );
  if (laptop) {
    return {
      productId: laptop.id,
      slug: laptop.slug,
      name: laptop.name,
      brand: laptop.brand,
      image: laptop.images[0] ?? "/images/laptops/hp-business.svg",
      price: laptop.price,
      oldPrice: laptop.oldPrice,
      stock: laptop.stock,
      specsSummary: `${laptop.specs.processor} • ${laptop.specs.ram} • ${laptop.specs.storage}`,
      itemType: "laptop",
      product: laptop,
    };
  }

  const accessory = ACCESSORIES.find((a) => a.id === productIdOrSlug);
  if (accessory) {
    return {
      productId: accessory.id,
      slug: accessory.id,
      name: accessory.name,
      brand: "TK Accessory",
      image: accessory.image,
      price: accessory.price,
      oldPrice: accessory.oldPrice,
      stock: 25,
      specsSummary: accessory.shortSpec,
      itemType: "accessory",
    };
  }

  return null;
}

/**
 * Converts a Product into a CartItemData object.
 */
export function productToCartItem(
  product: Product,
  quantity = 1
): CartItemData {
  const safeQty = Math.max(1, Math.min(quantity, Math.max(1, product.stock)));
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    image: product.images[0] ?? "/images/laptops/hp-business.svg",
    price: product.price,
    oldPrice: product.oldPrice,
    quantity: safeQty,
    stock: product.stock,
    specsSummary: `${product.specs.processor} • ${product.specs.ram} • ${product.specs.storage}`,
    itemType: "laptop",
  };
}

/**
 * Reconciles persisted cart items against live catalog data to detect
 * price changes, stock reductions, or out-of-stock states.
 */
export function reconcileCartItems(items: CartItemData[]): ReconciledCartItem[] {
  return items.map((item) => {
    const live = resolveCatalogItem(item.productId);

    const currentPrice = live ? live.price : item.price;
    const currentOldPrice = live ? live.oldPrice : item.oldPrice;
    const currentStock = live ? live.stock : item.stock;
    const specsSummary = live ? live.specsSummary : item.specsSummary;

    const priceChanged = currentPrice !== item.price;
    const isOutOfStock = currentStock <= 0;

    let effectiveQuantity = item.quantity;
    let stockWarning: string | undefined;

    if (isOutOfStock) {
      effectiveQuantity = 0;
      stockWarning =
        "This item is now out of stock and has been excluded from your total. Please remove it or move it to your wishlist.";
    } else if (item.quantity > currentStock) {
      effectiveQuantity = currentStock;
      stockWarning = `Stock availability updated: only ${currentStock} left. Quantity capped at ${currentStock}.`;
    }

    return {
      ...item,
      specsSummary,
      currentPrice,
      currentOldPrice,
      currentStock,
      effectiveQuantity,
      lineTotal: currentPrice * effectiveQuantity,
      priceChanged,
      previousPrice: priceChanged ? item.price : undefined,
      stockWarning,
      isOutOfStock,
    };
  });
}

/**
 * Pure function to validate a coupon code against a given cart subtotal and timestamp.
 */
export function validateCoupon(
  rawCode: string,
  subtotal: number,
  now: Date = new Date()
): CouponValidationResult {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return {
      valid: false,
      discountAmount: 0,
      message: "Please enter a promo code.",
    };
  }

  const coupon = COUPONS.find((c) => c.code.toUpperCase() === code);
  if (!coupon) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Promo code "${code}" is invalid or not recognized.`,
    };
  }

  const expiryDate = new Date(coupon.expiresAt);
  if (now.getTime() > expiryDate.getTime()) {
    return {
      valid: false,
      coupon,
      discountAmount: 0,
      message: `Promo code "${coupon.code}" has expired.`,
    };
  }

  if (subtotal < coupon.minOrderAmount) {
    const shortfall = coupon.minOrderAmount - subtotal;
    return {
      valid: false,
      coupon,
      discountAmount: 0,
      message: `Minimum order of ${formatPrice(
        coupon.minOrderAmount
      )} required for ${coupon.code} (add ${formatPrice(shortfall)} more).`,
    };
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
    if (
      typeof coupon.maxDiscountAmount === "number" &&
      discountAmount > coupon.maxDiscountAmount
    ) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  discountAmount = Math.min(discountAmount, subtotal);

  return {
    valid: true,
    coupon,
    discountAmount,
    message: `Code "${coupon.code}" applied! You saved ${formatPrice(
      discountAmount
    )}.`,
  };
}

/**
 * Pure function to calculate shipping cost based on subtotal and SITE_CONFIG rules.
 */
export function calculateShipping(subtotal: number): {
  shipping: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  freeShippingProgress: number;
  qualifiesForFreeShipping: boolean;
} {
  const { freeDeliveryThreshold, flatShippingFee } = SITE_CONFIG.shipping;

  if (subtotal <= 0) {
    return {
      shipping: 0,
      freeShippingThreshold: freeDeliveryThreshold,
      freeShippingRemaining: freeDeliveryThreshold,
      freeShippingProgress: 0,
      qualifiesForFreeShipping: false,
    };
  }

  const qualifiesForFreeShipping = subtotal >= freeDeliveryThreshold;
  const shipping = qualifiesForFreeShipping ? 0 : flatShippingFee;
  const freeShippingRemaining = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / freeDeliveryThreshold) * 100)
  );

  return {
    shipping,
    freeShippingThreshold: freeDeliveryThreshold,
    freeShippingRemaining,
    freeShippingProgress,
    qualifiesForFreeShipping,
  };
}

/**
 * Pure function to calculate full cart totals, savings, shipping, tax, and coupon status.
 */
export function calculateCartTotals(
  items: CartItemData[],
  appliedCouponCode: string | null = null,
  now: Date = new Date()
): CartTotals {
  const reconciledItems = reconcileCartItems(items);

  const totalItems = reconciledItems.reduce(
    (sum, item) => sum + item.effectiveQuantity,
    0
  );

  const subtotal = reconciledItems.reduce(
    (sum, item) => sum + item.lineTotal,
    0
  );

  const productSavings = reconciledItems.reduce((sum, item) => {
    if (
      item.currentOldPrice &&
      item.currentOldPrice > item.currentPrice &&
      item.effectiveQuantity > 0
    ) {
      return (
        sum +
        (item.currentOldPrice - item.currentPrice) * item.effectiveQuantity
      );
    }
    return sum;
  }, 0);

  let couponValidation: CouponValidationResult | null = null;
  let couponDiscount = 0;

  if (appliedCouponCode && subtotal > 0) {
    couponValidation = validateCoupon(appliedCouponCode, subtotal, now);
    if (couponValidation.valid) {
      couponDiscount = couponValidation.discountAmount;
    }
  }

  const {
    shipping,
    freeShippingThreshold,
    freeShippingRemaining,
    freeShippingProgress,
    qualifiesForFreeShipping,
  } = calculateShipping(subtotal);

  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const taxRate = SITE_CONFIG.shipping.taxRate;
  const tax = Math.round(taxableAmount * taxRate);
  const taxRatePercent = Math.round(taxRate * 100);

  const grandTotal = Math.max(0, taxableAmount + shipping + tax);
  const totalSavings = productSavings + couponDiscount;

  const hasStockIssues = reconciledItems.some((item) =>
    Boolean(item.stockWarning)
  );
  const hasPriceChanges = reconciledItems.some((item) => item.priceChanged);

  return {
    reconciledItems,
    totalItems,
    subtotal,
    productSavings,
    couponCode: appliedCouponCode,
    couponDiscount,
    couponValidation,
    totalSavings,
    shipping,
    freeShippingThreshold,
    freeShippingRemaining,
    freeShippingProgress,
    qualifiesForFreeShipping,
    tax,
    taxRatePercent,
    grandTotal,
    hasStockIssues,
    hasPriceChanges,
  };
}

/**
 * Returns recommended products based on the items currently in the cart.
 */
export function getCartRecommendations(
  items: CartItemData[],
  limit = 4
): Product[] {
  const inCartIds = new Set(items.map((i) => i.productId));
  const inCartBrands = new Set(
    items
      .map((i) => i.brand)
      .filter((b): b is "HP" | "Dell" => b === "HP" || b === "Dell")
  );

  const available = PRODUCTS.filter(
    (p) => !inCartIds.has(p.id) && p.stock > 0
  );

  const scored = available.map((candidate) => {
    let score = candidate.rating * 2;
    if (inCartBrands.has(candidate.brand)) score += 5;
    if (candidate.oldPrice && candidate.oldPrice > candidate.price) score += 3;
    return { candidate, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.candidate);
}
