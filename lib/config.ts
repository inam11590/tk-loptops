/**
 * Centralized application, currency, shipping, tax, delivery & payment configuration for TK Laptop.
 * Supports dynamic admin overrides via `getSettings()` backed by `.data/settings.json` on the server
 * and hydrated to the client runtime.
 */

export type DeliveryMethodId = "standard" | "express" | "pickup";
export type PaymentMethodId = "cod" | "card" | "bank_transfer" | "mobile_wallet";

export interface DeliveryMethodConfig {
  id: DeliveryMethodId;
  label: string;
  tagline: string;
  description: string;
  minDays: number;
  maxDays: number;
  fee: number;
  freeOverThreshold: boolean;
}

export interface PaymentMethodConfig {
  id: PaymentMethodId;
  label: string;
  tagline: string;
  description: string;
  codFee: number;
}

export interface StoreSettings {
  storeInfo: {
    name: string;
    tagline: string;
    email: string;
    phone: string;
    address: string;
    hours: string;
  };
  currency: {
    code: string;
    symbol: string;
    locale: string;
    maximumFractionDigits: number;
  };
  shipping: {
    freeDeliveryThreshold: number;
    flatShippingFee: number;
    expressShippingFee: number;
    codHandlingFee: number;
    taxRate: number; // e.g., 0.08 for 8%
    lowStockThreshold: number;
    warrantyText: string;
  };
  bankDetails: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    routingNumber: string;
    iban: string;
    swiftCode: string;
    instructions: string;
  };
  enabledPaymentMethods: PaymentMethodId[];
  updatedAt: string;
}

