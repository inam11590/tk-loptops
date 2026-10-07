import fs from "fs";
import path from "path";
import type { DeliveryMethodId, PaymentMethodId } from "@/lib/config";
import { adjustProductStock } from "@/lib/productStore";
import type { AddressFormValues } from "@/lib/validations/checkout";

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type PaymentStatus =
  | "Paid"
  | "Unpaid"
  | "Refunded"
  | "Pending Verification"
  | "Authorized (Demo)"
  | "Cash on Delivery"
  | "Awaiting Bank Transfer";

export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped", "Cancelled"],
  Shipped: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

export function isValidOrderStatusTransition(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus
): boolean {
  if (currentStatus === nextStatus) return true;
  const allowed = ALLOWED_ORDER_TRANSITIONS[currentStatus] ?? [];
  return allowed.includes(nextStatus);
}

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

export interface OrderInternalNote {
  id: string;
  note: string;
  authorName: string;
  authorEmail: string;
  createdAt: string;
}

export interface OrderStatusHistoryEntry {
  id: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  note?: string;
  changedBy: string;
  changedByEmail?: string;
  changedAt: string;
}

export interface OrderRecord {
  id: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
  estimatedDelivery: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  trackingNumber?: string;
  courier?: string;
  stockDeducted?: boolean;
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
  internalNotes?: OrderInternalNote[];
  statusHistory?: OrderStatusHistoryEntry[];
  accountCreatedMessage?: string;
}

const ORDERS_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(ORDERS_DIR, "orders.json");

/**
 * Pre-seeded orders across multiple dates, brands, and statuses so `/orders/track`,
 * `/order-confirmation/[orderId]`, and `/admin` analytics work out of the box.
 */
