/**
 * Centralized application & currency configuration for TK Laptop.
 * Change `currency.code`, `currency.symbol`, or `currency.locale` here
 * to update pricing display across the entire store.
 */

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
    warrantyText: "1-Year Official Warranty",
  },
  navLinks: [
    { label: "Home", href: "/" },
    { label: "All Laptops", href: "#featured-laptops" },
    { label: "HP", href: "#hp-laptops" },
    { label: "Dell", href: "#dell-laptops" },
    { label: "Deals", href: "#deal-of-the-day" },
    { label: "Contact", href: "#contact" },
  ],
  footerLinks: {
    shop: [
      { label: "HP Laptops", href: "/laptops?brand=HP" },
      { label: "Dell Laptops", href: "/laptops?brand=Dell" },
      { label: "Business Workstations", href: "/laptops?category=business" },
      { label: "Gaming Rigs", href: "/laptops?category=gaming" },
      { label: "Exclusive Deals", href: "#deal-of-the-day" },
    ],
    customerCare: [
      { label: "Shipping & Delivery", href: "#faq" },
      { label: "Returns & Exchanges", href: "#faq" },
      { label: "1-Year Warranty Policy", href: "#faq" },
      { label: "Frequently Asked Questions", href: "#faq" },
      { label: "Track Your Order", href: "#contact" },
    ],
  },
  paymentMethods: ["Visa", "Mastercard", "American Express", "Apple Pay", "PayPal"],
} as const;

/**
 * Formats a numeric price using the centralized currency settings in SITE_CONFIG.
 * @param amount Numeric price value
 * @returns Formatted currency string (e.g., "$1,299")
 */
export function formatPrice(amount: number): string {
  const { code, locale, maximumFractionDigits } = SITE_CONFIG.currency;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculates the integer discount percentage between oldPrice and current price.
 */
export function calculateDiscountPercentage(price: number, oldPrice?: number): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}