export const SITE_CONFIG = {
  name: "TK Laptop",
  tagline: "Authorized HP & Dell Premium Laptop Retailer",
  description:
    "Shop certified HP and Dell laptops for business, gaming, and everyday performance. Backed by a 1-year official warranty and fast nationwide delivery.",
  url: "https://tklaptop.com",
  ogImage: "/og-image.svg",
  contact: {
    email: "support@tklaptop.com",
    phone: "+1 (800) 555-0199",
    address: "742 Tech Plaza, Suite 400, San Francisco, CA 94107",
    hours: "Mon–Sat, 9:00 AM – 7:00 PM EST",
  },
  currency: {
    code: "USD",
    symbol: "$",
    locale: "en-US",
    maximumFractionDigits: 0,
  },
  shipping: {
    freeDeliveryThreshold: 999,
    flatShippingFee: 29,
    expressShippingFee: 49,
    codHandlingFee: 15,
    taxRate: 0.08, // 8% estimated sales tax
    lowStockThreshold: 5,
    warrantyText: "1-Year Official Warranty",
  },
  checkout: {
    defaultCountry: "United States",
    countries: [
      "United States",
      "Canada",
      "United Kingdom",
      "United Arab Emirates",
      "Pakistan",
      "Australia",
      "Germany",
    ],
    deliveryMethods: [
      {
        id: "standard",
        label: "Standard Insured Delivery",
        tagline: "3–5 Business Days",
        description:
          "Tracked ground courier with full transit insurance and signature upon arrival. Free on orders over $999.",
        minDays: 3,
        maxDays: 5,
        fee: 29,
        freeOverThreshold: true,
      },
      {
        id: "express",
        label: "Express Air Delivery",
        tagline: "1–2 Business Days",
        description:
          "Priority next-flight air courier with dedicated handling and real-time SMS notifications.",
        minDays: 1,
        maxDays: 2,
        fee: 49,
        freeOverThreshold: false,
      },
      {
        id: "pickup",
        label: "Flagship Store Pickup",
        tagline: "Ready in 2 Hours",
        description:
          "Collect your laptop directly from our San Francisco showroom (742 Tech Plaza, Suite 400). Bring a valid photo ID.",
        minDays: 0,
        maxDays: 1,
        fee: 0,
        freeOverThreshold: false,
      },
    ] satisfies DeliveryMethodConfig[],
    paymentMethods: [
      {
        id: "card",
        label: "Credit or Debit Card",
        tagline: "Visa, Mastercard, Amex, Discover",
        description:
          "Instant payment authorization with 256-bit SSL encryption and zero surcharge.",
        codFee: 0,
      },
      {
        id: "cod",
        label: "Cash on Delivery (COD)",
        tagline: "Pay Upon Courier Arrival",
        description:
          "Inspect your factory-sealed laptop package upon delivery before paying the courier.",
        codFee: 15,
      },
      {
        id: "bank_transfer",
        label: "Direct Bank Transfer",
        tagline: "Corporate ACH / Wire Transfer",
        description:
          "Transfer funds directly to our corporate bank account. Ideal for business & high-value orders.",
        codFee: 0,
      },
      {
        id: "mobile_wallet",
        label: "Mobile Wallet (EasyPay / Instant Pay)",
        tagline: "Instant Mobile Wallet Authorization",
        description:
          "Authorize payment directly from your registered mobile wallet account number.",
        codFee: 0,
      },
    ] satisfies PaymentMethodConfig[],
    bankDetails: {
      bankName: "First Tech Commercial Bank",
      accountTitle: "TK Laptop Enterprise LLC",
      accountNumber: "4092-8810-3349-0012",
      routingNumber: "121000358",
      iban: "US64FTCB12100035840928810",
      swiftCode: "FTCBUS6S",
      instructions:
        "Include your Order ID in the transfer memo/reference. Your laptop reservation is held for 48 hours while the transfer clears.",
    },
    mobileWalletDetails: {
      providerName: "TK Instant Wallet (EasyPay / FastPay)",
      merchantCode: "TK-MERCHANT-8899",
      instructions:
        "Enter the mobile number linked to your wallet. Once your order is placed, approve the payment request in your wallet app.",
    },
  },
  navLinks: [
    { label: "Home", href: "/" },
    { label: "All Laptops", href: "/laptops" },
    { label: "HP", href: "/laptops/hp" },
    { label: "Dell", href: "/laptops/dell" },
    { label: "Deals", href: "/deals" },
    { label: "Track Order", href: "/orders/track" },
  ],
  footerLinks: {
    shop: [
      { label: "All Laptops", href: "/laptops" },
      { label: "HP Laptops", href: "/laptops/hp" },
      { label: "Dell Laptops", href: "/laptops/dell" },
      { label: "Business Workstations", href: "/laptops?category=business" },
      { label: "Gaming Rigs", href: "/laptops?category=gaming" },
      { label: "Exclusive Deals", href: "/deals" },
    ],
    customerCare: [
      { label: "Shipping & Delivery", href: "/#faq" },
      { label: "Returns & Exchanges", href: "/#faq" },
      { label: "1-Year Warranty Policy", href: "/#faq" },
      { label: "Frequently Asked Questions", href: "/#faq" },
      { label: "Track Your Order", href: "/orders/track" },
    ],
  },
  paymentMethods: [
    "Visa",
    "Mastercard",
    "American Express",
    "Apple Pay",
    "PayPal",
  ],
} as const;

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeInfo: {
    name: SITE_CONFIG.name,
    tagline: SITE_CONFIG.tagline,
    email: SITE_CONFIG.contact.email,
    phone: SITE_CONFIG.contact.phone,
    address: SITE_CONFIG.contact.address,
    hours: SITE_CONFIG.contact.hours,
  },
  currency: {
    code: SITE_CONFIG.currency.code,
    symbol: SITE_CONFIG.currency.symbol,
    locale: SITE_CONFIG.currency.locale,
    maximumFractionDigits: SITE_CONFIG.currency.maximumFractionDigits,
  },
  shipping: {
    freeDeliveryThreshold: SITE_CONFIG.shipping.freeDeliveryThreshold,
    flatShippingFee: SITE_CONFIG.shipping.flatShippingFee,
    expressShippingFee: SITE_CONFIG.shipping.expressShippingFee,
    codHandlingFee: SITE_CONFIG.shipping.codHandlingFee,
    taxRate: SITE_CONFIG.shipping.taxRate,
    lowStockThreshold: SITE_CONFIG.shipping.lowStockThreshold,
    warrantyText: SITE_CONFIG.shipping.warrantyText,
  },
  bankDetails: {
    bankName: SITE_CONFIG.checkout.bankDetails.bankName,
    accountTitle: SITE_CONFIG.checkout.bankDetails.accountTitle,
    accountNumber: SITE_CONFIG.checkout.bankDetails.accountNumber,
    routingNumber: SITE_CONFIG.checkout.bankDetails.routingNumber,
    iban: SITE_CONFIG.checkout.bankDetails.iban,
    swiftCode: SITE_CONFIG.checkout.bankDetails.swiftCode,
    instructions: SITE_CONFIG.checkout.bankDetails.instructions,
  },
  enabledPaymentMethods: ["card", "cod", "bank_transfer", "mobile_wallet"],
  updatedAt: "2026-10-01T09:00:00.000Z",
};