const SEED_ORDERS: OrderRecord[] = [
  {
    id: "TK-20261005-1042",
    userId: "usr-demo-alex",
    createdAt: "2026-10-05T14:20:00.000Z",
    updatedAt: "2026-10-05T18:00:00.000Z",
    estimatedDelivery: "Oct 8 – Oct 10, 2026",
    status: "Shipped",
    paymentStatus: "Paid",
    trackingNumber: "FX-8849201948",
    courier: "FedEx Priority Air",
    stockDeducted: true,
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
    internalNotes: [
      {
        id: "note-seed-1",
        note: "Serial tag verified and double-boxed with insured air courier.",
        authorName: "TK Store Administrator",
        authorEmail: "admin@tklaptop.com",
        createdAt: "2026-10-05T17:45:00.000Z",
      },
    ],
    statusHistory: [
      {
        id: "hist-seed-1",
        status: "Confirmed",
        paymentStatus: "Paid",
        note: "Order placed and card payment authorized",
        changedBy: "System Checkout",
        changedAt: "2026-10-05T14:20:00.000Z",
      },
      {
        id: "hist-seed-2",
        status: "Shipped",
        paymentStatus: "Paid",
        note: "Dispatched via FedEx Priority Air (FX-8849201948)",
        changedBy: "TK Store Administrator",
        changedByEmail: "admin@tklaptop.com",
        changedAt: "2026-10-05T18:00:00.000Z",
      },
    ],
  },
  {
    id: "TK-20261006-3819",
    userId: "usr-demo-sarah",
    createdAt: "2026-10-06T11:15:00.000Z",
    updatedAt: "2026-10-06T11:15:00.000Z",
    estimatedDelivery: "Oct 9 – Oct 13, 2026",
    status: "Pending",
    paymentStatus: "Awaiting Bank Transfer",
    stockDeducted: false,
    items: [
      {
        productId: "dell-01",
        slug: "dell-xps-14-9440-oled",
        name: "Dell XPS 14 9440 OLED Ultrabook",
        brand: "Dell",
        image: "/images/laptops/dell-ultrabook.svg",
        unitPrice: 1799,
        oldPrice: 1999,
        quantity: 1,
        lineTotal: 1799,
        specsSummary: "Intel Core Ultra 7 155H • 32GB LPDDR5x • 1TB NVMe SSD",
      },
    ],
    customer: {
      fullName: "Sarah Jenkins",
      email: "sarah.jenkins@example.com",
      phone: "+1 (206) 555-0188",
    },
    shippingAddress: {
      streetAddress: "1200 Pine Street",
      apartment: "Apt 12B",
      city: "Seattle",
      stateProvince: "WA",
      postalCode: "98101",
      country: "United States",
    },
    billingAddress: {
      streetAddress: "1200 Pine Street",
      apartment: "Apt 12B",
      city: "Seattle",
      stateProvince: "WA",
      postalCode: "98101",
      country: "United States",
    },
    deliveryMethodId: "standard",
    deliveryMethodLabel: "Standard Insured Delivery (3–5 Business Days)",
    paymentMethodId: "bank_transfer",
    paymentMethodLabel: "Direct Bank Transfer",
    totals: {
      totalItems: 1,
      subtotal: 1799,
      productSavings: 200,
      couponCode: "SAVE100",
      couponDiscount: 100,
      shipping: 0,
      codFee: 0,
      tax: 136,
      grandTotal: 1835,
    },
    notes: "Call upon arrival at building lobby.",
    internalNotes: [],
    statusHistory: [
      {
        id: "hist-seed-3",
        status: "Pending",
        paymentStatus: "Awaiting Bank Transfer",
        note: "Order created awaiting corporate wire transfer confirmation",
        changedBy: "System Checkout",
        changedAt: "2026-10-06T11:15:00.000Z",
      },
    ],
  },
  {
    id: "TK-20261006-7741",
    userId: "usr-demo-marcus",
    createdAt: "2026-10-06T17:40:00.000Z",
    updatedAt: "2026-10-06T17:40:00.000Z",
    estimatedDelivery: "Oct 9 – Oct 13, 2026",
    status: "Pending",
    paymentStatus: "Unpaid",
    stockDeducted: false,
    items: [
      {
        productId: "hp-03",
        slug: "hp-omen-transcend-14-rtx4070",
        name: "HP OMEN Transcend 14 Gaming OLED",
        brand: "HP",
        image: "/images/laptops/hp-gaming.svg",
        unitPrice: 1649,
        oldPrice: 1899,
        quantity: 1,
        lineTotal: 1649,
        specsSummary: "Intel Core Ultra 9 185H • 32GB LPDDR5x • 1TB SSD • RTX 4070",
      },
    ],
    customer: {
      fullName: "Marcus Vance",
      email: "marcus.vance@example.com",
      phone: "+1 (312) 555-0194",
    },
    shippingAddress: {
      streetAddress: "400 N Michigan Ave",
      apartment: "Floor 9",
      city: "Chicago",
      stateProvince: "IL",
      postalCode: "60611",
      country: "United States",
    },
    billingAddress: {
      streetAddress: "400 N Michigan Ave",
      apartment: "Floor 9",
      city: "Chicago",
      stateProvince: "IL",
      postalCode: "60611",
      country: "United States",
    },
    deliveryMethodId: "standard",
    deliveryMethodLabel: "Standard Insured Delivery (3–5 Business Days)",
    paymentMethodId: "cod",
    paymentMethodLabel: "Cash on Delivery (COD)",
    totals: {
      totalItems: 1,
      subtotal: 1649,
      productSavings: 250,
      couponCode: null,
      couponDiscount: 0,
      shipping: 0,
      codFee: 15,
      tax: 132,
      grandTotal: 1796,
    },
    internalNotes: [],
    statusHistory: [
      {
        id: "hist-seed-4",
        status: "Pending",
        paymentStatus: "Unpaid",
        note: "Cash on Delivery order placed — awaiting phone confirmation",
        changedBy: "System Checkout",
        changedAt: "2026-10-06T17:40:00.000Z",
      },
    ],
  },
  {
    id: "TK-20261002-5210",
    userId: "usr-demo-alex",
    createdAt: "2026-10-02T10:05:00.000Z",
    updatedAt: "2026-10-04T15:30:00.000Z",
    estimatedDelivery: "Oct 3 – Oct 4, 2026",
    status: "Delivered",
    paymentStatus: "Paid",
    trackingNumber: "UPS-1Z999AA10123456784",
    courier: "UPS Next Day Air",
    stockDeducted: true,
    items: [
      {
        productId: "dell-03",
        slug: "dell-alienware-m16-r2-rtx4070",
        name: "Dell Alienware m16 R2 QHD+ 240Hz",
        brand: "Dell",
        image: "/images/laptops/dell-gaming.svg",
        unitPrice: 1749,
        oldPrice: 2049,
        quantity: 1,
        lineTotal: 1749,
        specsSummary: "Intel Core Ultra 7 155H • 32GB DDR5 • 1TB SSD • RTX 4070",
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
      cardBrand: "mastercard",
      cardLast4: "8821",
      cardHolderName: "Alex Rivera",
    },
    totals: {
      totalItems: 1,
      subtotal: 1749,
      productSavings: 300,
      couponCode: null,
      couponDiscount: 0,
      shipping: 49,
      codFee: 0,
      tax: 140,
      grandTotal: 1938,
    },
    internalNotes: [],
    statusHistory: [
      {
        id: "hist-seed-5",
        status: "Confirmed",
        paymentStatus: "Paid",
        changedBy: "System Checkout",
        changedAt: "2026-10-02T10:05:00.000Z",
      },
      {
        id: "hist-seed-6",
        status: "Shipped",
        paymentStatus: "Paid",
        note: "Shipped via UPS Next Day Air",
        changedBy: "TK Store Administrator",
        changedAt: "2026-10-02T16:10:00.000Z",
      },
      {
        id: "hist-seed-7",
        status: "Delivered",
        paymentStatus: "Paid",
        note: "Signed for by customer at reception",
        changedBy: "TK Store Administrator",
        changedAt: "2026-10-04T15:30:00.000Z",
      },
    ],
  },
  {
    id: "TK-20260926-9012",
    userId: "usr-demo-sarah",
    createdAt: "2026-09-26T13:12:00.000Z",
    updatedAt: "2026-09-29T16:00:00.000Z",
    estimatedDelivery: "Sep 29 – Oct 1, 2026",
    status: "Delivered",
    paymentStatus: "Paid",
    trackingNumber: "FX-7721094812",
    courier: "FedEx Ground Insured",
    stockDeducted: true,
    items: [
      {
        productId: "hp-02",
        slug: "hp-elitebook-840-g11-ultra7",
        name: "HP EliteBook 840 G11 Enterprise",
        brand: "HP",
        image: "/images/laptops/hp-business.svg",
        unitPrice: 1349,
        oldPrice: 1499,
        quantity: 2,
        lineTotal: 2698,
        specsSummary: "Intel Core Ultra 7 165U vPro • 32GB DDR5 • 1TB SSD",
      },
    ],
    customer: {
      fullName: "Sarah Jenkins",
      email: "sarah.jenkins@example.com",
      phone: "+1 (206) 555-0188",
    },
    shippingAddress: {
      streetAddress: "1200 Pine Street",
      apartment: "Apt 12B",
      city: "Seattle",
      stateProvince: "WA",
      postalCode: "98101",
      country: "United States",
    },
    billingAddress: {
      streetAddress: "1200 Pine Street",
      apartment: "Apt 12B",
      city: "Seattle",
      stateProvince: "WA",
      postalCode: "98101",
      country: "United States",
    },
    deliveryMethodId: "standard",
    deliveryMethodLabel: "Standard Insured Delivery (3–5 Business Days)",
    paymentMethodId: "card",
    paymentMethodLabel: "Credit or Debit Card",
    totals: {
      totalItems: 2,
      subtotal: 2698,
      productSavings: 300,
      couponCode: "TK10",
      couponDiscount: 270,
      shipping: 0,
      codFee: 0,
      tax: 194,
      grandTotal: 2622,
    },
    internalNotes: [],
    statusHistory: [
      {
        id: "hist-seed-8",
        status: "Delivered",
        paymentStatus: "Paid",
        changedBy: "TK Store Administrator",
        changedAt: "2026-09-29T16:00:00.000Z",
      },
    ],
  },
];

// Global in-memory fallback cache
const globalForOrders = globalThis as unknown as {
  __tkOrdersCache?: OrderRecord[];
};

function normalizeOrderRecord(order: OrderRecord): OrderRecord {
  const defaultHistory: OrderStatusHistoryEntry[] = [
    {
      id: `hist-${order.id}-init`,
      status: order.status,
      paymentStatus: order.paymentStatus,
      note: "Order recorded",
      changedBy: "System",
      changedAt: order.createdAt,
    },
  ];

  return {
    ...order,
    updatedAt: order.updatedAt || order.createdAt,
    stockDeducted:
      typeof order.stockDeducted === "boolean"
        ? order.stockDeducted
        : order.status === "Confirmed" ||
          order.status === "Shipped" ||
          order.status === "Delivered",
    internalNotes: Array.isArray(order.internalNotes)
      ? order.internalNotes
      : [],
    statusHistory:
      Array.isArray(order.statusHistory) && order.statusHistory.length > 0
        ? order.statusHistory
        : defaultHistory,
  };
}

function readOrdersFromDisk(): OrderRecord[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, "utf8");
      const parsed = JSON.parse(raw) as OrderRecord[];
      if (Array.isArray(parsed)) {
        const normalized = parsed.map(normalizeOrderRecord);
        globalForOrders.__tkOrdersCache = normalized;
        return normalized;
      }
    }
  } catch {
    // Fallback to memory cache if filesystem is read-only
  }

  if (!globalForOrders.__tkOrdersCache) {
    const initial = SEED_ORDERS.map(normalizeOrderRecord);
    globalForOrders.__tkOrdersCache = initial;
    writeOrdersToDisk(initial);
  }
  return globalForOrders.__tkOrdersCache;
}

