"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateStoreSettingsAction } from "@/lib/actions/admin-actions";
import type { PaymentMethodId, StoreSettings } from "@/lib/config";
import {
  adminStoreSettingsSchema,
  type AdminStoreSettingsFormValues,
} from "@/lib/validations/admin";

const PAYMENT_METHOD_OPTIONS: { id: PaymentMethodId; label: string }[] = [
  { id: "card", label: "Credit or Debit Card" },
  { id: "cod", label: "Cash on Delivery (COD)" },
  { id: "bank_transfer", label: "Bank Transfer" },
  { id: "mobile_wallet", label: "Mobile Wallet (TK Pay)" },
];

interface SettingsFormClientProps {
  initialSettings: StoreSettings;
}

export function SettingsFormClient({
  initialSettings,
}: SettingsFormClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const form = useForm<AdminStoreSettingsFormValues>({
    resolver: zodResolver(
      adminStoreSettingsSchema
    ) as unknown as Resolver<AdminStoreSettingsFormValues>,
    defaultValues: {
      storeName: initialSettings.storeInfo.name,
      tagline: initialSettings.storeInfo.tagline,
      supportEmail: initialSettings.storeInfo.email,
      supportPhone: initialSettings.storeInfo.phone,
      address: initialSettings.storeInfo.address,
      hours: initialSettings.storeInfo.hours,
      currencyCode: initialSettings.currency.code,
      currencySymbol: initialSettings.currency.symbol,
      locale: initialSettings.currency.locale,
      freeDeliveryThreshold: initialSettings.shipping.freeDeliveryThreshold,
      standardShippingFee: initialSettings.shipping.flatShippingFee,
      expressShippingFee: initialSettings.shipping.expressShippingFee,
      taxRate: initialSettings.shipping.taxRate,
      lowStockThreshold: initialSettings.shipping.lowStockThreshold,
      codFee: initialSettings.shipping.codHandlingFee,
      warrantyText: initialSettings.shipping.warrantyText,
      enabledPaymentMethods: initialSettings.enabledPaymentMethods,
      bankDetails: {
        bankName: initialSettings.bankDetails.bankName,
        accountTitle: initialSettings.bankDetails.accountTitle,
        accountNumber: initialSettings.bankDetails.accountNumber,
        iban: initialSettings.bankDetails.iban,
        routingNumber: initialSettings.bankDetails.routingNumber,
        swiftCode: initialSettings.bankDetails.swiftCode,
        instructions: initialSettings.bankDetails.instructions,
      },
    },
  });

  const enabledMethods = form.watch("enabledPaymentMethods") ?? [];

  const handleTogglePaymentMethod = (methodId: PaymentMethodId) => {
    const exists = enabledMethods.includes(methodId);
    const next = exists
      ? enabledMethods.filter((id) => id !== methodId)
      : [...enabledMethods, methodId];
    form.setValue("enabledPaymentMethods", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (values: AdminStoreSettingsFormValues) => {
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await updateStoreSettingsAction(values);
      if (!res.success) {
        setFeedback({
          type: "error",
          text: res.error ?? "Failed to update settings.",
        });
        return;
      }
      setFeedback({
        type: "success",
        text: "Store settings saved! Storefront, cart, and checkout now reflect your new configuration.",
      });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-12">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
            Store Configuration &amp; Settings
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Configure store identity, currency, shipping thresholds, tax rates,
            and checkout payment methods.
          </p>
        </div>

        <Button
          type="submit"
          variant="accent"
          size="sm"
          disabled={submitting}
          className="h-9 gap-1.5 rounded-xl px-4 text-xs font-bold shadow-sm"
        >
          {submitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          <span>Save Settings</span>
        </Button>
      </div>

      {feedback && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-xl border p-4 text-xs font-semibold ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 6 Cols: Store Identity & Shipping / Tax */}
        <div className="space-y-6 lg:col-span-6">
          <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card">
            <h2 className="font-heading text-base font-bold text-foreground">
              Store Identity &amp; Contact
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Store Name *
                </label>
                <Input {...form.register("storeName")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Support Email *
                </label>
                <Input type="email" {...form.register("supportEmail")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Support Phone *
                </label>
                <Input {...form.register("supportPhone")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Business Hours *
                </label>
                <Input {...form.register("hours")} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Tagline *
                </label>
                <Input {...form.register("tagline")} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Store Physical Address *
                </label>
                <Input {...form.register("address")} />
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card">
            <h2 className="font-heading text-base font-bold text-foreground">
              Currency, Shipping, Tax &amp; Stock Alerts
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Currency Code
                </label>
                <Input {...form.register("currencyCode")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Currency Symbol
                </label>
                <Input {...form.register("currencySymbol")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Locale
                </label>
                <Input {...form.register("locale")} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Free Delivery Threshold ($)
                </label>
                <Input
                  type="number"
                  step="1"
                  {...form.register("freeDeliveryThreshold")}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Standard Shipping Fee ($)
                </label>
                <Input
                  type="number"
                  step="1"
                  {...form.register("standardShippingFee")}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Express Shipping Fee ($)
                </label>
                <Input
                  type="number"
                  step="1"
                  {...form.register("expressShippingFee")}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Tax Rate (e.g. 0.08 = 8%)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  {...form.register("taxRate")}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Low Stock Alert Threshold (Units)
                </label>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  {...form.register("lowStockThreshold")}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Cash on Delivery (COD) Fee ($)
                </label>
                <Input type="number" step="1" {...form.register("codFee")} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Default Warranty Text
                </label>
                <Input {...form.register("warrantyText")} />
              </div>
            </div>
          </section>
        </div>

        {/* Right 6 Cols: Payment Methods & Bank Transfer Details */}
        <div className="space-y-6 lg:col-span-6">
          <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card">
            <h2 className="font-heading text-base font-bold text-foreground">
              Enabled Checkout Payment Methods
            </h2>

            <div className="space-y-2">
              {PAYMENT_METHOD_OPTIONS.map((option) => {
                const checked = enabledMethods.includes(option.id);
                return (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-border/60 bg-surface/50 px-3.5 py-2.5 text-xs font-semibold"
                  >
                    <span>{option.label}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleTogglePaymentMethod(option.id)}
                      className="h-4 w-4 rounded accent-blue-600"
                    />
                  </label>
                );
              })}
              {errors.enabledPaymentMethods && (
                <p className="text-xs font-semibold text-rose-500">
                  {errors.enabledPaymentMethods.message as string}
                </p>
              )}
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card">
            <h2 className="font-heading text-base font-bold text-foreground">
              Corporate Bank Transfer Details
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Bank Name
                </label>
                <Input {...form.register("bankDetails.bankName")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Account Title
                </label>
                <Input {...form.register("bankDetails.accountTitle")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Account Number
                </label>
                <Input {...form.register("bankDetails.accountNumber")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Routing Number
                </label>
                <Input {...form.register("bankDetails.routingNumber")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  SWIFT Code
                </label>
                <Input {...form.register("bankDetails.swiftCode")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  IBAN
                </label>
                <Input {...form.register("bankDetails.iban")} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Payment Instructions
                </label>
                <textarea
                  rows={2}
                  {...form.register("bankDetails.instructions")}
                  className="flex w-full rounded-xl border border-input bg-surface px-3 py-2 text-xs text-foreground focus-visible:border-accent focus-visible:outline-none"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
