"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Laptop,
  MapPin,
  Printer,
  Search,
  Smartphone,
  Truck,
} from "lucide-react";

import { OrderTimeline } from "@/components/checkout/OrderTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, SITE_CONFIG } from "@/lib/config";
import type { OrderRecord } from "@/lib/orders";

interface OrderSuccessProps {
  order: OrderRecord;
}

/**
 * Order Confirmation Page view (/order-confirmation/[orderId]):
 * - Animated checkmark badge, thank-you heading, Order ID with copy button, estimated delivery window
 * - Live OrderTimeline
 * - Bank Transfer or Mobile Wallet payment instructions if chosen
 * - Full items, shipping/billing addresses, delivery & payment breakdown, and totals
 * - "Continue Shopping", "Track Order", and "Print Invoice" (print-friendly CSS) buttons
 */
export function OrderSuccess({ order }: OrderSuccessProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handlePrintInvoice = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(order.createdAt));

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8 print:py-0">
      {/* Top Hero Confirmation Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 text-center shadow-card print:border-0 print:p-0 print:shadow-none">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 print:hidden"
        >
          <CheckCircle2 className="h-11 w-11" aria-hidden="true" />
        </motion.div>

        <Badge
          variant="outline"
          className="border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300"
        >
          Order Confirmed • Official Invoice
        </Badge>

        <h1 className="mt-3 font-heading text-2xl sm:text-4xl font-extrabold text-foreground">
          Thank you for your order, {order.customer.fullName}!
        </h1>

        <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
          A confirmation email has been dispatched to{" "}
          <strong className="text-foreground">{order.customer.email}</strong>.
          Your genuine HP/Dell hardware is backed by our{" "}
          {SITE_CONFIG.shipping.warrantyText}.
        </p>

        {/* Order Number + Copy + Estimated Delivery Pill */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-2.5">
            <span className="text-xs text-muted-foreground">Order ID:</span>
            <strong className="font-mono text-sm sm:text-base font-extrabold text-foreground">
              {order.id}
            </strong>
            <button
              type="button"
              onClick={handleCopyOrderId}
              aria-label="Copy Order ID"
              className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-colors print:hidden"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-accent">
            <Truck className="h-4 w-4" aria-hidden="true" />
            <span>Estimated Arrival: {order.estimatedDelivery}</span>
          </div>
        </div>

        {/* Account Created / Linked Banner */}
        {order.accountCreatedMessage && (
          <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-800 dark:text-emerald-200 print:hidden">
            <p>{order.accountCreatedMessage}</p>
            <Link
              href="/login"
              className="mt-1.5 inline-block font-bold underline hover:opacity-80"
            >
              Sign in to your account →
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 print:hidden">
          <Button asChild variant="accent" size="lg" className="font-semibold">
            <Link href="/laptops">
              <Laptop className="mr-2 h-4 w-4" aria-hidden="true" />
              Continue Shopping
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="font-semibold">
            <Link
              href={`/orders/track?orderId=${encodeURIComponent(
                order.id
              )}&email=${encodeURIComponent(order.customer.email)}`}
            >
              <Search className="mr-2 h-4 w-4" aria-hidden="true" />
              Track Order
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handlePrintInvoice}
            className="font-semibold"
          >
            <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
            Print Invoice
          </Button>
        </div>
      </div>

      {/* Live Order Status Timeline */}
      <div className="print:hidden">
        <OrderTimeline
          status={order.status}
          createdAt={order.createdAt}
          estimatedDelivery={order.estimatedDelivery}
        />
      </div>

      {/* Conditional Bank Transfer or Mobile Wallet Instructions */}
      {order.paymentMethodId === "bank_transfer" && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 font-heading text-base font-bold text-foreground">
            <Building2 className="h-5 w-5 text-amber-600" aria-hidden="true" />
            <span>Bank Transfer Instructions</span>
          </div>
          <p className="mt-1.5 text-muted-foreground">
            Please transfer{" "}
            <strong className="text-foreground">
              {formatPrice(order.totals.grandTotal)}
            </strong>{" "}
            using your Order ID{" "}
            <strong className="font-mono text-foreground">{order.id}</strong> as
            the payment reference:
          </p>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 rounded-xl bg-card/90 p-4 border border-border/70">
            <div>
              <dt className="text-xs text-muted-foreground">Bank Name</dt>
              <dd className="font-semibold text-foreground">
                {SITE_CONFIG.checkout.bankDetails.bankName}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Account Title</dt>
              <dd className="font-semibold text-foreground">
                {SITE_CONFIG.checkout.bankDetails.accountTitle}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Account Number</dt>
              <dd className="font-mono font-semibold text-foreground">
                {SITE_CONFIG.checkout.bankDetails.accountNumber}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Routing / SWIFT</dt>
              <dd className="font-mono font-semibold text-foreground">
                {SITE_CONFIG.checkout.bankDetails.routingNumber} /{" "}
                {SITE_CONFIG.checkout.bankDetails.swiftCode}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">IBAN</dt>
              <dd className="font-mono font-semibold text-foreground">
                {SITE_CONFIG.checkout.bankDetails.iban}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {order.paymentMethodId === "mobile_wallet" && (
        <div className="rounded-2xl border border-accent/40 bg-accent/10 p-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 font-heading text-base font-bold text-foreground">
            <Smartphone className="h-5 w-5 text-accent" aria-hidden="true" />
            <span>Mobile Wallet Authorization Instructions</span>
          </div>
          <p className="mt-1.5 text-muted-foreground">
            A payment prompt for{" "}
            <strong className="text-foreground">
              {formatPrice(order.totals.grandTotal)}
            </strong>{" "}
            has been sent to wallet number{" "}
            <strong className="font-mono text-foreground">
              {order.paymentDetails?.walletPhone}
            </strong>{" "}
            (Merchant Code:{" "}
            <strong className="font-mono text-foreground">
              {SITE_CONFIG.checkout.mobileWalletDetails.merchantCode}
            </strong>
            ).
          </p>
        </div>
      )}

      {/* Detailed Invoice Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
              Order &amp; Invoice Summary
            </h2>
            <p className="text-xs text-muted-foreground">
              Placed on {formattedDate}
            </p>
          </div>
          <div className="text-right text-xs">
            <span className="text-muted-foreground">Payment Status: </span>
            <Badge variant="secondary">{order.paymentStatus}</Badge>
          </div>
        </div>

        {/* Addresses & Methods Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 border-b border-border/60 pb-6 text-xs sm:text-sm">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-accent" />
              <span>Shipping Address</span>
            </div>
            <p className="mt-2 font-bold text-foreground">
              {order.customer.fullName}
            </p>
            <p className="text-foreground/90">
              {order.shippingAddress.streetAddress}
              {order.shippingAddress.apartment
                ? `, ${order.shippingAddress.apartment}`
                : ""}
            </p>
            <p className="text-foreground/90">
              {order.shippingAddress.city},{" "}
              {order.shippingAddress.stateProvince}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p className="text-muted-foreground">
              {order.shippingAddress.country}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {order.customer.phone}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Truck className="h-3.5 w-3.5 text-accent" />
              <span>Delivery Method</span>
            </div>
            <p className="mt-2 font-bold text-foreground">
              {order.deliveryMethodLabel}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Estimated Arrival: {order.estimatedDelivery}
            </p>
            {order.notes && (
              <p className="mt-2 text-xs italic text-muted-foreground">
                Note: &ldquo;{order.notes}&rdquo;
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5 text-accent" />
              <span>Payment Method</span>
            </div>
            <p className="mt-2 font-bold text-foreground">
              {order.paymentMethodLabel}
            </p>
            {order.paymentDetails?.cardLast4 && (
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {(order.paymentDetails.cardBrand ?? "Card").toUpperCase()} ending
                in •••• {order.paymentDetails.cardLast4}
              </p>
            )}
            {order.paymentDetails?.walletPhone && (
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Wallet: {order.paymentDetails.walletPhone}
              </p>
            )}
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="mt-6 divide-y divide-border/60">
          {order.items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-surface p-2 print:hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        item.brand === "HP"
                          ? "hp"
                          : item.brand === "Dell"
                          ? "dell"
                          : "secondary"
                      }
                      className="px-2 py-0 text-[10px]"
                    >
                      {item.brand}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                    </span>
                  </div>
                  <p className="mt-1 truncate font-heading text-sm sm:text-base font-bold text-foreground">
                    {item.name}
                  </p>
                  {item.specsSummary && (
                    <p className="truncate text-xs text-muted-foreground">
                      {item.specsSummary}
                    </p>
                  )}
                </div>
              </div>

              <span className="shrink-0 font-heading text-base font-extrabold text-foreground">
                {formatPrice(item.lineTotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals Footer */}
        <div className="mt-6 border-t border-border/80 pt-5 sm:ml-auto sm:max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal ({order.totals.totalItems} items)</span>
            <span className="font-semibold text-foreground">
              {formatPrice(order.totals.subtotal)}
            </span>
          </div>

          {order.totals.productSavings > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Deal Savings</span>
              <span className="font-semibold">
                - {formatPrice(order.totals.productSavings)}
              </span>
            </div>
          )}

          {order.totals.couponDiscount > 0 && order.totals.couponCode && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Promo ({order.totals.couponCode})</span>
              <span className="font-semibold">
                - {formatPrice(order.totals.couponDiscount)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span className="font-semibold text-foreground">
              {order.totals.shipping === 0
                ? "FREE"
                : formatPrice(order.totals.shipping)}
            </span>
          </div>

          {order.totals.codFee > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>COD Handling Fee</span>
              <span className="font-semibold text-foreground">
                {formatPrice(order.totals.codFee)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-muted-foreground">
            <span>Estimated Tax</span>
            <span className="font-semibold text-foreground">
              {formatPrice(order.totals.tax)}
            </span>
          </div>

          <div className="flex justify-between border-t border-border pt-3 font-heading text-lg font-extrabold text-foreground">
            <span>Grand Total</span>
            <span className="text-accent">
              {formatPrice(order.totals.grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
