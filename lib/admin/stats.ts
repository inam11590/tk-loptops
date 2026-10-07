import type { OrderRecord, OrderStatus } from "@/lib/orders";
import type { SafeUser } from "@/lib/users";
import type { Product, ProductReview } from "@/types/product";

export type AdminDateRangePreset = "today" | "7d" | "30d" | "90d" | "custom";

export interface DateRangeFilter {
  preset: AdminDateRangePreset;
  from?: string;
  to?: string;
}

export interface KpiMetric {
  value: number;
  previousValue: number;
  percentChange: number;
}

export interface RevenueTimePoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusStat {
  status: OrderStatus;
  count: number;
  fill: string;
}

export interface BrandSalesStat {
  brand: "HP" | "Dell";
  revenue: number;
  units: number;
}

export interface TopProductStat {
  productId: string;
  slug: string;
  name: string;
  brand: "HP" | "Dell";
  image: string;
  unitsSold: number;
  revenue: number;
}

export interface LowStockAlertItem {
  id: string;
  slug: string;
  name: string;
  brand: "HP" | "Dell";
  stock: number;
  price: number;
  image: string;
}

export interface PendingActionsSummary {
  ordersAwaitingConfirmation: number;
  pendingBankTransfers: number;
  unapprovedReviews: number;
  totalPending: number;
}

export interface AdminDashboardStats {
  rangeLabel: string;
  kpis: {
    revenue: KpiMetric;
    orders: KpiMetric;
    customers: KpiMetric;
    averageOrderValue: KpiMetric;
  };
  revenueOverTime: RevenueTimePoint[];
  ordersByStatus: OrderStatusStat[];
  salesByBrand: BrandSalesStat[];
  topSellingProducts: TopProductStat[];
  recentOrders: OrderRecord[];
  lowStockAlerts: LowStockAlertItem[];
  pendingActions: PendingActionsSummary;
}

function resolveDateWindow(
  filter: DateRangeFilter,
  now: Date = new Date()
): {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
  days: number;
  label: string;
} {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (filter.preset === "custom" && filter.from && filter.to) {
    const customStart = new Date(filter.from);
    customStart.setHours(0, 0, 0, 0);
    const customEnd = new Date(filter.to);
    customEnd.setHours(23, 59, 59, 999);

    const validStart = Number.isNaN(customStart.getTime())
      ? new Date(end.getTime() - 29 * 86_400_000)
      : customStart;
    const validEnd = Number.isNaN(customEnd.getTime()) ? end : customEnd;
    const spanMs = Math.max(
      86_400_000,
      validEnd.getTime() - validStart.getTime()
    );
    const days = Math.max(1, Math.round(spanMs / 86_400_000));
    const prevEnd = new Date(validStart.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - spanMs);

    return {
      currentStart: validStart,
      currentEnd: validEnd,
      previousStart: prevStart,
      previousEnd: prevEnd,
      days,
      label: `${filter.from} to ${filter.to}`,
    };
  }

  let days = 30;
  let label = "Last 30 Days";

  if (filter.preset === "today") {
    days = 1;
    label = "Today";
  } else if (filter.preset === "7d") {
    days = 7;
    label = "Last 7 Days";
  } else if (filter.preset === "30d") {
    days = 30;
    label = "Last 30 Days";
  } else if (filter.preset === "90d") {
    days = 90;
    label = "Last 90 Days";
  }

  const currentStart = new Date(end);
  currentStart.setDate(currentStart.getDate() - (days - 1));
  currentStart.setHours(0, 0, 0, 0);

  const previousEnd = new Date(currentStart.getTime() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - (days - 1));
  previousStart.setHours(0, 0, 0, 0);

  return {
    currentStart,
    currentEnd: end,
    previousStart,
    previousEnd,
    days,
    label,
  };
}

function calcPercentChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function buildMetric(current: number, previous: number): KpiMetric {
  return {
    value: current,
    previousValue: previous,
    percentChange: calcPercentChange(current, previous),
  };
}

/**
 * Pure dashboard statistics computation from orders, users, products, and reviews.
 */
