import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  DollarSign,
  Plus,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { DashboardCharts } from "@/components/admin/charts/DashboardCharts";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdminPage } from "@/lib/admin/guard";
import {
  computeAdminDashboardStats,
  type AdminDateRangePreset,
} from "@/lib/admin/stats";
import { formatPrice, getSettings } from "@/lib/config";
import { getAllOrders } from "@/lib/orders";
import { getAllProducts } from "@/lib/productStore";
import { getAllReviews } from "@/lib/reviewStore";
import { getAllSafeUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

interface AdminDashboardPageProps {
  searchParams: Promise<{
    range?: string;
    from?: string;
    to?: string;
  }>;
}

const PRESETS: { id: AdminDateRangePreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
];

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  await requireAdminPage();
  const params = await searchParams;
  const preset = (params.range ?? "30d") as AdminDateRangePreset;
  const from = params.from;
  const to = params.to;

  const settings = getSettings();
  const stats = computeAdminDashboardStats({
    orders: getAllOrders(),
    users: getAllSafeUsers(),
    products: getAllProducts({ includeDrafts: true }),
    reviews: getAllReviews(),
    lowStockThreshold: settings.shipping.lowStockThreshold,
    filter: {
      preset,
      from,
      to,
    },
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Delivered":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
      case "Shipped":
        return "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300";
      case "Confirmed":
        return "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300";
      case "Cancelled":
        return "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300";
      default:
        return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header & Date Range Selector */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
            Store Overview &amp; Analytics
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Showing metrics for{" "}
            <strong className="text-foreground">{stats.rangeLabel}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Preset Buttons */}
          <div className="inline-flex rounded-xl border border-border/80 bg-surface p-1">
            {PRESETS.map((item) => {
              const active = preset === item.id;
              return (
                <Link
                  key={item.id}
                  href={`/admin?range=${item.id}`}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    active
                      ? "bg-accent text-accent-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Custom Date Range Form */}
          <form
            action="/admin"
            method="get"
            className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border/80 bg-surface px-2.5 py-1 text-xs"
          >
            <input type="hidden" name="range" value="custom" />
            <input
              type="date"
              name="from"
              defaultValue={from}
              aria-label="Start date"
              className="rounded bg-transparent px-1 py-0.5 text-xs text-foreground focus:outline-none"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              name="to"
              defaultValue={to}
              aria-label="End date"
              className="rounded bg-transparent px-1 py-0.5 text-xs text-foreground focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-md bg-accent/15 px-2 py-0.5 font-bold text-accent hover:bg-accent/25"
            >
              Apply
            </button>
          </form>

          <Button
            asChild
            variant="accent"
            size="sm"
            className="h-9 gap-1.5 rounded-xl text-xs font-bold"
          >
            <Link href="/admin/products/new">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Laptop</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          formattedValue={formatPrice(stats.kpis.revenue.value)}
          percentChange={stats.kpis.revenue.percentChange}
          icon={DollarSign}
        />
        <StatCard
          title="Total Orders"
          formattedValue={String(stats.kpis.orders.value)}
          percentChange={stats.kpis.orders.percentChange}
          icon={ShoppingBag}
        />
        <StatCard
          title="Customers"
          formattedValue={String(stats.kpis.customers.value)}
          percentChange={stats.kpis.customers.percentChange}
          icon={Users}
        />
        <StatCard
          title="Average Order Value"
          formattedValue={formatPrice(stats.kpis.averageOrderValue.value)}
          percentChange={stats.kpis.averageOrderValue.percentChange}
          icon={TrendingUp}
        />
      </div>

      {/* Pending Action Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/orders?status=Pending"
          className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 transition-colors hover:bg-amber-500/15"
        >
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-xs font-bold text-foreground">
                Orders Awaiting Confirmation
              </p>
              <p className="text-[11px] text-muted-foreground">
                Confirm to reserve inventory
              </p>
            </div>
          </div>
          <span className="font-heading text-xl font-extrabold text-amber-600 dark:text-amber-400">
            {stats.pendingActions.ordersAwaitingConfirmation}
          </span>
        </Link>

        <Link
          href="/admin/orders?paymentMethod=bank_transfer"
          className="flex items-center justify-between rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 transition-colors hover:bg-blue-500/15"
        >
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xs font-bold text-foreground">
                Pending Bank Transfers
              </p>
              <p className="text-[11px] text-muted-foreground">
                Awaiting payment verification
              </p>
            </div>
          </div>
          <span className="font-heading text-xl font-extrabold text-blue-600 dark:text-blue-400">
            {stats.pendingActions.pendingBankTransfers}
          </span>
        </Link>

        <Link
          href="/admin/reviews?status=Pending"
          className="flex items-center justify-between rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4 transition-colors hover:bg-purple-500/15"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-xs font-bold text-foreground">
                Unapproved Reviews
              </p>
              <p className="text-[11px] text-muted-foreground">
                Moderate customer feedback
              </p>
            </div>
          </div>
          <span className="font-heading text-xl font-extrabold text-purple-600 dark:text-purple-400">
            {stats.pendingActions.unapprovedReviews}
          </span>
        </Link>
      </div>

      {/* Recharts Visualizations */}
      <DashboardCharts
        revenueOverTime={stats.revenueOverTime}
        ordersByStatus={stats.ordersByStatus}
        salesByBrand={stats.salesByBrand}
      />

      {/* Top 5 Selling Products & Low Stock Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Top 5 Selling Products */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card lg:col-span-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">
                Top 5 Selling Products
              </h3>
              <p className="text-xs text-muted-foreground">
                Ranked by revenue and units sold
              </p>
            </div>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              <span>All Products</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <ul className="divide-y divide-border/60">
            {stats.topSellingProducts.map((item, idx) => (
              <li
                key={item.productId}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-bold text-muted-foreground">
                    {idx + 1}
                  </span>
                  <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg bg-surface p-1">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={48}
                      height={36}
                      unoptimized={item.image.startsWith("/uploads/")}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/products/${item.productId}`}
                      className="truncate text-xs font-bold text-foreground hover:text-accent hover:underline block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-[11px] text-muted-foreground">
                      {item.brand} • {item.unitsSold} unit(s) sold
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-heading text-xs font-extrabold text-foreground">
                  {formatPrice(item.revenue)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card lg:col-span-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">
                Low Stock Alerts (≤ {settings.shipping.lowStockThreshold} units)
              </h3>
              <p className="text-xs text-muted-foreground">
                Restock soon to avoid out-of-stock disruptions
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-amber-500/40 bg-amber-500/10 text-xs text-amber-600 dark:text-amber-400"
            >
              {stats.lowStockAlerts.length} Alert(s)
            </Badge>
          </div>

          {stats.lowStockAlerts.length === 0 ? (
            <div className="rounded-xl bg-surface/60 p-6 text-center text-xs text-muted-foreground">
              All products have healthy stock levels above{" "}
              {settings.shipping.lowStockThreshold} units.
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {stats.lowStockAlerts.slice(0, 6).map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg bg-surface p-1">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={48}
                        height={36}
                        unoptimized={item.image.startsWith("/uploads/")}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-foreground">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.brand} • {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2.5">
                    <Badge
                      variant="outline"
                      className={
                        item.stock === 0
                          ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }
                    >
                      {item.stock === 0 ? "Out of Stock" : `${item.stock} left`}
                    </Badge>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-lg px-2.5 text-[11px] font-semibold"
                    >
                      <Link href={`/admin/products/${item.id}`}>Edit</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Orders Table (Latest 8) */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border/60 p-5">
          <div>
            <h3 className="font-heading text-base font-bold text-foreground">
              Recent Orders (Latest 8)
            </h3>
            <p className="text-xs text-muted-foreground">
              Latest customer transactions across the store
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 rounded-xl text-xs font-semibold"
          >
            <Link href="/admin/orders">View All Orders</Link>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-surface/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-xs text-muted-foreground"
                  >
                    No customer orders placed yet.
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-surface/40"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-foreground">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="hover:text-accent hover:underline"
                      >
                        {order.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">
                        {order.customer.fullName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {order.customer.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {order.totals.totalItems} item(s)
                    </td>
                    <td className="px-4 py-3 font-heading font-bold text-foreground">
                      {formatPrice(order.totals.grandTotal)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={getStatusBadgeClass(order.status)}
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-7 rounded-lg text-xs font-semibold text-accent"
                      >
                        <Link href={`/admin/orders/${order.id}`}>
                          Manage
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
