"use client";

import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Store,
  Truck,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  calculateDeliveryFee,
  getEstimatedDeliveryWindow,
} from "@/lib/checkout";
import {
  formatPrice,
  SITE_CONFIG,
  type DeliveryMethodId,
} from "@/lib/config";
import { cn } from "@/lib/utils";

interface DeliveryOptionsProps {
  selectedMethodId: DeliveryMethodId;
  subtotal: number;
  onSelectMethod: (methodId: DeliveryMethodId) => void;
  onBack: () => void;
  onContinue: () => void;
}

/**
 * Step 2: Delivery Method Selection
 * Radio cards for Standard Delivery (3–5 days), Express Delivery (1–2 days), and Store Pickup (free).
 * Displays live calculated fee and estimated arrival window.
 */
export function DeliveryOptions({
  selectedMethodId,
  subtotal,
  onSelectMethod,
  onBack,
  onContinue,
}: DeliveryOptionsProps) {
  const getMethodIcon = (id: DeliveryMethodId) => {
    if (id === "express") return Zap;
    if (id === "pickup") return Store;
    return Truck;
  };

  return (
    <div className="space-y-6 rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-card">
      <div className="border-b border-border/60 pb-4">
        <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
          2. Choose Delivery Method
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Every laptop shipment is fully insured and requires a signature upon
          delivery.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Delivery method options"
        className="space-y-3.5"
      >
        {SITE_CONFIG.checkout.deliveryMethods.map((method) => {
          const Icon = getMethodIcon(method.id);
          const isSelected = selectedMethodId === method.id;
          const fee = calculateDeliveryFee(method.id, subtotal);
          const windowInfo = getEstimatedDeliveryWindow(method.id);

          return (
            <label
              key={method.id}
              htmlFor={`delivery-method-${method.id}`}
              className={cn(
                "flex cursor-pointer flex-col justify-between gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:p-5 transition-all",
                isSelected
                  ? "border-accent bg-accent/[0.06] ring-1 ring-accent"
                  : "border-border/80 bg-surface/50 hover:border-accent/40 hover:bg-surface"
              )}
            >
              <div className="flex items-start gap-3.5">
                <input
                  id={`delivery-method-${method.id}`}
                  type="radio"
                  name="deliveryMethod"
                  value={method.id}
                  checked={isSelected}
                  onChange={() => onSelectMethod(method.id)}
                  className="mt-1 h-4 w-4 accent-blue-600"
                />

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-heading text-sm sm:text-base font-bold text-foreground">
                      {method.label}
                    </span>
                    <Badge variant="secondary" className="text-[11px]">
                      {method.tagline}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {method.description}
                  </p>

                  <div className="inline-flex items-center gap-1.5 pt-1 text-xs font-semibold text-foreground/90">
                    <Calendar
                      className="h-3.5 w-3.5 text-accent"
                      aria-hidden="true"
                    />
                    <span>Estimated: {windowInfo.label}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/50 pt-3 sm:border-0 sm:pt-0 sm:text-right">
                <span className="text-xs text-muted-foreground sm:hidden">
                  Delivery Fee
                </span>
                <div>
                  {fee === 0 ? (
                    <div className="flex flex-col sm:items-end">
                      <span className="inline-flex items-center gap-1 font-heading text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        FREE
                      </span>
                      {method.freeOverThreshold && method.fee > 0 && (
                        <span className="text-[11px] text-muted-foreground line-through">
                          {formatPrice(method.fee)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="font-heading text-base font-extrabold text-foreground">
                      {formatPrice(fee)}
                    </span>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {/* Step Navigation Buttons */}
      <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          className="font-semibold"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back to Shipping
        </Button>

        <Button
          type="button"
          variant="accent"
          size="lg"
          onClick={onContinue}
          className="font-semibold shadow-md shadow-blue-600/20"
        >
          <span>Continue to Payment</span>
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