export function computeAdminDashboardStats(input: {
  orders: OrderRecord[];
  users: SafeUser[];
  products: Product[];
  reviews: ProductReview[];
  lowStockThreshold: number;
  filter?: DateRangeFilter;
  now?: Date;
}): AdminDashboardStats {
  const filter: DateRangeFilter = input.filter ?? { preset: "30d" };
  const windowInfo = resolveDateWindow(filter, input.now);

  const inRange = (isoDate: string, start: Date, end: Date) => {
    const t = new Date(isoDate).getTime();
    if (Number.isNaN(t)) return false;
    return t >= start.getTime() && t <= end.getTime();
  };

  const currentOrders = input.orders.filter((o) =>
    inRange(o.createdAt, windowInfo.currentStart, windowInfo.currentEnd)
  );
  const previousOrders = input.orders.filter((o) =>
    inRange(o.createdAt, windowInfo.previousStart, windowInfo.previousEnd)
  );

  // Exclude Cancelled orders from revenue and AOV calculations
  const nonCancelledCurrent = currentOrders.filter(
    (o) => o.status !== "Cancelled"
  );
  const nonCancelledPrevious = previousOrders.filter(
    (o) => o.status !== "Cancelled"
  );

  const currentRevenue = nonCancelledCurrent.reduce(
    (sum, o) => sum + o.totals.grandTotal,
    0
  );
  const previousRevenue = nonCancelledPrevious.reduce(
    (sum, o) => sum + o.totals.grandTotal,
    0
  );

  const currentOrderCount = currentOrders.length;
  const previousOrderCount = previousOrders.length;

  const currentCustomers = input.users.filter(
    (u) =>
      u.role !== "admin" &&
      inRange(u.createdAt, windowInfo.currentStart, windowInfo.currentEnd)
  ).length;
  const previousCustomers = input.users.filter(
    (u) =>
      u.role !== "admin" &&
      inRange(u.createdAt, windowInfo.previousStart, windowInfo.previousEnd)
  ).length;

  const totalCustomerCount = input.users.filter(
    (u) => u.role !== "admin"
  ).length;

  const currentAov =
    nonCancelledCurrent.length > 0
      ? Math.round(currentRevenue / nonCancelledCurrent.length)
      : 0;
  const previousAov =
    nonCancelledPrevious.length > 0
      ? Math.round(previousRevenue / nonCancelledPrevious.length)
      : 0;

  // Revenue over time buckets
  const bucketCount = Math.min(windowInfo.days, 14);
  const stepDays = Math.max(1, Math.ceil(windowInfo.days / bucketCount));
  const revenueOverTime: RevenueTimePoint[] = [];

  for (let i = 0; i < windowInfo.days; i += stepDays) {
    const bucketStart = new Date(windowInfo.currentStart);
    bucketStart.setDate(bucketStart.getDate() + i);
    bucketStart.setHours(0, 0, 0, 0);

    const bucketEnd = new Date(bucketStart);
    bucketEnd.setDate(bucketEnd.getDate() + stepDays - 1);
    bucketEnd.setHours(23, 59, 59, 999);
    if (bucketEnd > windowInfo.currentEnd) {
      bucketEnd.setTime(windowInfo.currentEnd.getTime());
    }

    const matching = nonCancelledCurrent.filter((o) =>
      inRange(o.createdAt, bucketStart, bucketEnd)
    );
    const rev = matching.reduce((sum, o) => sum + o.totals.grandTotal, 0);
    const dateKey = bucketStart.toISOString().slice(0, 10);
    const label = bucketStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    revenueOverTime.push({
      date: dateKey,
      label,
      revenue: rev,
      orders: matching.length,
    });
  }

  // Orders by status (Donut chart)
  const statusPalette: Record<OrderStatus, string> = {
    Pending: "#f59e0b",
    Confirmed: "#3b82f6",
    Shipped: "#8b5cf6",
    Delivered: "#10b981",
    Cancelled: "#ef4444",
  };
  const allStatuses: OrderStatus[] = [
    "Pending",
    "Confirmed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];
  const ordersForCharts =
    currentOrders.length > 0 ? currentOrders : input.orders;
  const ordersByStatus: OrderStatusStat[] = allStatuses.map((status) => ({
    status,
    count: ordersForCharts.filter((o) => o.status === status).length,
    fill: statusPalette[status],
  }));

  // Sales by brand (HP vs Dell) & Top 5 selling products
  const nonCancelledForCharts = ordersForCharts.filter(
    (o) => o.status !== "Cancelled"
  );
  const brandStats: Record<"HP" | "Dell", BrandSalesStat> = {
    HP: { brand: "HP", revenue: 0, units: 0 },
    Dell: { brand: "Dell", revenue: 0, units: 0 },
  };
  const productTotals = new Map<string, TopProductStat>();

  for (const order of nonCancelledForCharts) {
    for (const item of order.items) {
      if (item.brand === "TK Accessory") continue;
      const brandKey = item.brand === "Dell" ? "Dell" : "HP";
      const lineRevenue = item.lineTotal ?? item.unitPrice * item.quantity;
      brandStats[brandKey].revenue += lineRevenue;
      brandStats[brandKey].units += item.quantity;

      const existing = productTotals.get(item.productId);
      if (existing) {
        existing.unitsSold += item.quantity;
        existing.revenue += lineRevenue;
      } else {
        productTotals.set(item.productId, {
          productId: item.productId,
          slug: item.slug,
          name: item.name,
          brand: brandKey,
          image: item.image,
          unitsSold: item.quantity,
          revenue: lineRevenue,
        });
      }
    }
  }

  // Fallback to seed catalog popularity if no orders have been placed yet
  if (productTotals.size === 0) {
    for (const prod of input.products.slice(0, 5)) {
      productTotals.set(prod.id, {
        productId: prod.id,
        slug: prod.slug,
        name: prod.name,
        brand: prod.brand,
        image: prod.images[0] ?? "/images/laptops/hp-business.svg",
        unitsSold: 0,
        revenue: 0,
      });
    }
  }

  const topSellingProducts = [...productTotals.values()]
    .sort((a, b) => b.revenue - a.revenue || b.unitsSold - a.unitsSold)
    .slice(0, 5);

  const recentOrders = [...input.orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  const lowStockAlerts: LowStockAlertItem[] = input.products
    .filter((p) => p.stock <= input.lowStockThreshold)
    .sort((a, b) => a.stock - b.stock)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      stock: p.stock,
      price: p.price,
      image: p.images[0] ?? "/images/laptops/hp-business.svg",
    }));

  const ordersAwaitingConfirmation = input.orders.filter(
    (o) => o.status === "Pending"
  ).length;
  const pendingBankTransfers = input.orders.filter(
    (o) =>
      o.paymentMethodId === "bank_transfer" &&
      o.paymentStatus !== "Paid" &&
      o.paymentStatus !== "Refunded" &&
      o.status !== "Cancelled"
  ).length;
  const unapprovedReviews = input.reviews.filter(
    (r) => (r.status ?? "Approved") === "Pending"
  ).length;

  return {
    rangeLabel: windowInfo.label,
    kpis: {
      revenue: buildMetric(currentRevenue, previousRevenue),
      orders: buildMetric(currentOrderCount, previousOrderCount),
      customers: {
        value: currentCustomers > 0 ? currentCustomers : totalCustomerCount,
        previousValue: previousCustomers,
        percentChange: calcPercentChange(currentCustomers, previousCustomers),
      },
      averageOrderValue: buildMetric(currentAov, previousAov),
    },
    revenueOverTime,
    ordersByStatus,
    salesByBrand: [brandStats.HP, brandStats.Dell],
    topSellingProducts,
    recentOrders,
    lowStockAlerts,
    pendingActions: {
      ordersAwaitingConfirmation,
      pendingBankTransfers,
      unapprovedReviews,
      totalPending:
        ordersAwaitingConfirmation + pendingBankTransfers + unapprovedReviews,
    },
  };
}
