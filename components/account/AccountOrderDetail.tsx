"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  CreditCard,
  MapPin,
  Printer,
  RotateCcw,
  Truck,
} from "lucide-react";

import { getOrderStatusBadgeClasses } from "@/components/account/OrdersTable";
import { OrderTimeline } from "@/components/checkout/OrderTimeline";
import { resolveCatalogItem } from "@/lib/cart";
import { formatPrice } from "@/lib/config";
import type { OrderRecord } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AccountOrderDetailProps {
  order: OrderRecord;
}

/**
 * Full Order Detail view (/account/orders/[orderId]):
 * - Reuses <OrderTimeline />
 * - Includes Reorder button (respecting live stock) and Print Invoice button
 */
export function AccountOrderDetail({ order }: AccountOrderDetailProps) {
  const addItem = useCartStore((state) => state.addItem);
  const showToast = useCartStore((state) => state.showToast);
  const setMiniCartOpen = useCartStore((state) => state.setMiniCartOpen);

  const [copied, setCopied] = useState(false);

  const formattedDate = new Date(order.createdAt).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(order.id);
      setCopied(true);
      showToast(`Order ID ${order.id} copied to clipboard.`, "info");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  const handleReorder = () => {
    let addedUnits = 0;
    let skippedOutOfStock = 0;

    for (const line of order.items) {
      const liveItem = resolveCatalogItem(line.productId);
      if (!liveItem || liveItem.stock <= 0) {
        skippedOutOfStock += 1;
        continue;
      }

      const qtyToAdd = Math.min(line.quantity, liveItem.stock);
      const res = addItem(liveItem, qtyToAdd, {
        openMiniCart: false,
        silent: true,
      });
      if (res.added) {
        addedUnits += qtyToAdd;
      }
    }

    if (addedUnits > 0) {
      setMiniCartOpen(true);
      showToast(
        skippedOutOfStock > 0
          ? `Added ${addedUnits} available item(s) to your cart (${skippedOutOfStock} out-of-stock item skipped).`
          : `Added ${addedUnits} item(s) from order ${order.id} to your cart!`,
        "success"
      );
    } else {
      showToast(
        "Items from this order are currently out of stock or already at max stock in your cart.",
        "warning"
      );
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-9 rounded-xl px-3 text-xs font-semibold"
        >
          <Link href="/account/orders">
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
            <span>Back to All Orders</span>
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-10 rounded-xl px-4 text-xs font-semibold"
          >
            <Printer className="mr-1.5 h-4 w-4" aria-hidden="true" />
            <span>Print Invoice</span>
          </Button>

          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={handleReorder}
            className="h-10 rounded-xl px-4 text-xs font-bold shadow-sm"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
            <span>Reorder Items</span>
          </Button>
        </div>
      </div>

      {/* Order Header Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-card">
        <div className="flex flex-col justify-between gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-mono text-xl font-bold text-foreground sm:text-2xl">
                {order.id}
              </h1>
              <button
                type="button"
                onClick={handleCopyOrderId}
                aria-label="Copy Order ID"
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground print:hidden"
              >
                {copied ? (
                  <>
                    <Check
                      className="h-3.5 w-3.5 text-emerald-500"
                      aria-hidden="true"
                    />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold",
                  getOrderStatusBadgeClasses(order.status)
                )}
              >
                {order.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Placed on {formattedDate} • Estimated Delivery:{" "}
              <strong className="text-foreground">
                {order.estimatedDelivery}
              </strong>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Grand Total
            </span>
            <span className="font-heading text-2xl font-extrabold text-accent">
              {formatPrice(order.totals.grandTotal)}
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="pt-6">
          <OrderTimeline
            status={order.status}
            createdAt={order.createdAt}
            estimatedDelivery={order.estimatedDelivery}
          />
        </div>
      </div>

      {/* Ordered Items + Financial Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Items List */}
        <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-card lg:col-span-7">
          <h2 className="font-heading text-base font-bold text-foreground">
            Ordered Items ({order.totals.totalItems})
          </h2>

          <div className="divide-y divide-border/70">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-surface p-1.5">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={64}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant={
                          item.brand === "HP"
                            ? "hp"
                            : item.brand === "Dell"
                            ? "dell"
                            : "secondary"
                        }
                      >
                        {item.brand}
                      </Badge>
                    </div>
                    <Link
                      href={`/laptops/${item.slug}`}
                      className="block font-heading text-sm font-bold text-foreground hover:text-accent hover:underline"
                    >
                      {item.name}
                    </Link>
                    {item.specsSummary && (
                      <p className="text-xs text-muted-foreground">
                        {item.specsSummary}
                      </p>
                    )}
                    <p className="text-xs font-medium text-muted-foreground">
                      Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                </div>

                <p className="font-heading text-sm font-bold text-foreground">
                  {formatPrice(item.lineTotal)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-card lg:col-span-5">
          <h2 className="font-heading text-base font-bold text-foreground">
            Invoice Summary
          </h2>

          <dl className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-semibold text-foreground">
                {formatPrice(order.totals.subtotal)}
              </dd>
            </div>

            {order.totals.productSavings > 0 && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <dt>Instant Savings</dt>
                <dd className="font-semibold">
                  - {formatPrice(order.totals.productSavings)}
                </dd>
              </div>
            )}

            {order.totals.couponDiscount > 0 && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <dt>
                  Promo Code{" "}
                  {order.totals.couponCode
                    ? `(${order.totals.couponCode})`
                    : ""}
                </dt>
                <dd className="font-semibold">
                  - {formatPrice(order.totals.couponDiscount)}
                </dd>
              </div>
            )}

            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="font-semibold text-foreground">
                {order.totals.shipping === 0
                  ? "FREE"
                  : formatPrice(order.totals.shipping)}
              </dd>
            </div>

            {order.totals.codFee > 0 && (
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">COD Handling Fee</dt>
                <dd className="font-semibold text-foreground">
                  {formatPrice(order.totals.codFee)}
                </dd>
              </div>
            )}

            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Estimated Tax</dt>
              <dd className="font-semibold text-foreground">
                {formatPrice(order.totals.tax)}
              </dd>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold">
              <dt className="text-foreground">Grand Total</dt>
              <dd className="font-heading text-xl text-accent">
                {formatPrice(order.totals.grandTotal)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Addresses & Payment Info */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Shipping Address */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>Shipping Address</span>
          </div>
          <div className="mt-3 space-y-1 text-xs leading-relaxed text-muted-foreground">
            <p className="font-bold text-foreground">
              {order.customer.fullName}
            </p>
            <p>{order.shippingAddress.streetAddress}</p>
            {order.shippingAddress.apartment && (
              <p>{order.shippingAddress.apartment}</p>
            )}
            <p>
              {order.shippingAddress.city},{" "}
              {order.shippingAddress.stateProvince}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
            <p className="pt-1 font-medium text-foreground/90">
              {order.customer.phone}
            </p>
          </div>
        </div>

        {/* Delivery Method */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Truck className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>Delivery Method</span>
          </div>
          <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            <p className="font-bold text-foreground">
              {order.deliveryMethodLabel}
            </p>
            <p>
              Estimated arrival:{" "}
              <strong className="text-foreground">
                {order.estimatedDelivery}
              </strong>
            </p>
            {order.notes && (
              <p className="rounded-xl bg-surface p-2.5 text-[11px]">
                <strong>Delivery Notes:</strong> {order.notes}
              </p>
            )}
          </div>
        </div>

        {/* Payment Details */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <CreditCard className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>Payment Information</span>
          </div>
          <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            <p className="font-bold text-foreground">
              {order.paymentMethodLabel}
            </p>
            <p>
              Payment Status:{" "}
              <strong className="text-foreground">{order.paymentStatus}</strong>
            </p>
            {order.paymentDetails?.cardLast4 && (
              <p className="font-mono text-foreground">
                {(order.paymentDetails.cardBrand ?? "Card").toUpperCase()} ••••{" "}
                {order.paymentDetails.cardLast4}
              </p>
            )}
            {order.paymentDetails?.walletPhone && (
              <p>Wallet Phone: {order.paymentDetails.walletPhone}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
