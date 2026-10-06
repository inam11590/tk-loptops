"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Sparkles,
  UserCheck,
} from "lucide-react";

import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE_CONFIG } from "@/lib/config";
import type { SavedAddress, SafeUser } from "@/lib/users";
import { cn } from "@/lib/utils";
import {
  shippingStepSchema,
  type ShippingStepValues,
} from "@/lib/validations/checkout";

interface ShippingFormProps {
  defaultValues: ShippingStepValues;
  currentUser?: SafeUser | null;
  onSubmitStep: (values: ShippingStepValues) => void;
}

/**
 * Step 1: Contact and Shipping Form
 * - Validated with React Hook Form + Zod (`shouldFocusError: true` auto-focuses first invalid field)
 * - Prefills logged-in user's name, email, phone, and default saved address
 * - Offers a one-click Saved Address Picker for logged-in users
 * - Supports Guest Checkout with working "Create an account" option
 */
export function ShippingForm({
  defaultValues,
  currentUser,
  onSubmitStep,
}: ShippingFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ShippingStepValues>({
    resolver: zodResolver(shippingStepSchema),
    defaultValues,
    shouldFocusError: true,
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  // Prefill from logged-in user if contact fields are still empty
  useEffect(() => {
    if (!currentUser) return;
    const currentEmail = watch("email");
    if (!currentEmail) {
      setValue("email", currentUser.email, { shouldValidate: true });
    }
    if (!watch("fullName")) {
      setValue("fullName", currentUser.fullName, { shouldValidate: true });
    }
    if (!watch("phone") && currentUser.phone) {
      setValue("phone", currentUser.phone, { shouldValidate: true });
    }

    const defaultAddr =
      currentUser.addresses.find((a) => a.isDefault) ??
      currentUser.addresses[0];
    if (defaultAddr && !watch("shippingAddress.streetAddress")) {
      setSelectedAddressId(defaultAddr.id);
      setValue("shippingAddress.streetAddress", defaultAddr.streetAddress, {
        shouldValidate: true,
      });
      setValue("shippingAddress.apartment", defaultAddr.apartment ?? "");
      setValue("shippingAddress.city", defaultAddr.city, {
        shouldValidate: true,
      });
      setValue("shippingAddress.stateProvince", defaultAddr.stateProvince, {
        shouldValidate: true,
      });
      setValue("shippingAddress.postalCode", defaultAddr.postalCode, {
        shouldValidate: true,
      });
      setValue("shippingAddress.country", defaultAddr.country, {
        shouldValidate: true,
      });
    }
  }, [currentUser, setValue, watch]);

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    if (addr.fullName) {
      setValue("fullName", addr.fullName, { shouldValidate: true });
    }
    if (addr.phone) {
      setValue("phone", addr.phone, { shouldValidate: true });
    }
    setValue("shippingAddress.streetAddress", addr.streetAddress, {
      shouldValidate: true,
    });
    setValue("shippingAddress.apartment", addr.apartment ?? "");
    setValue("shippingAddress.city", addr.city, { shouldValidate: true });
    setValue("shippingAddress.stateProvince", addr.stateProvince, {
      shouldValidate: true,
    });
    setValue("shippingAddress.postalCode", addr.postalCode, {
      shouldValidate: true,
    });
    setValue("shippingAddress.country", addr.country, { shouldValidate: true });
  };

  const billingSameAsShipping = watch("billingSameAsShipping");
  const createAccount = watch("createAccount");
  const accountPassword = watch("accountPassword") ?? "";

  return (
    <form
      onSubmit={handleSubmit(onSubmitStep)}
      noValidate
      className="space-y-8 rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-card"
    >
      {/* Contact Information */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <UserCheck className="h-5 w-5 text-accent" aria-hidden="true" />
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">
                1. Contact Information
              </h2>
              <p className="text-xs text-muted-foreground">
                We&apos;ll send your official invoice and live courier tracking
                updates here.
              </p>
            </div>
          </div>

          {currentUser ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Signed in as {currentUser.email}
            </span>
          ) : (
            <Link
              href="/login?callbackUrl=/checkout"
              className="text-xs font-semibold text-accent hover:underline"
            >
              Already have an account? Sign in
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="shipping-fullName"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Full Name <span className="text-rose-500">*</span>
            </label>
            <Input
              id="shipping-fullName"
              autoComplete="name"
              placeholder="e.g. Alex Rivera"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={
                errors.fullName ? "error-shipping-fullName" : undefined
              }
              {...register("fullName")}
            />
            {errors.fullName && (
              <p
                id="error-shipping-fullName"
                role="alert"
                className="mt-1 text-xs font-medium text-rose-500"
              >
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="shipping-email"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Email Address <span className="text-rose-500">*</span>
            </label>
            <Input
              id="shipping-email"
              type="email"
              autoComplete="email"
              placeholder="alex@company.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? "error-shipping-email" : undefined
              }
              {...register("email")}
            />
            {errors.email && (
              <p
                id="error-shipping-email"
                role="alert"
                className="mt-1 text-xs font-medium text-rose-500"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="shipping-phone"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Phone Number (for Courier SMS){" "}
              <span className="text-rose-500">*</span>
            </label>
            <Input
              id="shipping-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 (415) 555-0199"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={
                errors.phone ? "error-shipping-phone" : undefined
              }
              {...register("phone")}
            />
            {errors.phone && (
              <p
                id="error-shipping-phone"
                role="alert"
                className="mt-1 text-xs font-medium text-rose-500"
              >
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Guest Checkout + Optional Account Creation (Only shown when logged out) */}
        {!currentUser && (
          <div className="space-y-3 rounded-xl border border-border/70 bg-surface/60 p-4">
            <label className="flex cursor-pointer items-start gap-3 text-xs sm:text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-border accent-blue-600"
                {...register("createAccount")}
              />
              <div>
                <span className="font-semibold text-foreground">
                  Create a TK Laptop account with this email (Optional)
                </span>
                <p className="text-xs text-muted-foreground">
                  {createAccount
                    ? "We will create your account automatically when your order is placed and link this order to your profile."
                    : "Checking out as a guest — no password required."}
                </p>
              </div>
            </label>

            {createAccount && (
              <div className="pt-2">
                <label
                  htmlFor="shipping-accountPassword"
                  className="mb-1.5 block text-xs font-semibold text-foreground"
                >
                  Choose an Account Password{" "}
                  <span className="text-muted-foreground">
                    (Optional — or set later via email)
                  </span>
                </label>
                <Input
                  id="shipping-accountPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters, 1 letter & 1 number"
                  aria-invalid={Boolean(errors.accountPassword)}
                  aria-describedby={
                    errors.accountPassword
                      ? "error-shipping-accountPassword"
                      : undefined
                  }
                  {...register("accountPassword")}
                />
                {errors.accountPassword && (
                  <p
                    id="error-shipping-accountPassword"
                    role="alert"
                    className="mt-1 text-xs font-medium text-rose-500"
                  >
                    {errors.accountPassword.message}
                  </p>
                )}
                {accountPassword.length > 0 && (
                  <PasswordStrength
                    password={accountPassword}
                    id="checkout-password-strength"
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Shipping Address */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
          <MapPin className="h-5 w-5 text-accent" aria-hidden="true" />
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">
              Shipping Address
            </h2>
            <p className="text-xs text-muted-foreground">
              Where should we deliver your insured laptop order?
            </p>
          </div>
        </div>

        {/* Saved Address Picker for Logged-In Users */}
        {currentUser && currentUser.addresses.length > 0 && (
          <div className="space-y-2.5 rounded-2xl border border-accent/25 bg-accent/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Sparkles
                  className="h-3.5 w-3.5 text-accent"
                  aria-hidden="true"
                />
                <span>Choose from Your Saved Addresses</span>
              </p>
              <Link
                href="/account/addresses"
                className="text-[11px] font-semibold text-accent hover:underline"
              >
                Manage addresses
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {currentUser.addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => handleSelectSavedAddress(addr)}
                    className={cn(
                      "flex flex-col items-start rounded-xl border p-3 text-left text-xs transition-all",
                      isSelected
                        ? "border-accent bg-card ring-2 ring-accent/25 shadow-sm"
                        : "border-border/80 bg-card/70 hover:border-accent/40"
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {addr.label}
                      </Badge>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 font-bold text-foreground">
                      {addr.fullName}
                    </p>
                    <p className="line-clamp-2 text-[11px] text-muted-foreground">
                      {addr.streetAddress}
                      {addr.apartment ? `, ${addr.apartment}` : ""}, {addr.city}
                      , {addr.stateProvince} {addr.postalCode}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="shipping-street"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Street Address <span className="text-rose-500">*</span>
            </label>
            <Input
              id="shipping-street"
              autoComplete="shipping address-line1"
              placeholder="742 Tech Plaza"
              aria-invalid={Boolean(errors.shippingAddress?.streetAddress)}
              aria-describedby={
                errors.shippingAddress?.streetAddress
                  ? "error-shipping-street"
                  : undefined
              }
              {...register("shippingAddress.streetAddress")}
            />
            {errors.shippingAddress?.streetAddress && (
              <p
                id="error-shipping-street"
                role="alert"
                className="mt-1 text-xs font-medium text-rose-500"
              >
                {errors.shippingAddress.streetAddress.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="shipping-apartment"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Apartment, Suite, Floor (Optional)
            </label>
            <Input
              id="shipping-apartment"
              autoComplete="shipping address-line2"
              placeholder="Suite 400"
              {...register("shippingAddress.apartment")}
            />
          </div>

          <div>
            <label
              htmlFor="shipping-city"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              City <span className="text-rose-500">*</span>
            </label>
            <Input
              id="shipping-city"
              autoComplete="shipping address-level2"
              placeholder="San Francisco"
              aria-invalid={Boolean(errors.shippingAddress?.city)}
              aria-describedby={
                errors.shippingAddress?.city ? "error-shipping-city" : undefined
              }
              {...register("shippingAddress.city")}
            />
            {errors.shippingAddress?.city && (
              <p
                id="error-shipping-city"
                role="alert"
                className="mt-1 text-xs font-medium text-rose-500"
              >
                {errors.shippingAddress.city.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="shipping-state"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              State / Province <span className="text-rose-500">*</span>
            </label>
            <Input
              id="shipping-state"
              autoComplete="shipping address-level1"
              placeholder="CA"
              aria-invalid={Boolean(errors.shippingAddress?.stateProvince)}
              aria-describedby={
                errors.shippingAddress?.stateProvince
                  ? "error-shipping-state"
                  : undefined
              }
              {...register("shippingAddress.stateProvince")}
            />
            {errors.shippingAddress?.stateProvince && (
              <p
                id="error-shipping-state"
                role="alert"
                className="mt-1 text-xs font-medium text-rose-500"
              >
                {errors.shippingAddress.stateProvince.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="shipping-postalCode"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Postal / ZIP Code <span className="text-rose-500">*</span>
            </label>
            <Input
              id="shipping-postalCode"
              autoComplete="shipping postal-code"
              placeholder="94107"
              aria-invalid={Boolean(errors.shippingAddress?.postalCode)}
              aria-describedby={
                errors.shippingAddress?.postalCode
                  ? "error-shipping-postalCode"
                  : undefined
              }
              {...register("shippingAddress.postalCode")}
            />
            {errors.shippingAddress?.postalCode && (
              <p
                id="error-shipping-postalCode"
                role="alert"
                className="mt-1 text-xs font-medium text-rose-500"
              >
                {errors.shippingAddress.postalCode.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="shipping-country"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Country <span className="text-rose-500">*</span>
            </label>
            <select
              id="shipping-country"
              autoComplete="shipping country-name"
              aria-invalid={Boolean(errors.shippingAddress?.country)}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register("shippingAddress.country")}
            >
              {SITE_CONFIG.checkout.countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {errors.shippingAddress?.country && (
              <p
                role="alert"
                className="mt-1 text-xs font-medium text-rose-500"
              >
                {errors.shippingAddress.country.message}
              </p>
            )}
          </div>
        </div>

        {/* Save Address & Billing Address Checkboxes */}
        <div className="space-y-3 pt-2">
          <label className="flex cursor-pointer items-center gap-2.5 text-xs sm:text-sm font-medium text-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-blue-600"
              {...register("saveAddress")}
            />
            <span>Save this address for next time</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2.5 text-xs sm:text-sm font-medium text-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-blue-600"
              {...register("billingSameAsShipping")}
            />
            <span>Billing address is the same as shipping address</span>
          </label>
        </div>

        {/* Conditional Billing Address Form */}
        {!billingSameAsShipping && (
          <div className="mt-4 space-y-4 rounded-2xl border border-border/80 bg-surface/60 p-5">
            <h3 className="font-heading text-sm font-bold text-foreground">
              Billing Address
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="billing-street"
                  className="mb-1.5 block text-xs font-semibold text-foreground"
                >
                  Billing Street Address <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="billing-street"
                  autoComplete="billing address-line1"
                  placeholder="100 Corporate Blvd"
                  aria-invalid={Boolean(errors.billingAddress?.streetAddress)}
                  {...register("billingAddress.streetAddress")}
                />
                {errors.billingAddress?.streetAddress && (
                  <p
                    role="alert"
                    className="mt-1 text-xs font-medium text-rose-500"
                  >
                    {errors.billingAddress.streetAddress.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="billing-apartment"
                  className="mb-1.5 block text-xs font-semibold text-foreground"
                >
                  Apartment / Suite (Optional)
                </label>
                <Input
                  id="billing-apartment"
                  autoComplete="billing address-line2"
                  placeholder="Floor 3"
                  {...register("billingAddress.apartment")}
                />
              </div>

              <div>
                <label
                  htmlFor="billing-city"
                  className="mb-1.5 block text-xs font-semibold text-foreground"
                >
                  City <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="billing-city"
                  autoComplete="billing address-level2"
                  placeholder="San Francisco"
                  aria-invalid={Boolean(errors.billingAddress?.city)}
                  {...register("billingAddress.city")}
                />
                {errors.billingAddress?.city && (
                  <p
                    role="alert"
                    className="mt-1 text-xs font-medium text-rose-500"
                  >
                    {errors.billingAddress.city.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="billing-state"
                  className="mb-1.5 block text-xs font-semibold text-foreground"
                >
                  State / Province <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="billing-state"
                  autoComplete="billing address-level1"
                  placeholder="CA"
                  aria-invalid={Boolean(errors.billingAddress?.stateProvince)}
                  {...register("billingAddress.stateProvince")}
                />
                {errors.billingAddress?.stateProvince && (
                  <p
                    role="alert"
                    className="mt-1 text-xs font-medium text-rose-500"
                  >
                    {errors.billingAddress.stateProvince.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="billing-postalCode"
                  className="mb-1.5 block text-xs font-semibold text-foreground"
                >
                  Postal / ZIP Code <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="billing-postalCode"
                  autoComplete="billing postal-code"
                  placeholder="94107"
                  aria-invalid={Boolean(errors.billingAddress?.postalCode)}
                  {...register("billingAddress.postalCode")}
                />
                {errors.billingAddress?.postalCode && (
                  <p
                    role="alert"
                    className="mt-1 text-xs font-medium text-rose-500"
                  >
                    {errors.billingAddress.postalCode.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="billing-country"
                  className="mb-1.5 block text-xs font-semibold text-foreground"
                >
                  Country <span className="text-rose-500">*</span>
                </label>
                <select
                  id="billing-country"
                  autoComplete="billing country-name"
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register("billingAddress.country")}
                >
                  {SITE_CONFIG.checkout.countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Notes */}
        <div className="pt-2">
          <label
            htmlFor="shipping-notes"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            Delivery Instructions / Notes (Optional)
          </label>
          <textarea
            id="shipping-notes"
            rows={2}
            placeholder="Gate code, building reception hours, or preferred drop-off instructions..."
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register("deliveryNotes")}
          />
          {errors.deliveryNotes && (
            <p role="alert" className="mt-1 text-xs font-medium text-rose-500">
              {errors.deliveryNotes.message}
            </p>
          )}
        </div>
      </div>

      {/* Step Footer */}
      <div className="flex items-center justify-end border-t border-border/60 pt-5">
        <Button
          type="submit"
          variant="accent"
          size="lg"
          className="w-full sm:w-auto font-semibold shadow-md shadow-blue-600/20"
        >
          <span>Continue to Delivery Method</span>
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
