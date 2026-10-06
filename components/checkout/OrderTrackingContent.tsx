"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  MapPin,
  PackageSearch,
  Search,
  Sparkles,
  Truck,
} from "lucide-react";

import { OrderTimeline } from "@/components/checkout/OrderTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/config";
import type { OrderRecord } from "@/lib/orders";

/**
 * Interactive Order Tracking Lookup component (/orders/track):
 * - Form with Order ID and Customer Email
 * - Auto-runs lookup if `?orderId=...` is passed in the URL
 * - Includes a one-click sample order button (`TK-20261005-1042`) for instant testing
 * - Displays OrderTimeline, shipment details, and ordered items, or a friendly error when not found
 */
export function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") ?? "";
  const initialEmail = searchParams.get("email") ?? "";

  const [orderId, setOrderId] = useState(initialOrderId);
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderRecord | null>(null);

  const performLookup = useCallback(
    async (lookupId: string, lookupEmail: string) => {
      const trimmedId = lookupId.trim();
      if (!trimmedId) {
        setError("Please enter your Order ID (e.g. TK-20261005-1042).");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ orderId: trimmedId });
        if (lookupEmail.trim()) {
          params.set("email", lookupEmail.trim());
        }
        const res = await fetch(`/api/orders?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          setOrder(null);
          setError(
            data?.error ??
              "We couldn't find an order matching those details. Please double-check your Order ID and email."
          );
        } else {
          setOrder(data.order);
        }
      } catch {
        setError("Unable to reach the order tracking service. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (initialOrderId.trim()) {
      performLookup(initialOrderId, initialEmail);
    }
  }, [initialOrderId, initialEmail, performLookup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(orderId, email);
  };

  const handleFillDemoOrder = () => {
    const demoId = "TK-20261005-1042";
    const demoEmail = "alex@example.com";
    setOrderId(demoId);
    setEmail(demoEmail);
    performLookup(demoId, demoEmail);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      {/* Search Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <PackageSearch className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">
                Look Up Your Order
              </h2>
              <p className="text-xs text-muted-foreground">
                Enter the Order ID from your confirmation email or invoice.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFillDemoOrder}
            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-accent/40 bg-accent/5 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/15 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Try Sample Order (TK-20261005-1042)</span>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-12"
        >
          <div className="sm:col-span-5">
            <label
              htmlFor="track-order-id"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Order ID <span className="text-rose-500">*</span>
            </label>
            <Input
              id="track-order-id"
              type="text"
              placeholder="e.g. TK-20261005-1042"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              className="font-mono uppercase"
            />
          </div>

          <div className="sm:col-span-5">
            <label
              htmlFor="track-order-email"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Billing / Contact Email (Optional)
            </label>
            <Input
              id="track-order-email"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex items-end sm:col-span-2">
            <Button
              type="submit"
              variant="accent"
              disabled={isLoading}
              className="h-11 w-full font-semibold"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <>
                  <Search className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  <span>Track</span>
                </>
              )}
            </Button>
          </div>
        </form>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Lookup Result */}
      {order && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <OrderTimeline
            status={order.status}
            createdAt={order.createdAt}
            estimatedDelivery={order.estimatedDelivery}
          />

          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base sm:text-lg font-extrabold text-foreground">
                    {order.id}
                  </span>
                  <Badge variant="accent">{order.status}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Ordered by {order.customer.fullName} ({order.customer.email})
                </p>
              </div>

              <Button asChild variant="outline" size="sm" className="font-semibold">
                <Link href={`/order-confirmation/${order.id}`}>
                  <span>View Full Invoice</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 border-b border-border/60 pb-5 text-xs sm:text-sm">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  <span>Delivery Destination</span>
                </div>
                <p className="mt-1.5 font-semibold text-foreground">
                  {order.shippingAddress.streetAddress}
                  {order.shippingAddress.apartment
                    ? `, ${order.shippingAddress.apartment}`
                    : ""}
                </p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.stateProvince}{" "}
                  {order.shippingAddress.postalCode},{" "}
                  {order.shippingAddress.country}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Truck className="h-3.5 w-3.5 text-accent" />
                  <span>Courier &amp; Payment</span>
                </div>
                <p className="mt-1.5 font-semibold text-foreground">
                  {order.deliveryMethodLabel}
                </p>
                <p className="text-muted-foreground">
                  {order.paymentMethodLabel} ({order.paymentStatus}) • Total:{" "}
                  <strong className="text-foreground">
                    {formatPrice(order.totals.grandTotal)}
                  </strong>
                </p>
              </div>
            </div>

            {/* Items in Shipment */}
            <div className="mt-4 divide-y divide-border/60">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-surface p-1.5">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-heading text-sm font-bold text-foreground">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.brand} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 font-heading text-sm font-bold text-foreground">
                    {formatPrice(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
