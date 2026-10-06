import fs from "fs";
import path from "path";
import type { DeliveryMethodId, PaymentMethodId } from "@/lib/config";
import type { AddressFormValues } from "@/lib/validations/checkout";

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type PaymentStatus =
  | "Pending Verification"
  | "Authorized (Demo)"
  | "Cash on Delivery"
  | "Awaiting Bank Transfer";

export interface OrderLineItem {
  productId: string;
  slug: string;
  name: string;
  brand: "HP" | "Dell" | "TK Accessory";
  image: string;
  unitPrice: number;
  oldPrice?: number;
  quantity: number;
  lineTotal: number;
  specsSummary?: string;
}

export interface OrderRecord {
  id: string;
  userId?: string;
  createdAt: string;
  estimatedDelivery: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderLineItem[];
  customer: {
    fullName: string;
    email: string;
    phone: string;
    createAccount?: boolean;
  };
  shippingAddress: AddressFormValues;
  billingAddress: AddressFormValues;
  deliveryMethodId: DeliveryMethodId;
  deliveryMethodLabel: string;
  paymentMethodId: PaymentMethodId;
  paymentMethodLabel: string;
  paymentDetails?: {
    cardBrand?: string;
    cardLast4?: string;
    cardHolderName?: string;
    walletPhone?: string;
  };
  totals: {
    totalItems: number;
    subtotal: number;
    productSavings: number;
    couponCode: string | null;
    couponDiscount: number;
    shipping: number;
    codFee: number;
    tax: number;
    grandTotal: number;
  };
  notes?: string;
  accountCreatedMessage?: string;
}

const ORDERS_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(ORDERS_DIR, "orders.json");

/**
 * Pre-seeded demo orders so `/orders/track` and `/order-confirmation/[orderId]`
 * can be tested immediately alongside newly placed orders.
 */
const SEED_ORDERS: OrderRecord[] = [
  {
    id: "TK-20261005-1042",
    userId: "usr-demo-alex",
    createdAt: "2026-10-05T14:20:00.000Z",
    estimatedDelivery: "Oct 8 – Oct 10, 2026",
    status: "Shipped",
    paymentStatus: "Authorized (Demo)",
    items: [
      {
        productId: "hp-01",
        slug: "hp-spectre-x360-14-oled",
        name: "HP Spectre x360 14 2-in-1 OLED",
        brand: "HP",
        image: "/images/laptops/hp-business.svg",
        unitPrice: 1499,
        oldPrice: 1699,
        quantity: 1,
        lineTotal: 1499,
        specsSummary: "Intel Core Ultra 7 155H • 32GB LPDDR5x • 1TB NVMe SSD",
      },
    ],
    customer: {
      fullName: "Alex Rivera",
      email: "alex@example.com",
      phone: "+1 (415) 555-0142",
    },
    shippingAddress: {
      streetAddress: "742 Tech Plaza",
      apartment: "Suite 400",
      city: "San Francisco",
      stateProvince: "CA",
      postalCode: "94107",
      country: "United States",
    },
    billingAddress: {
      streetAddress: "742 Tech Plaza",
      apartment: "Suite 400",
      city: "San Francisco",
      stateProvince: "CA",
      postalCode: "94107",
      country: "United States",
    },
    deliveryMethodId: "express",
    deliveryMethodLabel: "Express Air Delivery (1–2 Business Days)",
    paymentMethodId: "card",
    paymentMethodLabel: "Credit or Debit Card",
    paymentDetails: {
      cardBrand: "visa",
      cardLast4: "4242",
      cardHolderName: "Alex Rivera",
    },
    totals: {
      totalItems: 1,
      subtotal: 1499,
      productSavings: 200,
      couponCode: "TK10",
      couponDiscount: 150,
      shipping: 49,
      codFee: 0,
      tax: 108,
      grandTotal: 1506,
    },
    notes: "Leave with front desk reception.",
  },
];

