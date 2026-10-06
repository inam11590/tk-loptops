"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Package,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";

import { formatPrice } from "@/lib/config";
import type { OrderRecord, OrderStatus } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface OrdersTableProps {
  orders: OrderRecord[];
}

const STATUS_FILTERS: Array<{ label: string; value: "ALL" | OrderStatus }> = [
  { label: "All Orders", value: "ALL" },
  { label: "Pending", value: "Pending" },
  { label: "Confirmed", value: "Confirmed" },
  { label: "Shipped", value: "Shipped" },
  { label: "Delivered", value: "Delivered" },
  { label: "Cancelled", value: "Cancelled" },
];

export function getOrderStatusBadgeClasses(status: OrderStatus): string {
  switch (status) {
    case "Delivered":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "Shipped":
      return "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300";
    case "Confirmed":
      return "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300";
    case "Cancelled":
      return "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300";
    default:
      return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }
}

const PAGE_SIZE = 5;

/**
 * Filterable, searchable, and paginated Orders list (/account/orders).
 * Shows status badges, formatted date, grand total (via formatPrice), item thumbnails, and link to order detail.
 */
export function OrdersTable({ orders }: OrdersTableProps) {
  const [statusFilter, setStatusFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== "ALL" && order.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      const matchesId = order.id.toLowerCase().includes(q);
      const matchesItem = order.items.some((item) =>
        item.name.toLowerCase().includes(q)
      );
      return matchesId || matchesItem;
    });
  }, [orders, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedOrders = filteredOrders.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-card">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <ShoppingBag className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-heading text-lg font-bold text-foreground">
          No Orders Yet
        </h2>
        <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
          When you purchase an HP or Dell laptop, your order history, live
          shipment status, and downloadable invoices will appear here.
        </p>
        <Button
          asChild
          variant="accent"
          size="sm"
          className="mt-6 h-10 rounded-xl px-5 text-xs font-bold"
        >
          <Link href="/laptops">Browse All Laptops</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter & Search Bar */}
      <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-4 shadow-card sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search by Order ID */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Order ID (e.g. TK-2026...)"
              aria-label="Search orders by Order ID or laptop name"
              className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-9 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <p className="text-xs font-medium text-muted-foreground">
            Showing <strong>{filteredOrders.length}</strong> of{" "}
            <strong>{orders.length}</strong>{" "}
            {orders.length === 1 ? "order" : "orders"}
          </p>
        </div>

        {/* Status Pills */}
        <div
          role="tablist"
          aria-label="Filter orders by status"
          className="flex flex-wrap gap-1.5"
        >
          {STATUS_FILTERS.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                  active
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "bg-surface text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {paginatedOrders.length === 0 ? (
        <div className="rounded-2xl border border-border/80 bg-card p-10 text-center shadow-card">
          <Package
            className="mx-auto h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="mt-3 font-heading text-sm font-bold text-foreground">
            No matching orders found
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try clearing your search query or switching the status filter.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setStatusFilter("ALL");
              setSearchQuery("");
              setPage(1);
            }}
            className="mt-4 h-9 rounded-xl px-4 text-xs font-semibold"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedOrders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              }
            );

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card transition-all hover:border-accent/40"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-surface/60 px-5 py-3.5">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div>
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Order ID
                      </span>
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="font-mono text-sm font-bold text-foreground hover:text-accent hover:underline"
                      >
                        {order.id}
                      </Link>
                    </div>

                    <div>
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Date Placed
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium text-foreground">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formattedDate}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Total
                      </span>
                      <span className="font-heading text-sm font-bold text-foreground">
                        {formatPrice(order.totals.grandTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold",
                        getOrderStatusBadgeClasses(order.status)
                      )}
                    >
                      {order.status}
                    </span>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-xl px-3.5 text-xs font-semibold"
                    >
                      <Link href={`/account/orders/${order.id}`}>
                        <span>View Details</span>
                        <ArrowRight
                          className="ml-1.5 h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Order Items Thumbnails & Summary */}
                <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex flex-wrap items-center gap-3">
                    {order.items.slice(0, 4).map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface/70 p-2 pr-3.5"
                      >
                        <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-background p-1">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={56}
                            height={48}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[200px] truncate text-xs font-bold text-foreground">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <span className="rounded-xl bg-secondary px-3 py-2 text-xs font-bold text-muted-foreground">
                        +{order.items.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground sm:text-right">
                    <p>
                      Est. Delivery:{" "}
                      <strong className="text-foreground">
                        {order.estimatedDelivery}
                      </strong>
                    </p>
                    <p className="mt-0.5">{order.paymentMethodLabel}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav
          aria-label="Orders pagination"
          className="flex items-center justify-between rounded-2xl border border-border/80 bg-card px-4 py-3 shadow-card"
        >
          <p className="text-xs text-muted-foreground">
            Page <strong>{safePage}</strong> of <strong>{totalPages}</strong>
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 rounded-xl px-2.5 text-xs font-semibold"
            >
              <ChevronLeft className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              <span>Prev</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 rounded-xl px-2.5 text-xs font-semibold"
            >
              <span>Next</span>
              <ChevronRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
