"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { DeliveryOptions } from "@/components/checkout/DeliveryOptions";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PaymentOptions } from "@/components/checkout/PaymentOptions";
import { ReviewStep } from "@/components/checkout/ReviewStep";
import { ShippingForm } from "@/components/checkout/ShippingForm";
import { useHydrated } from "@/hooks/use-hydrated";
import { calculateCartTotals } from "@/lib/cart";
import { detectCardBrand, stripNonDigits } from "@/lib/checkout";
import type { SafeUser } from "@/lib/users";
import type { CreateOrderPayload, ShippingStepValues } from "@/lib/validations/checkout";
import { useCartStore } from "@/store/cartStore";
import {
  useCheckoutStore,
  type CheckoutStepNumber,
} from "@/store/checkoutStore";

const STEP_NAMES: Record<CheckoutStepNumber, string> = {
  1: "Step 1: Contact and Shipping Information",
  2: "Step 2: Delivery Method Selection",
  3: "Step 3: Payment Method Selection",
  4: "Step 4: Review and Place Order",
};

/**
 * Multi-step Checkout orchestrator (/checkout):
 * - Redirects to /cart with a toast if the cart is empty (unless an order was just placed)
 * - Prefills logged-in user details and saved addresses
 * - Handles step transitions, keyboard focus management, and aria-live announcements
 * - Submits validated payload to POST /api/orders, clears cart, and redirects to /order-confirmation/[orderId]
 */