// Global in-memory fallback cache
const globalForOrders = globalThis as unknown as {
  __tkOrdersCache?: OrderRecord[];
};

function readOrdersFromDisk(): OrderRecord[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, "utf8");
      const parsed = JSON.parse(raw) as OrderRecord[];
      if (Array.isArray(parsed)) {
        globalForOrders.__tkOrdersCache = parsed;
        return parsed;
      }
    }
  } catch {
    // Fallback to memory cache if filesystem is read-only
  }

  if (!globalForOrders.__tkOrdersCache) {
    globalForOrders.__tkOrdersCache = [...SEED_ORDERS];
  }
  return globalForOrders.__tkOrdersCache;
}

function writeOrdersToDisk(orders: OrderRecord[]): void {
  globalForOrders.__tkOrdersCache = orders;
  try {
    if (!fs.existsSync(ORDERS_DIR)) {
      fs.mkdirSync(ORDERS_DIR, { recursive: true });
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
  } catch {
    // Keep in-memory cache if disk write is restricted
  }
}

/**
 * Generates an order ID in the format `TK-YYYYMMDD-XXXX` (e.g. `TK-20261007-4821`).
 */
export function generateOrderId(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const random4 = Math.floor(1000 + Math.random() * 9000);
  return `TK-${yyyy}${mm}${dd}-${random4}`;
}

/**
 * Saves a newly created order to the mock store.
 */
export function saveOrder(order: OrderRecord): OrderRecord {
  const existing = readOrdersFromDisk();
  const updated = [order, ...existing.filter((o) => o.id !== order.id)];
  writeOrdersToDisk(updated);
  return order;
}

/**
 * Finds an order by its ID (case-insensitive).
 */
export function getOrderById(orderId: string): OrderRecord | null {
  const normalized = orderId.trim().toUpperCase();
  if (!normalized) return null;
  const orders = readOrdersFromDisk();
  return orders.find((o) => o.id.toUpperCase() === normalized) ?? null;
}

/**
 * Finds an order by ID and customer email (case-insensitive) for order tracking lookup.
 */
export function findOrderForTracking(
  orderId: string,
  email?: string
): OrderRecord | null {
  const order = getOrderById(orderId);
  if (!order) return null;
  if (email && email.trim().length > 0) {
    if (order.customer.email.toLowerCase() !== email.trim().toLowerCase()) {
      return null;
    }
  }
  return order;
}

/**
 * Links any guest orders (orders without a userId) matching `email` to `userId`.
 * Called automatically when a user registers or logs in.
 */
export function linkGuestOrdersToUser(email: string, userId: string): number {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !userId.trim()) return 0;

  const orders = readOrdersFromDisk();
  let linkedCount = 0;

  const updated = orders.map((order) => {
    if (
      !order.userId &&
      order.customer.email.trim().toLowerCase() === normalizedEmail
    ) {
      linkedCount += 1;
      return { ...order, userId };
    }
    return order;
  });

  if (linkedCount > 0) {
    writeOrdersToDisk(updated);
  }
  return linkedCount;
}

/**
 * Returns all orders belonging to `userId`, sorted newest-first.
 * Also links any unlinked guest orders matching the user's `email`.
 */
export function getOrdersByUser(
  userId: string,
  email?: string
): OrderRecord[] {
  if (email) {
    linkGuestOrdersToUser(email, userId);
  }
  const orders = readOrdersFromDisk();
  return orders
    .filter((o) => o.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

/**
 * Returns an order by ID ONLY if it belongs to `userId`.
 * If the order does not exist or belongs to another user, returns null (so the caller returns 404).
 */
export function getOrderForUserById(
  orderId: string,
  userId: string,
  userEmail?: string
): OrderRecord | null {
  if (userEmail) {
    linkGuestOrdersToUser(userEmail, userId);
  }
  const order = getOrderById(orderId);
  if (!order) return null;
  if (order.userId !== userId) return null;
  return order;
}

