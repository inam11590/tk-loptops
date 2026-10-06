"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  CreditCard,
  Info,
  Smartphone,
} from "lucide-react";

import { CardForm } from "@/components/checkout/CardForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice, SITE_CONFIG, type PaymentMethodId } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  cardFormSchema,
  paymentStepSchema,
  type CardFormValues,
} from "@/lib/validations/checkout";

interface PaymentOptionsProps {
  selectedMethodId: PaymentMethodId;
  cardValues: CardFormValues;
  walletPhone: string;
  onSelectMethod: (methodId: PaymentMethodId) => void;
  onChangeCard: (next: Partial<CardFormValues>) => void;
  onChangeWalletPhone: (phone: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

/**
 * Step 3: Payment Method Selection
 * - Radio cards for Credit/Debit Card, Cash on Delivery, Bank Transfer, and Mobile Wallet
 * - Demo gateway disclaimer banner
 * - Validates card details (Luhn + expiry + CVV) or mobile wallet phone before advancing to Step 4
 */
export function PaymentOptions({
  selectedMethodId,
  cardValues,
  walletPhone,
  onSelectMethod,
  onChangeCard,
  onChangeWalletPhone,
  onBack,
  onContinue,
}: PaymentOptionsProps) {
  const [cardErrors, setCardErrors] = useState<
    Partial<Record<keyof CardFormValues, string>>
  >({});
  const [walletError, setWalletError] = useState<string | null>(null);

  const getMethodIcon = (id: PaymentMethodId) => {
    switch (id) {
      case "card":
        return CreditCard;
      case "cod":
        return Banknote;
      case "bank_transfer":
        return Building2;
      case "mobile_wallet":
        return Smartphone;
    }
  };

  const handleValidateAndContinue = () => {
    setCardErrors({});
    setWalletError(null);

    if (selectedMethodId === "card") {
      const parsed = cardFormSchema.safeParse(cardValues);
      if (!parsed.success) {
        const nextErrors: Partial<Record<keyof CardFormValues, string>> = {};
        for (const issue of parsed.error.issues) {
          const field = issue.path[0] as keyof CardFormValues;
          if (field && !nextErrors[field]) {
            nextErrors[field] = issue.message;
          }
        }
        setCardErrors(nextErrors);
        // Auto-focus first invalid card input
        const firstField = parsed.error.issues[0]?.path[0];
        if (firstField === "cardNumber") {
          document.getElementById("card-number")?.focus();
        } else if (firstField === "cardHolderName") {
          document.getElementById("card-holder-name")?.focus();
        } else if (firstField === "cardExpiry") {
          document.getElementById("card-expiry")?.focus();
        } else if (firstField === "cardCvv") {
          document.getElementById("card-cvv")?.focus();
        }
        return;
      }
    }

    if (selectedMethodId === "mobile_wallet") {
      const parsed = paymentStepSchema.safeParse({
        paymentMethodId: "mobile_wallet",
        walletPhone,
      });
      if (!parsed.success) {
        setWalletError(
          parsed.error.issues[0]?.message ??
            "Enter a valid mobile wallet phone number."
        );
        document.getElementById("wallet-phone-input")?.focus();
        return;
      }
    }

    onContinue();
  };

  return (
    <div className="space-y-6 rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-card">
      <div className="border-b border-border/60 pb-4">
        <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
          3. Select Payment Method
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Choose how you would like to pay for your order.
        </p>
      </div>

      {/* Clear Demo Checkout Disclaimer */}
      <div
        role="note"
        className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 p-3.5 text-xs text-foreground"
      >
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-accent"
          aria-hidden="true"
        />
        <div>
          <strong className="font-bold text-accent">Demo Checkout Notice:</strong>{" "}
          Payment gateway integration comes later. This is a demo checkout — no
          real charges will be made, and full card numbers are never stored or
          persisted to localStorage.
        </div>
      </div>

      {/* Payment Radio Cards */}
      <div
        role="radiogroup"
        aria-label="Payment methods"
        className="space-y-3.5"
      >
        {SITE_CONFIG.checkout.paymentMethods.map((method) => {
          const Icon = getMethodIcon(method.id);
          const isSelected = selectedMethodId === method.id;

          return (
            <div
              key={method.id}
              className={cn(
                "rounded-2xl border p-4 sm:p-5 transition-all",
                isSelected
                  ? "border-accent bg-accent/[0.04] ring-1 ring-accent"
                  : "border-border/80 bg-surface/50 hover:border-accent/40"
              )}
            >
              <label
                htmlFor={`payment-method-${method.id}`}
                className="flex cursor-pointer items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <input
                    id={`payment-method-${method.id}`}
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={isSelected}
                    onChange={() => onSelectMethod(method.id)}
                    className="mt-1 h-4 w-4 accent-blue-600"
                  />

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading text-sm sm:text-base font-bold text-foreground">
                        {method.label}
                      </span>
                      <Badge variant="secondary" className="text-[11px]">
                        {method.tagline}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {method.description}
                    </p>
                  </div>
                </div>

                {method.codFee > 0 ? (
                  <Badge variant="outline" className="shrink-0 text-xs">
                    + {formatPrice(method.codFee)} COD Fee
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="shrink-0 border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-300"
                  >
                    No Fee
                  </Badge>
                )}
              </label>

              {/* Expanded Details per Method */}
              {isSelected && method.id === "card" && (
                <CardForm
                  values={cardValues}
                  errors={cardErrors}
                  onChange={(next) => {
                    onChangeCard(next);
                    setCardErrors({});
                  }}
                />
              )}

              {isSelected && method.id === "cod" && (
                <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-200">
                  <p className="font-semibold">
                    Cash on Delivery Handling Fee:{" "}
                    {formatPrice(method.codFee)}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Pay in cash or via mobile POS terminal when our courier
                    delivers your factory-sealed laptop. Please have valid ID
                    ready at delivery.
                  </p>
                </div>
              )}

              {isSelected && method.id === "bank_transfer" && (
                <div className="mt-4 space-y-3 rounded-xl border border-border bg-surface p-4 text-xs">
                  <p className="font-bold text-foreground">
                    Official Corporate Bank Account Details:
                  </p>
                  <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Bank Name</dt>
                      <dd className="font-semibold text-foreground">
                        {SITE_CONFIG.checkout.bankDetails.bankName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Account Title</dt>
                      <dd className="font-semibold text-foreground">
                        {SITE_CONFIG.checkout.bankDetails.accountTitle}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Account Number</dt>
                      <dd className="font-mono font-semibold text-foreground">
                        {SITE_CONFIG.checkout.bankDetails.accountNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        Routing / SWIFT
                      </dt>
                      <dd className="font-mono font-semibold text-foreground">
                        {SITE_CONFIG.checkout.bankDetails.routingNumber} •{" "}
                        {SITE_CONFIG.checkout.bankDetails.swiftCode}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">IBAN</dt>
                      <dd className="font-mono font-semibold text-foreground">
                        {SITE_CONFIG.checkout.bankDetails.iban}
                      </dd>
                    </div>
                  </dl>
                  <p className="border-t border-border/60 pt-2.5 text-muted-foreground">
                    {SITE_CONFIG.checkout.bankDetails.instructions}
                  </p>
                </div>
              )}

              {isSelected && method.id === "mobile_wallet" && (
                <div className="mt-4 space-y-3 rounded-xl border border-border bg-surface p-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      {SITE_CONFIG.checkout.mobileWalletDetails.providerName}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      Merchant:{" "}
                      {SITE_CONFIG.checkout.mobileWalletDetails.merchantCode}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {SITE_CONFIG.checkout.mobileWalletDetails.instructions}
                  </p>
                  <div>
                    <label
                      htmlFor="wallet-phone-input"
                      className="mb-1.5 block text-xs font-semibold text-foreground"
                    >
                      Registered Mobile Wallet Number{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      id="wallet-phone-input"
                      type="tel"
                      placeholder="+1 415 555 0199"
                      value={walletPhone}
                      onChange={(e) => {
                        onChangeWalletPhone(e.target.value);
                        setWalletError(null);
                      }}
                      aria-invalid={Boolean(walletError)}
                      aria-describedby={
                        walletError ? "error-wallet-phone" : undefined
                      }
                    />
                    {walletError && (
                      <p
                        id="error-wallet-phone"
                        role="alert"
                        className="mt-1 text-xs font-medium text-rose-500"
                      >
                        {walletError}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
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
          Back to Delivery
        </Button>

        <Button
          type="button"
          variant="accent"
          size="lg"
          onClick={handleValidateAndContinue}
          className="font-semibold shadow-md shadow-blue-600/20"
        >
          <span>Review Order</span>
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
