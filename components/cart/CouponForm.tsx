"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Tag, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { COUPONS } from "@/data/coupons";
import type { CouponValidationResult } from "@/lib/cart";
import { formatPrice } from "@/lib/config";
import { useCartStore } from "@/store/cartStore";

interface CouponFormProps {
  appliedCouponCode: string | null;
  couponValidation: CouponValidationResult | null;
}

/**
 * Promo / Coupon form with apply & remove handlers, clear error/success messages,
 * automatic invalidation feedback if cart subtotal drops below minimum order,
 * and quick-apply pills for discoverability.
 */
export function CouponForm({
  appliedCouponCode,
  couponValidation,
}: CouponFormProps) {
  const [inputCode, setInputCode] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = applyCoupon(inputCode);
    if (result.valid) {
      setFeedback({ type: "success", message: result.message });
      setInputCode("");
    } else {
      setFeedback({ type: "error", message: result.message });
    }
  };

  const handleQuickApply = (code: string) => {
    setInputCode(code);
    const result = applyCoupon(code);
    if (result.valid) {
      setFeedback({ type: "success", message: result.message });
      setInputCode("");
    } else {
      setFeedback({ type: "error", message: result.message });
    }
  };

  const handleRemove = () => {
    removeCoupon();
    setFeedback(null);
  };

  const activeCoupons = COUPONS.filter(
    (c) => new Date(c.expiresAt).getTime() > Date.now()
  );

  // Detect when an applied coupon stops being valid because cart total dropped below minOrderAmount
  const appliedCouponStoppedBeingValid =
    Boolean(appliedCouponCode) &&
    couponValidation !== null &&
    !couponValidation.valid;

  return (
    <div className="space-y-3 border-t border-border/60 pt-4">
      <div className="flex items-center justify-between">
        <label
          htmlFor="cart-coupon-input"
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          <Tag className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span>Promo / Coupon Code</span>
        </label>
      </div>

      {/* Currently Applied Valid Coupon Pill */}
      {appliedCouponCode && couponValidation?.valid && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <div>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                {appliedCouponCode}
              </span>
              <span className="ml-1.5 text-muted-foreground">
                (-{formatPrice(couponValidation.discountAmount)})
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            aria-label={`Remove coupon ${appliedCouponCode}`}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
          >
            <X className="h-3.5 w-3.5" />
            <span>Remove</span>
          </button>
        </div>
      )}

      {/* Warning when previously applied coupon is no longer valid due to subtotal change */}
      {appliedCouponStoppedBeingValid && couponValidation && (
        <div
          role="alert"
          className="flex items-start justify-between gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-700 dark:text-amber-300"
        >
          <div className="flex items-start gap-2">
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span>{couponValidation.message}</span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove inactive coupon"
            className="shrink-0 font-semibold underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          id="cart-coupon-input"
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.toUpperCase())}
          placeholder="Enter code (e.g. TK10)"
          className="h-10 flex-1 rounded-xl border border-input bg-surface px-3.5 text-xs font-semibold uppercase tracking-wider text-foreground placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="h-10 rounded-xl px-4 text-xs font-semibold"
        >
          Apply
        </Button>
      </form>

      {/* Form Validation Feedback */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Quick Available Coupons */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] text-muted-foreground">Try:</span>
        {activeCoupons.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => handleQuickApply(c.code)}
            title={c.description}
            className="rounded-md border border-dashed border-accent/40 bg-accent/5 px-2 py-0.5 text-[11px] font-bold text-accent transition-colors hover:bg-accent/15"
          >
            {c.code}
          </button>
        ))}
      </div>
    </div>
  );
}