export function CheckoutFlow() {
  const router = useRouter();
  const hydrated = useHydrated();

  const items = useCartStore((state) => state.items);
  const couponCode = useCartStore((state) => state.couponCode);
  const clearCart = useCartStore((state) => state.clearCart);
  const showToast = useCartStore((state) => state.showToast);

  const currentStep = useCheckoutStore((state) => state.currentStep);
  const completedSteps = useCheckoutStore((state) => state.completedSteps);
  const shippingData = useCheckoutStore((state) => state.shippingData);
  const deliveryMethodId = useCheckoutStore((state) => state.deliveryMethodId);
  const paymentMethodId = useCheckoutStore((state) => state.paymentMethodId);
  const walletPhone = useCheckoutStore((state) => state.walletPhone);
  const transientCardData = useCheckoutStore(
    (state) => state.transientCardData
  );

  const setStep = useCheckoutStore((state) => state.setStep);
  const markStepCompleted = useCheckoutStore(
    (state) => state.markStepCompleted
  );
  const setShippingData = useCheckoutStore((state) => state.setShippingData);
  const setDeliveryMethodId = useCheckoutStore(
    (state) => state.setDeliveryMethodId
  );
  const setPaymentMethodId = useCheckoutStore(
    (state) => state.setPaymentMethodId
  );
  const setWalletPhone = useCheckoutStore((state) => state.setWalletPhone);
  const setTransientCardData = useCheckoutStore(
    (state) => state.setTransientCardData
  );
  const resetCheckout = useCheckoutStore((state) => state.resetCheckout);

  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [stepAnnouncement, setStepAnnouncement] = useState("");

  const orderJustPlacedRef = useRef(false);
  const stepContainerRef = useRef<HTMLDivElement>(null);

  // Fetch authenticated user for prefill & saved address picker
  useEffect(() => {
    fetch("/api/account/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { user?: SafeUser | null } | null) => {
        if (data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {
        // Guest user
      });
  }, []);

  // Redirect to /cart if cart is empty after hydration
  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0 && !orderJustPlacedRef.current) {
      showToast(
        "Your cart is empty. Please add a laptop before checking out.",
        "info"
      );
      router.replace("/cart");
    }
  }, [hydrated, items.length, router, showToast]);

  const navigateToStep = (nextStep: CheckoutStepNumber) => {
    setServerError(null);
    setStep(nextStep);
    setStepAnnouncement(`Now on ${STEP_NAMES[nextStep]}`);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setTimeout(() => {
      stepContainerRef.current?.focus();
    }, 60);
  };

  if (!hydrated || (items.length === 0 && !orderJustPlacedRef.current)) {
    return (
      <div className="space-y-6 py-8">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl border border-border/60 bg-secondary/40"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="h-[520px] animate-pulse rounded-2xl border border-border/60 bg-secondary/40 lg:col-span-8" />
          <div className="h-[420px] animate-pulse rounded-2xl border border-border/60 bg-secondary/40 lg:col-span-4" />
        </div>
      </div>
    );
  }

  const totals = calculateCartTotals(items, couponCode, {
    deliveryMethodId,
    paymentMethodId,
  });

  const handleShippingSubmit = (values: ShippingStepValues) => {
    setShippingData(values);
    markStepCompleted(1);
    navigateToStep(2);
  };

  const handleDeliveryContinue = () => {
    markStepCompleted(2);
    navigateToStep(3);
  };

  const handlePaymentContinue = () => {
    markStepCompleted(3);
    navigateToStep(4);
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setServerError(null);

    try {
      const cardDigits = stripNonDigits(transientCardData.cardNumber);
      const last4 = cardDigits.slice(-4).padStart(4, "0");
      const brand = detectCardBrand(transientCardData.cardNumber);

      const payload: CreateOrderPayload = {
        items: totals.reconciledItems
          .filter((i) => i.effectiveQuantity > 0)
          .map((i) => ({
            productId: i.productId,
            quantity: i.effectiveQuantity,
            expectedUnitPrice: i.currentPrice,
          })),
        shipping: shippingData,
        deliveryMethodId,
        paymentMethodId,
        walletPhone:
          paymentMethodId === "mobile_wallet" ? walletPhone : undefined,
        cardMeta:
          paymentMethodId === "card"
            ? {
                brand,
                last4,
                cardHolderName:
                  transientCardData.cardHolderName.trim() ||
                  shippingData.fullName,
              }
            : undefined,
        couponCode: totals.couponValidation?.valid ? couponCode : null,
        acceptTerms: true,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errMessage =
          data?.error ??
          "We could not process your order. Please verify your details and try again.";
        setServerError(errMessage);
        showToast(errMessage, "error");
        if (
          data?.step &&
          [1, 2, 3, 4].includes(Number(data.step)) &&
          Number(data.step) !== currentStep
        ) {
          setStep(Number(data.step) as CheckoutStepNumber);
        }
        setIsSubmitting(false);
        return;
      }

      // Mark order placed before clearing cart so empty-cart effect does not redirect to /cart
      orderJustPlacedRef.current = true;
      clearCart();
      resetCheckout();
      showToast(
        data?.accountCreatedMessage
          ? `Order #${data.order.id} placed! ${data.accountCreatedMessage}`
          : `Order #${data.order.id} placed successfully!`,
        "success"
      );
      router.push(`/order-confirmation/${data.order.id}`);
    } catch {
      const fallbackMsg =
        "Network error while placing your order. Please try again.";
      setServerError(fallbackMsg);
      showToast(fallbackMsg, "error");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6 sm:py-8">
      {/* Screen reader live region for step changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {stepAnnouncement}
      </div>

      {/* Top 4-Step Progress Stepper */}
      <CheckoutStepper
        currentStep={currentStep}
        completedSteps={completedSteps}
        onSelectStep={navigateToStep}
      />

      {/* Mobile Collapsible Order Summary + Desktop Two-Column Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Mobile Collapsible Summary renders inside OrderSummary on < lg */}
        <div className="lg:hidden">
          <OrderSummary totals={totals} />
        </div>

        {/* Left Column: Active Step Form */}
        <div
          ref={stepContainerRef}
          tabIndex={-1}
          className="focus:outline-none lg:col-span-8"
        >
          {currentStep === 1 && (
            <ShippingForm
              defaultValues={shippingData}
              currentUser={currentUser}
              onSubmitStep={handleShippingSubmit}
            />
          )}

          {currentStep === 2 && (
            <DeliveryOptions
              selectedMethodId={deliveryMethodId}
              subtotal={totals.subtotal}
              onSelectMethod={setDeliveryMethodId}
              onBack={() => navigateToStep(1)}
              onContinue={handleDeliveryContinue}
            />
          )}

          {currentStep === 3 && (
            <PaymentOptions
              selectedMethodId={paymentMethodId}
              cardValues={transientCardData}
              walletPhone={walletPhone}
              onSelectMethod={setPaymentMethodId}
              onChangeCard={setTransientCardData}
              onChangeWalletPhone={setWalletPhone}
              onBack={() => navigateToStep(2)}
              onContinue={handlePaymentContinue}
            />
          )}

          {currentStep === 4 && (
            <ReviewStep
              shippingData={shippingData}
              deliveryMethodId={deliveryMethodId}
              paymentMethodId={paymentMethodId}
              cardValues={transientCardData}
              walletPhone={walletPhone}
              totals={totals}
              isSubmitting={isSubmitting}
              serverError={serverError}
              onEditStep={navigateToStep}
              onPlaceOrder={handlePlaceOrder}
            />
          )}
        </div>

        {/* Right Column: Sticky Order Summary on Desktop */}
        <div className="hidden lg:block lg:col-span-4">
          <OrderSummary totals={totals} />
        </div>
      </div>
    </div>
  );
}
