"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, MapPin } from "lucide-react";

import { SITE_CONFIG } from "@/lib/config";
import { upsertAddressAction } from "@/lib/actions/auth-actions";
import type { SavedAddress } from "@/lib/users";
import {
  savedAddressFormSchema,
  type SavedAddressFormValues,
} from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddressFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAddress?: SavedAddress | null;
  defaultFullName?: string;
  defaultPhone?: string;
  onSaved: (addresses: SavedAddress[]) => void;
}

const PRESET_LABELS = ["Home", "Office", "Campus", "Other"];

/**
 * Modal form for adding or editing a saved address (/account/addresses).
 * Reuses the checkout address Zod schema and manages focus inside the Dialog.
 */
export function AddressForm({
  open,
  onOpenChange,
  initialAddress,
  defaultFullName = "",
  defaultPhone = "",
  onSaved,
}: AddressFormProps) {
  const showToast = useCartStore((state) => state.showToast);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SavedAddressFormValues>({
    resolver: zodResolver(savedAddressFormSchema),
    defaultValues: {
      id: initialAddress?.id,
      label: initialAddress?.label ?? "Home",
      fullName: initialAddress?.fullName ?? defaultFullName,
      phone: initialAddress?.phone ?? defaultPhone,
      streetAddress: initialAddress?.streetAddress ?? "",
      apartment: initialAddress?.apartment ?? "",
      city: initialAddress?.city ?? "",
      stateProvince: initialAddress?.stateProvince ?? "",
      postalCode: initialAddress?.postalCode ?? "",
      country: initialAddress?.country ?? SITE_CONFIG.checkout.defaultCountry,
      isDefault: initialAddress?.isDefault ?? false,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        id: initialAddress?.id,
        label: initialAddress?.label ?? "Home",
        fullName: initialAddress?.fullName ?? defaultFullName,
        phone: initialAddress?.phone ?? defaultPhone,
        streetAddress: initialAddress?.streetAddress ?? "",
        apartment: initialAddress?.apartment ?? "",
        city: initialAddress?.city ?? "",
        stateProvince: initialAddress?.stateProvince ?? "",
        postalCode: initialAddress?.postalCode ?? "",
        country: initialAddress?.country ?? SITE_CONFIG.checkout.defaultCountry,
        isDefault: initialAddress?.isDefault ?? false,
      });
    }
  }, [open, initialAddress, defaultFullName, defaultPhone, reset]);

  const currentLabel = watch("label");
  const isDefaultValue = watch("isDefault");

  const onSubmit = async (values: SavedAddressFormValues) => {
    const result = await upsertAddressAction(values);
    if (!result.success || !result.data) {
      showToast(result.error ?? "Could not save address.", "error");
      return;
    }

    showToast(result.message ?? "Address saved!", "success");
    onSaved(result.data.addresses);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl p-6 sm:p-7">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-xl font-bold">
            <MapPin className="h-5 w-5 text-accent" aria-hidden="true" />
            <span>
              {initialAddress ? "Edit Saved Address" : "Add New Address"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Saved addresses can be selected with one click during checkout (up
            to 5 addresses).
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-2 space-y-4"
        >
          {/* Address Label Quick Pills + Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="addr-label"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
            >
              Address Label <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 pb-1">
              {PRESET_LABELS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    setValue("label", preset, { shouldValidate: true })
                  }
                  className={cn(
                    "rounded-lg border px-3 py-1 text-xs font-semibold transition-colors",
                    currentLabel === preset
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground"
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              id="addr-label"
              type="text"
              placeholder="e.g. Home, Office"
              aria-invalid={Boolean(errors.label)}
              aria-describedby={errors.label ? "addr-label-error" : undefined}
              className={cn(
                "h-10 w-full rounded-xl border bg-background px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                errors.label ? "border-rose-500" : "border-input"
              )}
              {...register("label")}
            />
            {errors.label && (
              <p
                id="addr-label-error"
                role="alert"
                className="text-xs font-medium text-rose-600 dark:text-rose-400"
              >
                {errors.label.message}
              </p>
            )}
          </div>

          {/* Recipient Full Name & Phone */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="addr-fullName"
                className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
              >
                Recipient Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="addr-fullName"
                type="text"
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={
                  errors.fullName ? "addr-fullName-error" : undefined
                }
                className={cn(
                  "h-10 w-full rounded-xl border bg-background px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.fullName ? "border-rose-500" : "border-input"
                )}
                {...register("fullName")}
              />
              {errors.fullName && (
                <p
                  id="addr-fullName-error"
                  role="alert"
                  className="text-xs font-medium text-rose-600 dark:text-rose-400"
                >
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="addr-phone"
                className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
              >
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                id="addr-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 (555) 234-5678"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "addr-phone-error" : undefined}
                className={cn(
                  "h-10 w-full rounded-xl border bg-background px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.phone ? "border-rose-500" : "border-input"
                )}
                {...register("phone")}
              />
              {errors.phone && (
                <p
                  id="addr-phone-error"
                  role="alert"
                  className="text-xs font-medium text-rose-600 dark:text-rose-400"
                >
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Street Address & Apartment */}
          <div className="space-y-1.5">
            <label
              htmlFor="addr-streetAddress"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
            >
              Street Address <span className="text-rose-500">*</span>
            </label>
            <input
              id="addr-streetAddress"
              type="text"
              autoComplete="street-address"
              placeholder="742 Tech Plaza"
              aria-invalid={Boolean(errors.streetAddress)}
              aria-describedby={
                errors.streetAddress ? "addr-street-error" : undefined
              }
              className={cn(
                "h-10 w-full rounded-xl border bg-background px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                errors.streetAddress ? "border-rose-500" : "border-input"
              )}
              {...register("streetAddress")}
            />
            {errors.streetAddress && (
              <p
                id="addr-street-error"
                role="alert"
                className="text-xs font-medium text-rose-600 dark:text-rose-400"
              >
                {errors.streetAddress.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="addr-apartment"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
            >
              Apartment, Suite, Unit{" "}
              <span className="text-muted-foreground">(Optional)</span>
            </label>
            <input
              id="addr-apartment"
              type="text"
              placeholder="Suite 400"
              className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("apartment")}
            />
          </div>

          {/* City, State/Province, Postal Code, Country */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="addr-city"
                className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
              >
                City <span className="text-rose-500">*</span>
              </label>
              <input
                id="addr-city"
                type="text"
                autoComplete="address-level2"
                aria-invalid={Boolean(errors.city)}
                aria-describedby={errors.city ? "addr-city-error" : undefined}
                className={cn(
                  "h-10 w-full rounded-xl border bg-background px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.city ? "border-rose-500" : "border-input"
                )}
                {...register("city")}
              />
              {errors.city && (
                <p
                  id="addr-city-error"
                  role="alert"
                  className="text-xs font-medium text-rose-600 dark:text-rose-400"
                >
                  {errors.city.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="addr-stateProvince"
                className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
              >
                State / Province <span className="text-rose-500">*</span>
              </label>
              <input
                id="addr-stateProvince"
                type="text"
                autoComplete="address-level1"
                aria-invalid={Boolean(errors.stateProvince)}
                aria-describedby={
                  errors.stateProvince ? "addr-state-error" : undefined
                }
                className={cn(
                  "h-10 w-full rounded-xl border bg-background px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.stateProvince ? "border-rose-500" : "border-input"
                )}
                {...register("stateProvince")}
              />
              {errors.stateProvince && (
                <p
                  id="addr-state-error"
                  role="alert"
                  className="text-xs font-medium text-rose-600 dark:text-rose-400"
                >
                  {errors.stateProvince.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="addr-postalCode"
                className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
              >
                Postal Code <span className="text-rose-500">*</span>
              </label>
              <input
                id="addr-postalCode"
                type="text"
                autoComplete="postal-code"
                aria-invalid={Boolean(errors.postalCode)}
                aria-describedby={
                  errors.postalCode ? "addr-postal-error" : undefined
                }
                className={cn(
                  "h-10 w-full rounded-xl border bg-background px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.postalCode ? "border-rose-500" : "border-input"
                )}
                {...register("postalCode")}
              />
              {errors.postalCode && (
                <p
                  id="addr-postal-error"
                  role="alert"
                  className="text-xs font-medium text-rose-600 dark:text-rose-400"
                >
                  {errors.postalCode.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="addr-country"
                className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
              >
                Country <span className="text-rose-500">*</span>
              </label>
              <select
                id="addr-country"
                aria-invalid={Boolean(errors.country)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                {...register("country")}
              >
                {SITE_CONFIG.checkout.countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Default Address Checkbox */}
          <div className="flex items-center gap-2.5 pt-1">
            <Checkbox
              id="addr-isDefault"
              checked={isDefaultValue}
              onCheckedChange={(checked) =>
                setValue("isDefault", Boolean(checked))
              }
            />
            <label
              htmlFor="addr-isDefault"
              className="cursor-pointer select-none text-xs font-medium text-foreground"
            >
              Set as my default shipping address for checkout
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-border/70 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-xl px-4 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              disabled={isSubmitting}
              className="h-10 rounded-xl px-5 text-xs font-bold"
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    className="mr-1.5 h-3.5 w-3.5 animate-spin"
                    aria-hidden="true"
                  />
                  <span>Saving...</span>
                </>
              ) : (
                <span>
                  {initialAddress ? "Update Address" : "Save Address"}
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
