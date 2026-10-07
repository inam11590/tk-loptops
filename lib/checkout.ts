import {
  formatPrice,
  getSettings,
  SITE_CONFIG,
  type DeliveryMethodConfig,
  type DeliveryMethodId,
  type PaymentMethodConfig,
  type PaymentMethodId,
} from "@/lib/config";

export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "unknown";

/**
 * Retrieves the configuration object for a given delivery method ID,
 * reflecting dynamic fees and free delivery threshold from `getSettings()`.
 */
export function getDeliveryMethodConfig(
  methodId: DeliveryMethodId = "standard"
): DeliveryMethodConfig {
  const settings = getSettings();
  const base =
    SITE_CONFIG.checkout.deliveryMethods.find((m) => m.id === methodId) ??
    SITE_CONFIG.checkout.deliveryMethods[0];

  if (base.id === "standard") {
    return {
      ...base,
      fee: settings.shipping.flatShippingFee,
      description: `Tracked ground courier with full transit insurance and signature upon arrival. Free on orders over ${formatPrice(settings.shipping.freeDeliveryThreshold)}.`,
    };
  }
  if (base.id === "express") {
    return {
      ...base,
      fee: settings.shipping.expressShippingFee,
    };
  }
  return base;
}

/**
 * Retrieves the configuration object for a given payment method ID,
 * reflecting dynamic COD handling fee from `getSettings()`.
 */
export function getPaymentMethodConfig(
  methodId: PaymentMethodId = "card"
): PaymentMethodConfig {
  const settings = getSettings();
  const base =
    SITE_CONFIG.checkout.paymentMethods.find((m) => m.id === methodId) ??
    SITE_CONFIG.checkout.paymentMethods[0];

  if (base.id === "cod") {
    return {
      ...base,
      codFee: settings.shipping.codHandlingFee,
    };
  }
  return base;
}

/**
 * Calculates the delivery fee for a selected delivery method and cart subtotal.
 * Standard delivery becomes free when subtotal >= getSettings().shipping.freeDeliveryThreshold.
 */
export function calculateDeliveryFee(
  methodId: DeliveryMethodId,
  subtotal: number
): number {
  if (subtotal <= 0) return 0;
  const settings = getSettings();
  const method = getDeliveryMethodConfig(methodId);
  if (
    method.freeOverThreshold &&
    subtotal >= settings.shipping.freeDeliveryThreshold
  ) {
    return 0;
  }
  return method.fee;
}

/**
 * Calculates any payment-method handling fee (e.g., Cash on Delivery fee).
 */
export function calculatePaymentFee(
  methodId: PaymentMethodId,
  subtotal: number
): number {
  if (subtotal <= 0) return 0;
  const method = getPaymentMethodConfig(methodId);
  return method.codFee;
}

/**
 * Adds business days (skipping Saturday and Sunday) to a given starting date.
 */
export function addBusinessDays(startDate: Date, businessDays: number): Date {
  const result = new Date(startDate);
  if (businessDays <= 0) return result;

  let added = 0;
  while (added < businessDays) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added += 1;
    }
  }
  return result;
}

/**
 * Returns a human-readable estimated delivery date window (e.g. "Oct 10 – Oct 14, 2026")
 * based on the selected delivery method.
 */
export function getEstimatedDeliveryWindow(
  methodId: DeliveryMethodId,
  fromDate: Date = new Date()
): {
  label: string;
  earliestDate: string;
  latestDate: string;
} {
  const method = getDeliveryMethodConfig(methodId);
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const shortFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });

  if (method.id === "pickup") {
    const pickupDate = addBusinessDays(fromDate, 0);
    const formatted = formatter.format(pickupDate);
    return {
      label: `Same-Day Store Pickup (${formatted})`,
      earliestDate: pickupDate.toISOString(),
      latestDate: addBusinessDays(fromDate, 1).toISOString(),
    };
  }

  const earliest = addBusinessDays(fromDate, method.minDays);
  const latest = addBusinessDays(fromDate, method.maxDays);

  const label = `${shortFormatter.format(earliest)} – ${formatter.format(
    latest
  )}`;

  return {
    label,
    earliestDate: earliest.toISOString(),
    latestDate: latest.toISOString(),
  };
}

/**
 * Strips all non-digit characters from a string.
 */
export function stripNonDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Detects credit/debit card brand from the card number prefix.
 */
export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = stripNonDigits(cardNumber);
  if (!digits) return "unknown";

  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2(2[2-9][1-9]|2[3-9]\d|[3-6]\d{2}|7[01]\d|720))/.test(digits)) {
    return "mastercard";
  }
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(6011|65|64[4-9])/.test(digits)) return "discover";

  return "unknown";
}

/**
 * Formats a raw card number string with spaces (4-6-5 for Amex, 4-4-4-4 for others).
 */
export function formatCardNumber(raw: string): string {
  const digits = stripNonDigits(raw).slice(0, 19);
  const brand = detectCardBrand(digits);

  if (brand === "amex") {
    const p1 = digits.slice(0, 4);
    const p2 = digits.slice(4, 10);
    const p3 = digits.slice(10, 15);
    return [p1, p2, p3].filter(Boolean).join(" ");
  }

  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    groups.push(digits.slice(i, i + 4));
  }
  return groups.join(" ");
}

/**
 * Formats a raw expiry string into MM/YY.
 */
export function formatCardExpiry(raw: string): string {
  const digits = stripNonDigits(raw).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
}

/**
 * Validates a credit/debit card number using the standard Luhn checksum algorithm.
 */
export function validateLuhn(cardNumber: string): boolean {
  const digits = stripNonDigits(cardNumber);
  if (digits.length < 13 || digits.length > 19) return false;
  // Reject all-zeros
  if (/^0+$/.test(digits)) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = parseInt(digits.charAt(i), 10);
    if (Number.isNaN(digit)) return false;

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Validates a card expiry string in MM/YY format and ensures it is not in the past.
 */
export function validateCardExpiry(
  expiryMmYy: string,
  now: Date = new Date()
): { valid: boolean; message?: string } {
  const trimmed = expiryMmYy.trim();
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(trimmed);
  if (!match) {
    return {
      valid: false,
      message: "Enter expiry in MM/YY format (e.g. 08/28).",
    };
  }

  const month = parseInt(match[1], 10);
  const year2Digit = parseInt(match[2], 10);
  const fullYear = 2000 + year2Digit;

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1..12

  if (
    fullYear < currentYear ||
    (fullYear === currentYear && month < currentMonth)
  ) {
    return {
      valid: false,
      message: "This card has expired. Please use an active card.",
    };
  }

  if (fullYear > currentYear + 20) {
    return {
      valid: false,
      message: "Invalid expiration year.",
    };
  }

  return { valid: true };
}

/**
 * Masks a card number so only the last 4 digits are retained (e.g., "•••• •••• •••• 4242").
 * Full card numbers are never stored or transmitted to persistence.
 */
export function maskCardNumber(cardNumber: string): string {
  const digits = stripNonDigits(cardNumber);
  const last4 = digits.slice(-4).padStart(4, "•");
  return `•••• •••• •••• ${last4}`;
}
