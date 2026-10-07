import { ACCESSORIES } from "@/data/accessories";
import type { Coupon } from "@/data/coupons";
import {
  calculateDeliveryFee,
  calculatePaymentFee,
} from "@/lib/checkout";
import {
  formatPrice,
  getSettings,
  type DeliveryMethodId,
  type PaymentMethodId,
} from "@/lib/config";
import { getAllCoupons } from "@/lib/couponStore";
import { getPublishedProducts } from "@/lib/productStore";
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

export interface CartCalculationOptions {
  deliveryMethodId?: DeliveryMethodId;
  paymentMethodId?: PaymentMethodId;
  userIdentifier?: string;
  now?: Date;
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
  deliveryMethodId: DeliveryMethodId;
  paymentMethodId: PaymentMethodId;
  shipping: number;
  codFee: number;
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
 * Resolves a cart item (`productId` or `slug`) against the live published products and accessories catalogs.
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
  const publishedLaptops = getPublishedProducts();
  const laptop = publishedLaptops.find(
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
 * price changes, stock reductions, unpublished items, or out-of-stock states.
 */
export function reconcileCartItems(items: CartItemData[]): ReconciledCartItem[] {
  return items.map((item) => {
    const live = resolveCatalogItem(item.productId);

    const currentPrice = live ? live.price : item.price;
    const currentOldPrice = live ? live.oldPrice : item.oldPrice;
    const currentStock = live ? live.stock : 0;
    const specsSummary = live ? live.specsSummary : item.specsSummary;

    const priceChanged = Boolean(live && currentPrice !== item.price);
    const isOutOfStock = currentStock <= 0;

    let effectiveQuantity = item.quantity;
    let stockWarning: string | undefined;

    if (isOutOfStock) {
      effectiveQuantity = 0;
      stockWarning = !live
        ? "This item is no longer available in our catalog and has been excluded from your total."
        : "This item is now out of stock and has been excluded from your total. Please remove it or move it to your wishlist.";
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
 * Pure function to validate a coupon code against the coupon store, cart subtotal, usage limits, and timestamp.
 */
export function validateCoupon(
  rawCode: string,
  subtotal: number,
  now: Date = new Date(),
  userIdentifier?: string
): CouponValidationResult {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return {
      valid: false,
      discountAmount: 0,
      message: "Please enter a promo code.",
    };
  }

  const coupons = getAllCoupons();
  const coupon = coupons.find((c) => c.code.toUpperCase() === code);
  if (!coupon) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Promo code "${code}" is invalid or not recognized.`,
    };
  }

  if (coupon.isActive === false) {
    return {
      valid: false,
      coupon,
      discountAmount: 0,
      message: `Promo code "${coupon.code}" is currently inactive.`,
    };
  }

  if (coupon.startDate) {
    const startDate = new Date(coupon.startDate);
    if (now.getTime() < startDate.getTime()) {
      return {
        valid: false,
        coupon,
        discountAmount: 0,
        message: `Promo code "${coupon.code}" is not yet active.`,
      };
    }
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

  if (
    typeof coupon.usageLimit === "number" &&
    coupon.usageLimit > 0 &&
    (coupon.usedCount ?? 0) >= coupon.usageLimit
  ) {
    return {
      valid: false,
      coupon,
      discountAmount: 0,
      message: `Promo code "${coupon.code}" has reached its maximum usage limit.`,
    };
  }

  if (
    userIdentifier &&
    typeof coupon.perUserLimit === "number" &&
    coupon.perUserLimit > 0
  ) {
    const userKey = userIdentifier.trim().toLowerCase();
    const userUsed = coupon.usedByUser?.[userKey] ?? 0;
    if (userUsed >= coupon.perUserLimit) {
      return {
        valid: false,
        coupon,
        discountAmount: 0,
        message: `You have already used promo code "${coupon.code}" the maximum allowed number of times (${coupon.perUserLimit}).`,
      };
    }
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
 * Pure function to calculate shipping cost based on subtotal, delivery method, and active `getSettings()` rules.
 */
export function calculateShipping(
  subtotal: number,
  deliveryMethodId: DeliveryMethodId = "standard"
): {
  shipping: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  freeShippingProgress: number;
  qualifiesForFreeShipping: boolean;
} {
  const settings = getSettings();
  const { freeDeliveryThreshold } = settings.shipping;

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
  const shipping = calculateDeliveryFee(deliveryMethodId, subtotal);
  const freeShippingRemaining = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeShippingProgress =
    freeDeliveryThreshold > 0
      ? Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100))
      : 100;

  return {
    shipping,
    freeShippingThreshold: freeDeliveryThreshold,
    freeShippingRemaining,
    freeShippingProgress,
    qualifiesForFreeShipping,
  };
}

/**
 * Pure function to calculate full cart totals, savings, delivery fee, COD fee, tax, and coupon status.
 */
export function calculateCartTotals(
  items: CartItemData[],
  appliedCouponCode: string | null = null,
  optionsOrNow: Date | CartCalculationOptions = {}
): CartTotals {
  const options: CartCalculationOptions =
    optionsOrNow instanceof Date ? { now: optionsOrNow } : optionsOrNow;

  const now = options.now ?? new Date();
  const deliveryMethodId = options.deliveryMethodId ?? "standard";
  const paymentMethodId = options.paymentMethodId ?? "card";
  const settings = getSettings();

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
    couponValidation = validateCoupon(
      appliedCouponCode,
      subtotal,
      now,
      options.userIdentifier
    );
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
  } = calculateShipping(subtotal, deliveryMethodId);

  const codFee = calculatePaymentFee(paymentMethodId, subtotal);

  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const taxRate = settings.shipping.taxRate;
  const tax = Math.round(taxableAmount * taxRate);
  const taxRatePercent = Math.round(taxRate * 100);

  const grandTotal =
    subtotal > 0 ? Math.max(0, taxableAmount + shipping + codFee + tax) : 0;
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
    deliveryMethodId,
    paymentMethodId,
    shipping,
    codFee,
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
 * Returns recommended published products based on the items currently in the cart.
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

  const available = getPublishedProducts().filter(
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
