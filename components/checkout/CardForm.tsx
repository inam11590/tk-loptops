"use client";

import { CreditCard, Lock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  detectCardBrand,
  formatCardExpiry,
  formatCardNumber,
  stripNonDigits,
  type CardBrand,
} from "@/lib/checkout";
import type { CardFormValues } from "@/lib/validations/checkout";

interface CardFormProps {
  values: CardFormValues;
  errors: Partial<Record<keyof CardFormValues, string>>;
  onChange: (next: Partial<CardFormValues>) => void;
}

const BRAND_LABELS: Record<CardBrand, string> = {
  visa: "VISA",
  mastercard: "Mastercard",
  amex: "AMEX",
  discover: "Discover",
  unknown: "Card",
};

/**
 * Mock Credit / Debit Card form with:
 * - Live card number formatting & Luhn checksum validation
 * - Automatic card brand detection badge (Visa, Mastercard, Amex, Discover)
 * - Expiry formatting (MM/YY) and non-expired validation
 * - CVV input
 * - One-click "Fill Demo Visa Card" helper for instant testing
 * - Strictly kept in memory; never persisted to localStorage.
 */
export function CardForm({ values, errors, onChange }: CardFormProps) {
  const brand = detectCardBrand(values.cardNumber);

  const handleFillDemoCard = () => {
    onChange({
      cardHolderName: "Alex Rivera",
      cardNumber: formatCardNumber("4242424242424242"),
      cardExpiry: "08/28",
      cardCvv: "424",
    });
  };

  return (
    <div className="mt-4 space-y-4 rounded-2xl border border-border/80 bg-surface/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
          <span>Encrypted Card Details (Demo Mode)</span>
        </div>

        <button
          type="button"
          onClick={handleFillDemoCard}
          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent hover:bg-accent/20 transition-colors"
        >
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          <span>Fill Demo Visa (4242)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Card Number */}
        <div className="sm:col-span-2">
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="card-number"
              className="text-xs font-semibold text-foreground"
            >
              Card Number <span className="text-rose-500">*</span>
            </label>
            <Badge
              variant={brand !== "unknown" ? "accent" : "secondary"}
              className="px-2 py-0 text-[10px]"
            >
              {BRAND_LABELS[brand]}
            </Badge>
          </div>

          <div className="relative">
            <Input
              id="card-number"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4242 •••• •••• 4242"
              value={values.cardNumber}
              onChange={(e) =>
                onChange({ cardNumber: formatCardNumber(e.target.value) })
              }
              aria-invalid={Boolean(errors.cardNumber)}
              aria-describedby={
                errors.cardNumber ? "error-card-number" : undefined
              }
              className="pr-12 font-mono tracking-wider"
            />
            <CreditCard
              className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          {errors.cardNumber && (
            <p
              id="error-card-number"
              role="alert"
              className="mt-1 text-xs font-medium text-rose-500"
            >
              {errors.cardNumber}
            </p>
          )}
        </div>

        {/* Name on Card */}
        <div className="sm:col-span-2">
          <label
            htmlFor="card-holder-name"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            Name on Card <span className="text-rose-500">*</span>
          </label>
          <Input
            id="card-holder-name"
            type="text"
            autoComplete="cc-name"
            placeholder="ALEX RIVERA"
            value={values.cardHolderName}
            onChange={(e) => onChange({ cardHolderName: e.target.value })}
            aria-invalid={Boolean(errors.cardHolderName)}
            aria-describedby={
              errors.cardHolderName ? "error-card-holder-name" : undefined
            }
          />
          {errors.cardHolderName && (
            <p
              id="error-card-holder-name"
              role="alert"
              className="mt-1 text-xs font-medium text-rose-500"
            >
              {errors.cardHolderName}
            </p>
          )}
        </div>

        {/* Expiry MM/YY */}
        <div>
          <label
            htmlFor="card-expiry"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            Expiry Date (MM/YY) <span className="text-rose-500">*</span>
          </label>
          <Input
            id="card-expiry"
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="08/28"
            maxLength={5}
            value={values.cardExpiry}
            onChange={(e) =>
              onChange({ cardExpiry: formatCardExpiry(e.target.value) })
            }
            aria-invalid={Boolean(errors.cardExpiry)}
            aria-describedby={
              errors.cardExpiry ? "error-card-expiry" : undefined
            }
            className="font-mono"
          />
          {errors.cardExpiry && (
            <p
              id="error-card-expiry"
              role="alert"
              className="mt-1 text-xs font-medium text-rose-500"
            >
              {errors.cardExpiry}
            </p>
          )}
        </div>

        {/* CVV */}
        <div>
          <label
            htmlFor="card-cvv"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            Security Code (CVV) <span className="text-rose-500">*</span>
          </label>
          <Input
            id="card-cvv"
            type="password"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder={brand === "amex" ? "4 digits" : "3 digits"}
            maxLength={4}
            value={values.cardCvv}
            onChange={(e) =>
              onChange({
                cardCvv: stripNonDigits(e.target.value).slice(0, 4),
              })
            }
            aria-invalid={Boolean(errors.cardCvv)}
            aria-describedby={errors.cardCvv ? "error-card-cvv" : undefined}
            className="font-mono"
          />
          {errors.cardCvv && (
            <p
              id="error-card-cvv"
              role="alert"
              className="mt-1 text-xs font-medium text-rose-500"
            >
              {errors.cardCvv}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