const globalForSettings = globalThis as unknown as {
  __tkSettingsCache?: StoreSettings;
};

/**
 * Hydrates the runtime settings cache (used on both server and client).
 */
export function setRuntimeSettings(settings: StoreSettings): void {
  globalForSettings.__tkSettingsCache = settings;
}

/**
 * Returns the active store settings, merging any saved overrides from `.data/settings.json`
 * (or the hydrated client cache) with defaults from `SITE_CONFIG`.
 */
export function getSettings(): StoreSettings {
  if (typeof window === "undefined") {
    try {
      const nodeRequire = eval("require") as NodeRequire;
      const fs = nodeRequire("fs") as typeof import("fs");
      const path = nodeRequire("path") as typeof import("path");
      const settingsFile = path.join(process.cwd(), ".data", "settings.json");
      if (fs.existsSync(settingsFile)) {
        const raw = fs.readFileSync(settingsFile, "utf8");
        const parsed = JSON.parse(raw) as Partial<StoreSettings>;
        const merged: StoreSettings = {
          storeInfo: {
            ...DEFAULT_STORE_SETTINGS.storeInfo,
            ...(parsed.storeInfo ?? {}),
          },
          currency: {
            ...DEFAULT_STORE_SETTINGS.currency,
            ...(parsed.currency ?? {}),
          },
          shipping: {
            ...DEFAULT_STORE_SETTINGS.shipping,
            ...(parsed.shipping ?? {}),
          },
          bankDetails: {
            ...DEFAULT_STORE_SETTINGS.bankDetails,
            ...(parsed.bankDetails ?? {}),
          },
          enabledPaymentMethods:
            Array.isArray(parsed.enabledPaymentMethods) &&
            parsed.enabledPaymentMethods.length > 0
              ? parsed.enabledPaymentMethods
              : DEFAULT_STORE_SETTINGS.enabledPaymentMethods,
          updatedAt: parsed.updatedAt ?? DEFAULT_STORE_SETTINGS.updatedAt,
        };
        globalForSettings.__tkSettingsCache = merged;
        return merged;
      }
    } catch {
      // Fallback to in-memory or default settings
    }
  }

  return globalForSettings.__tkSettingsCache ?? DEFAULT_STORE_SETTINGS;
}

/**
 * Formats a numeric price using the active currency settings from `getSettings()`.
 * @param amount Numeric price value
 * @returns Formatted currency string (e.g., "$1,299")
 */
export function formatPrice(amount: number): string {
  const settings = getSettings();
  const { code, locale, maximumFractionDigits } = settings.currency;
  try {
    return new Intl.NumberFormat(locale || "en-US", {
      style: "currency",
      currency: code || "USD",
      maximumFractionDigits:
        typeof maximumFractionDigits === "number" ? maximumFractionDigits : 0,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${settings.currency.symbol || "$"}${Math.round(amount).toLocaleString("en-US")}`;
  }
}

/**
 * Calculates the integer discount percentage between oldPrice and current price.
 */
export function calculateDiscountPercentage(
  price: number,
  oldPrice?: number
): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}
