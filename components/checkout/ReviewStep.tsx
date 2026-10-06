"use client";

import { useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowLeft,
  CreditCard,
  Edit3,
  Loader2,
  Lock,
  MapPin,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { CouponForm } from "@/components/cart/CouponForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CartTotals } from "@/lib/cart";
import {
  detectCardBrand,
  getDeliveryMethodConfig,
  getEstimatedDeliveryWindow,
  getPaymentMethodConfig,
  maskCardNumber,
} from "@/lib/checkout";
import {
  formatPrice,
  SITE_CONFIG,
  type DeliveryMethodId,
  type PaymentMethodId,
} from "@/lib/config";
import type {
  CardFormValues,
  ShippingStepValues,
} from "@/lib/validations/checkout";
import type { CheckoutStepNumber } from "@/store/checkoutStore";

interface ReviewStepProps {
  shippingData: ShippingStepValues;
  deliveryMethodId: DeliveryMethodId;
  paymentMethodId: PaymentMethodId;
  cardValues: CardFormValues;
  walletPhone: string;
  totals: CartTotals;
  isSubmitting: boolean;
  serverError: string | null;
  onEditStep: (step: CheckoutStepNumber) => void;
  onPlaceOrder: () => void;
}

/**
 * Step 4: Review and Place Order
 * - Displays Contact, Shipping Address, Billing Address, Delivery Method, Payment Method, and Items
 * - Provides an "Edit" link on every section to jump back to earlier steps
 * - Includes CouponForm so promo codes can be applied or changed before placing the order
 * - Requires Terms & Conditions checkbox and prevents double-submission while `isSubmitting` is true
 */
export function ReviewStep({
  shippingData,
  deliveryMethodId,
  paymentMethodId,
  cardValues,
  walletPhone,
  totals,
  isSubmitting,
  serverError,
  onEditStep,
  onPlaceOrder,
}: ReviewStepProps) {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  const deliveryMethod = getDeliveryMethodConfig(deliveryMethodId);
  const deliveryWindow = getEstimatedDeliveryWindow(deliveryMethodId);
  const paymentMethod = getPaymentMethodConfig(paymentMethodId);
  const cardBrand = detectCardBrand(cardValues.cardNumber);

  const billingAddr =
    shippingData.billingSameAsShipping || !shippingData.billingAddress
      ? shippingData.shippingAddress
      : shippingData.billingAddress;

  const handleConfirmOrder = () => {
    if (isSubmitting) return;
    if (!acceptTerms) {
      setTermsError(
        "Please accept the Terms & Conditions and Warranty Policy to place your order."
      );
      return;
    }
    setTermsError(null);
    onPlaceOrder();
  };

  return (
    <div className="space-y-6 rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-card">
      <div className="border-b border-border/60 pb-4">
        <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
          4. Review &amp; Place Your Order
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Verify your shipping details, delivery schedule, and payment method
          before confirming your order.
        </p>
      </div>

      {/* Server or Stock / Price Validation Alert */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 1. Contact & Shipping Address */}
        <div className="rounded-2xl border border-border/80 bg-surface/60 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>Shipping To</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Edit</span>
            </button>
          </div>

          <div className="mt-3 space-y-1 text-xs sm:text-sm">
            <p className="font-bold text-foreground">{shippingData.fullName}</p>
            <p className="text-muted-foreground">
              {shippingData.email} • {shippingData.phone}
            </p>
            <p className="pt-1 text-foreground/90">
              {shippingData.shippingAddress.streetAddress}
              {shippingData.shippingAddress.apartment
                ? `, ${shippingData.shippingAddress.apartment}`
                : ""}
            </p>
            <p className="text-foreground/90">
              {shippingData.shippingAddress.city},{" "}
              {shippingData.shippingAddress.stateProvince}{" "}
              {shippingData.shippingAddress.postalCode}
            </p>
            <p className="text-muted-foreground">
              {shippingData.shippingAddress.country}
            </p>
            {shippingData.deliveryNotes && (
              <p className="mt-2 rounded-lg bg-background/80 p-2 text-xs italic text-muted-foreground">
                Note: &ldquo;{shippingData.deliveryNotes}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* 2. Billing Address */}
        <div className="rounded-2xl border border-border/80 bg-surface/60 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>Billing Address</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Edit</span>
            </button>
          </div>

          <div className="mt-3 space-y-1 text-xs sm:text-sm">
            {shippingData.billingSameAsShipping ? (
              <Badge variant="secondary" className="mb-1 text-[11px]">
                Same as shipping address
              </Badge>
            ) : null}
            <p className="font-bold text-foreground">{shippingData.fullName}</p>
            <p className="text-foreground/90">
              {billingAddr.streetAddress}
              {billingAddr.apartment ? `, ${billingAddr.apartment}` : ""}
            </p>
            <p className="text-foreground/90">
              {billingAddr.city}, {billingAddr.stateProvince}{" "}
              {billingAddr.postalCode}
            </p>
            <p className="text-muted-foreground">{billingAddr.country}</p>
          </div>
        </div>

        {/* 3. Delivery Method */}
        <div className="rounded-2xl border border-border/80 bg-surface/60 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Truck className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>Delivery Method</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Edit</span>
            </button>
          </div>

          <div className="mt-3 space-y-1 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">
                {deliveryMethod.label}
              </span>
              <span className="font-bold text-foreground">
                {totals.shipping === 0
                  ? "FREE"
                  : formatPrice(totals.shipping)}
              </span>
            </div>
            <p className="text-muted-foreground">{deliveryMethod.tagline}</p>
            <p className="pt-1 text-xs font-semibold text-accent">
              Estimated Arrival: {deliveryWindow.label}
            </p>
          </div>
        </div>

        {/* 4. Payment Method */}
        <div className="rounded-2xl border border-border/80 bg-surface/60 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <CreditCard className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>Payment Method</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Edit</span>
            </button>
          </div>

          <div className="mt-3 space-y-1 text-xs sm:text-sm">
            <p className="font-bold text-foreground">{paymentMethod.label}</p>
            {paymentMethodId === "card" && (
              <p className="font-mono text-xs text-muted-foreground">
                {cardBrand.toUpperCase()} •{" "}
                {maskCardNumber(cardValues.cardNumber)} (
                {cardValues.cardHolderName || shippingData.fullName})
              </p>
            )}
            {paymentMethodId === "cod" && (
              <p className="text-xs text-muted-foreground">
                Pay upon courier arrival (+
                {formatPrice(SITE_CONFIG.shipping.codHandlingFee)} COD handling
                fee)
              </p>
            )}
            {paymentMethodId === "bank_transfer" && (
              <p className="text-xs text-muted-foreground">
                {SITE_CONFIG.checkout.bankDetails.bankName} (Acct:{" "}
                {SITE_CONFIG.checkout.bankDetails.accountNumber})
              </p>
            )}
            {paymentMethodId === "mobile_wallet" && (
              <p className="text-xs text-muted-foreground">
                Wallet Phone: {walletPhone}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Order Items Review */}
      <div className="space-y-3 border-t border-border/60 pt-5">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Order Items ({totals.totalItems})
          </h3>
        </div>

        <div className="divide-y divide-border/60 rounded-2xl border border-border/80 bg-surface/40 px-4">
          {totals.reconciledItems.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between gap-4 py-3.5"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-background p-1.5">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="64px"
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
                    <span className="text-xs font-semibold text-muted-foreground">
                      Qty: {item.effectiveQuantity}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate font-heading text-sm font-bold text-foreground">
                    {item.name}
                  </p>
                  {item.specsSummary && (
                    <p className="truncate text-xs text-muted-foreground">
                      {item.specsSummary}
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span className="font-heading text-sm font-extrabold text-foreground">
                  {formatPrice(item.lineTotal)}
                </span>
                {item.effectiveQuantity > 1 && (
                  <span className="block text-[11px] text-muted-foreground">
                    {formatPrice(item.currentPrice)} each
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Code Adjustment Section */}
      <CouponForm
        appliedCouponCode={totals.couponCode}
        couponValidation={totals.couponValidation}
      />

      {/* Terms and Conditions Checkbox */}
      <div className="rounded-xl border border-border/80 bg-surface/60 p-4">
        <label className="flex cursor-pointer items-start gap-3 text-xs sm:text-sm">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => {
              setAcceptTerms(e.target.checked);
              if (e.target.checked) setTermsError(null);
            }}
            aria-invalid={Boolean(termsError)}
            className="mt-0.5 h-4 w-4 rounded border-border accent-blue-600"
          />
          <span className="text-muted-foreground leading-relaxed">
            I agree to the{" "}
            <strong className="text-foreground">
              {SITE_CONFIG.name} Terms of Sale
            </strong>
            ,{" "}
            <strong className="text-foreground">
              {SITE_CONFIG.shipping.warrantyText}
            </strong>
            , and 7-day return policy. I understand this is a demo order.{" "}
            <span className="text-rose-500">*</span>
          </span>
        </label>
        {termsError && (
          <p role="alert" className="mt-2 text-xs font-semibold text-rose-500">
            {termsError}
          </p>
        )}
      </div>

      {/* Place Order Footer */}
      <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isSubmitting}
          onClick={() => onEditStep(3)}
          className="font-semibold"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back to Payment
        </Button>

        <Button
          type="button"
          variant="accent"
          size="lg"
          disabled={isSubmitting || totals.totalItems === 0}
          onClick={handleConfirmOrder}
          className="min-w-[220px] font-semibold shadow-lg shadow-blue-600/25"
        >
          {isSubmitting ? (
            <>
              <Loader2
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
              <span>Placing Your Order...</span>
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Place Order • {formatPrice(totals.grandTotal)}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