function writeOrdersToDisk(orders: OrderRecord[]): void {
  const normalized = orders.map(normalizeOrderRecord);
  globalForOrders.__tkOrdersCache = normalized;
  try {
    if (!fs.existsSync(ORDERS_DIR)) {
      fs.mkdirSync(ORDERS_DIR, { recursive: true });
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(normalized, null, 2), "utf8");
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
 * Returns all orders sorted newest-first.
 */
export function getAllOrders(): OrderRecord[] {
  return readOrdersFromDisk().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Saves a newly created order to the store.
 * If the order is already `Confirmed` and `stockDeducted` is not yet true,
 * deducts product stock idempotently.
 */
export function saveOrder(order: OrderRecord): OrderRecord {
  const existing = readOrdersFromDisk();
  let shouldDeduct = false;
  let stockDeducted = Boolean(order.stockDeducted);

  if (
    !stockDeducted &&
    (order.status === "Confirmed" ||
      order.status === "Shipped" ||
      order.status === "Delivered")
  ) {
    shouldDeduct = true;
    stockDeducted = true;
  }

  if (shouldDeduct) {
    for (const item of order.items) {
      if (item.brand !== "TK Accessory") {
        adjustProductStock(item.productId, -item.quantity);
      }
    }
  }

  const normalized = normalizeOrderRecord({
    ...order,
    stockDeducted,
  });

  const updated = [normalized, ...existing.filter((o) => o.id !== order.id)];
  writeOrdersToDisk(updated);
  return normalized;
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
 * Idempotently deducts stock for an order if `stockDeducted` is currently false.
 */
export function deductOrderStockIfNeeded(orderId: string): {
  deducted: boolean;
  order: OrderRecord | null;
} {
  const orders = readOrdersFromDisk();
  const idx = orders.findIndex(
    (o) => o.id.toUpperCase() === orderId.trim().toUpperCase()
  );
  if (idx === -1) return { deducted: false, order: null };

  const current = orders[idx]!;
  if (current.stockDeducted) {
    return { deducted: false, order: current };
  }

  for (const item of current.items) {
    if (item.brand !== "TK Accessory") {
      adjustProductStock(item.productId, -item.quantity);
    }
  }

  const updated: OrderRecord = {
    ...current,
    stockDeducted: true,
    updatedAt: new Date().toISOString(),
  };

  const nextOrders = [...orders];
  nextOrders[idx] = updated;
  writeOrdersToDisk(nextOrders);
  return { deducted: true, order: updated };
}

/**
 * Idempotently restores stock for an order if `stockDeducted` is currently true.
 * Calling this multiple times on the same cancelled order will NEVER double-restore stock.
 */
export function restoreOrderStockIfNeeded(orderId: string): {
  restored: boolean;
  order: OrderRecord | null;
} {
  const orders = readOrdersFromDisk();
  const idx = orders.findIndex(
    (o) => o.id.toUpperCase() === orderId.trim().toUpperCase()
  );
  if (idx === -1) return { restored: false, order: null };

  const current = orders[idx]!;
  if (!current.stockDeducted) {
    return { restored: false, order: current };
  }

  for (const item of current.items) {
    if (item.brand !== "TK Accessory") {
      adjustProductStock(item.productId, item.quantity);
    }
  }

  const updated: OrderRecord = {
    ...current,
    stockDeducted: false,
    updatedAt: new Date().toISOString(),
  };

  const nextOrders = [...orders];
  nextOrders[idx] = updated;
  writeOrdersToDisk(nextOrders);
  return { restored: true, order: updated };
}

/**
 * Updates an order's status, enforcing allowed transitions and idempotent stock deduction/restoration:
 * - Confirming (`Pending -> Confirmed`) deducts stock if it was not deducted before (`!stockDeducted`).
 * - Cancelling (`-> Cancelled`) restores stock if it was deducted (`stockDeducted === true`), and sets `stockDeducted = false`.
 */
export function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus,
  options: {
    trackingNumber?: string;
    courier?: string;
    note?: string;
    changedBy: string;
    changedByEmail?: string;
  }
):
  | {
      success: true;
      order: OrderRecord;
      previousStatus: OrderStatus;
      stockAction: "deducted" | "restored" | "none";
    }
  | { success: false; error: string; code: string } {
  const orders = readOrdersFromDisk();
  const idx = orders.findIndex(
    (o) => o.id.toUpperCase() === orderId.trim().toUpperCase()
  );
  if (idx === -1) {
    return {
      success: false,
      error: `Order "${orderId}" not found.`,
      code: "NOT_FOUND",
    };
  }

  const current = orders[idx]!;
  const previousStatus = current.status;

  if (!isValidOrderStatusTransition(previousStatus, nextStatus)) {
    return {
      success: false,
      error: `Invalid status transition: cannot move an order from "${previousStatus}" to "${nextStatus}".`,
      code: "INVALID_TRANSITION",
    };
  }

  let stockDeducted = Boolean(current.stockDeducted);
  let stockAction: "deducted" | "restored" | "none" = "none";

  // Confirming (or shipping/delivering) deducts stock if it was not deducted before
  if (
    (nextStatus === "Confirmed" ||
      nextStatus === "Shipped" ||
      nextStatus === "Delivered") &&
    !stockDeducted
  ) {
    for (const item of current.items) {
      if (item.brand !== "TK Accessory") {
        adjustProductStock(item.productId, -item.quantity);
      }
    }
    stockDeducted = true;
    stockAction = "deducted";
  }

  // Cancelling restores stock if it was deducted before (idempotent: sets stockDeducted = false)
  if (nextStatus === "Cancelled" && stockDeducted) {
    for (const item of current.items) {
      if (item.brand !== "TK Accessory") {
        adjustProductStock(item.productId, item.quantity);
      }
    }
    stockDeducted = false;
    stockAction = "restored";
  }

  const now = new Date().toISOString();
  const nextTracking =
    options.trackingNumber !== undefined
      ? options.trackingNumber.trim()
      : current.trackingNumber;
  const nextCourier =
    options.courier !== undefined ? options.courier.trim() : current.courier;

  const historyNote =
    options.note?.trim() ||
    (nextStatus === "Shipped" && nextTracking
      ? `Shipped via ${nextCourier || "Courier"} (Tracking: ${nextTracking})`
      : `Status changed from ${previousStatus} to ${nextStatus}` +
        (stockAction === "deducted"
          ? " (Inventory deducted)"
          : stockAction === "restored"
          ? " (Inventory restored)"
          : ""));

  const historyEntry: OrderStatusHistoryEntry = {
    id: `hist-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    status: nextStatus,
    paymentStatus: current.paymentStatus,
    note: historyNote,
    changedBy: options.changedBy,
    changedByEmail: options.changedByEmail,
    changedAt: now,
  };

  const updated: OrderRecord = {
    ...current,
    status: nextStatus,
    trackingNumber: nextTracking,
    courier: nextCourier,
    stockDeducted,
    updatedAt: now,
    statusHistory: [...(current.statusHistory ?? []), historyEntry],
  };

  const nextOrders = [...orders];
  nextOrders[idx] = updated;
  writeOrdersToDisk(nextOrders);

  return {
    success: true,
    order: updated,
    previousStatus,
    stockAction,
  };
}

/**
 * Updates an order's payment status (`Paid`, `Unpaid`, `Refunded`, etc.) and appends to statusHistory.
 */
export function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
  options: {
    changedBy: string;
    changedByEmail?: string;
    note?: string;
  }
): { success: true; order: OrderRecord } | { success: false; error: string } {
  const orders = readOrdersFromDisk();
  const idx = orders.findIndex(
    (o) => o.id.toUpperCase() === orderId.trim().toUpperCase()
  );
  if (idx === -1) {
    return { success: false, error: `Order "${orderId}" not found.` };
  }

  const current = orders[idx]!;
  const now = new Date().toISOString();

  const historyEntry: OrderStatusHistoryEntry = {
    id: `hist-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    status: current.status,
    paymentStatus,
    note:
      options.note?.trim() ||
      `Payment status marked as "${paymentStatus}" (was "${current.paymentStatus}")`,
    changedBy: options.changedBy,
    changedByEmail: options.changedByEmail,
    changedAt: now,
  };

  const updated: OrderRecord = {
    ...current,
    paymentStatus,
    updatedAt: now,
    statusHistory: [...(current.statusHistory ?? []), historyEntry],
  };

  const nextOrders = [...orders];
  nextOrders[idx] = updated;
  writeOrdersToDisk(nextOrders);

  return { success: true, order: updated };
}

/**
 * Adds an admin-only internal note to an order.
 */
export function addOrderInternalNote(
  orderId: string,
  note: string,
  author: { fullName: string; email: string }
): { success: true; order: OrderRecord } | { success: false; error: string } {
  const cleaned = note.trim();
  if (!cleaned) {
    return { success: false, error: "Please enter a note before saving." };
  }

  const orders = readOrdersFromDisk();
  const idx = orders.findIndex(
    (o) => o.id.toUpperCase() === orderId.trim().toUpperCase()
  );
  if (idx === -1) {
    return { success: false, error: `Order "${orderId}" not found.` };
  }

  const current = orders[idx]!;
  const newNote: OrderInternalNote = {
    id: `note-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    note: cleaned,
    authorName: author.fullName,
    authorEmail: author.email,
    createdAt: new Date().toISOString(),
  };

  const updated: OrderRecord = {
    ...current,
    updatedAt: newNote.createdAt,
    internalNotes: [newNote, ...(current.internalNotes ?? [])],
  };

  const nextOrders = [...orders];
  nextOrders[idx] = updated;
  writeOrdersToDisk(nextOrders);

  return { success: true, order: updated };
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
