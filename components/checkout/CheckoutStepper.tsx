"use client";

import { Check, ClipboardCheck, CreditCard, MapPin, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheckoutStepNumber } from "@/store/checkoutStore";

interface CheckoutStepperProps {
  currentStep: CheckoutStepNumber;
  completedSteps: CheckoutStepNumber[];
  onSelectStep: (step: CheckoutStepNumber) => void;
}

const STEPS: {
  step: CheckoutStepNumber;
  title: string;
  shortTitle: string;
  icon: typeof MapPin;
}[] = [
  {
    step: 1,
    title: "Contact & Shipping",
    shortTitle: "Shipping",
    icon: MapPin,
  },
  {
    step: 2,
    title: "Delivery Method",
    shortTitle: "Delivery",
    icon: Truck,
  },
  {
    step: 3,
    title: "Payment Method",
    shortTitle: "Payment",
    icon: CreditCard,
  },
  {
    step: 4,
    title: "Review & Place Order",
    shortTitle: "Review",
    icon: ClipboardCheck,
  },
];

/**
 * Interactive 4-step progress stepper for /checkout.
 * Allows jumping back to any completed step or earlier step.
 */
export function CheckoutStepper({
  currentStep,
  completedSteps,
  onSelectStep,
}: CheckoutStepperProps) {
  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="grid grid-cols-4 gap-2 sm:gap-4">
        {STEPS.map((item) => {
          const Icon = item.icon;
          const isCurrent = currentStep === item.step;
          const isCompleted = completedSteps.includes(item.step);
          const isClickable = item.step < currentStep || isCompleted;

          return (
            <li key={item.step} className="relative">
              <button
                type="button"
                disabled={!isClickable && !isCurrent}
                onClick={() => {
                  if (isClickable) {
                    onSelectStep(item.step);
                  }
                }}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Step ${item.step}: ${item.title}${
                  isCompleted ? " (Completed)" : isCurrent ? " (Current)" : ""
                }`}
                className={cn(
                  "flex w-full flex-col items-start gap-2 rounded-2xl border p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isCurrent
                    ? "border-accent bg-accent/10 shadow-sm"
                    : isCompleted
                    ? "cursor-pointer border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/70"
                    : "cursor-not-allowed border-border/70 bg-card/60 opacity-60"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors",
                    isCurrent
                      ? "bg-accent text-accent-foreground"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>

                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Step {item.step}
                  </span>
                  <span className="block truncate font-heading text-xs sm:text-sm font-bold text-foreground">
                    <span className="sm:hidden">{item.shortTitle}</span>
                    <span className="hidden sm:inline">{item.title}</span>
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
