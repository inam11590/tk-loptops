"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { Loader2, TicketPercent, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CouponRecord } from "@/lib/couponStore";
import {
  createCouponAction,
  updateCouponAction,
} from "@/lib/actions/admin-actions";
import {
  adminCouponSchema,
  type AdminCouponFormValues,
} from "@/lib/validations/admin";

interface CouponDialogProps {
  open: boolean;
  coupon?: CouponRecord | null;
  onClose: () => void;
}

export function CouponDialog({ open, coupon, onClose }: CouponDialogProps) {
  const router = useRouter();
  const isEdit = Boolean(coupon);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AdminCouponFormValues>({
    resolver: zodResolver(
      adminCouponSchema
    ) as unknown as Resolver<AdminCouponFormValues>,
    defaultValues: {
      code: coupon?.code ?? "",
      description: coupon?.description ?? "",
      discountType: coupon?.discountType ?? "percentage",
      discountValue: coupon?.discountValue ?? 10,
      minOrderAmount: coupon?.minOrderAmount ?? 500,
      maxDiscountAmount: coupon?.maxDiscountAmount ?? "",
      usageLimit: coupon?.usageLimit ?? "",
      perUserLimit: coupon?.perUserLimit ?? "",
      startDate: coupon?.startDate ? coupon.startDate.slice(0, 10) : "",
      expiresAt: coupon?.expiresAt
        ? coupon.expiresAt.slice(0, 10)
        : "2027-12-31",
      isActive: coupon?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (open) {
      setServerError(null);
      form.reset({
        code: coupon?.code ?? "",
        description: coupon?.description ?? "",
        discountType: coupon?.discountType ?? "percentage",
        discountValue: coupon?.discountValue ?? 10,
        minOrderAmount: coupon?.minOrderAmount ?? 500,
        maxDiscountAmount: coupon?.maxDiscountAmount ?? "",
        usageLimit: coupon?.usageLimit ?? "",
        perUserLimit: coupon?.perUserLimit ?? "",
        startDate: coupon?.startDate ? coupon.startDate.slice(0, 10) : "",
        expiresAt: coupon?.expiresAt
          ? coupon.expiresAt.slice(0, 10)
          : "2027-12-31",
        isActive: coupon?.isActive ?? true,
      });
    }
  }, [open, coupon, form]);

  if (!open) return null;

  const onSubmit = async (values: AdminCouponFormValues) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const normalized: AdminCouponFormValues = {
        ...values,
        expiresAt: values.expiresAt.includes("T")
          ? values.expiresAt
          : `${values.expiresAt}T23:59:59.000Z`,
      };

      const res =
        isEdit && coupon
          ? await updateCouponAction(coupon.code, normalized)
          : await createCouponAction(normalized);

      if (!res.success) {
        setServerError(res.error ?? "Failed to save coupon.");
        return;
      }

      onClose();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const errors = form.formState.errors;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="coupon-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <TicketPercent className="h-5 w-5" />
            </div>
            <h3
              id="coupon-dialog-title"
              className="font-heading text-base font-bold text-foreground"
            >
              {isEdit ? `Edit Coupon: ${coupon?.code}` : "Create Promo Coupon"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
          {serverError && (
            <p
              role="alert"
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-500"
            >
              {serverError}
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">
              Coupon Code *
            </label>
            <Input
              {...form.register("code")}
              placeholder="SAVE15"
              className="uppercase"
            />
            {errors.code && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.code.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">
              Description *
            </label>
            <Input
              {...form.register("description")}
              placeholder="Save 15% on orders over $800"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                Discount Type *
              </label>
              <select
                {...form.register("discountType")}
                className="h-10 w-full rounded-xl border border-input bg-surface px-3 text-xs font-semibold text-foreground"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                Discount Value *
              </label>
              <Input
                type="number"
                step="1"
                min="1"
                {...form.register("discountValue")}
              />
              {errors.discountValue && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.discountValue.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                Min Order ($) *
              </label>
              <Input
                type="number"
                step="1"
                min="0"
                {...form.register("minOrderAmount")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                Max Discount ($)
              </label>
              <Input
                type="number"
                placeholder="Optional cap"
                {...form.register("maxDiscountAmount")}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                Total Usage Limit
              </label>
              <Input
                type="number"
                placeholder="Unlimited"
                {...form.register("usageLimit")}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                Per-User Limit
              </label>
              <Input
                type="number"
                placeholder="Unlimited"
                {...form.register("perUserLimit")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                Start Date (Optional)
              </label>
              <Input type="date" {...form.register("startDate")} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                Expiry Date *
              </label>
              <Input type="date" {...form.register("expiresAt")} />
              {errors.expiresAt && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.expiresAt.message}
                </p>
              )}
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border/60 bg-surface/50 p-3 text-xs font-semibold">
            <span>Coupon Active (usable at checkout)</span>
            <input
              type="checkbox"
              {...form.register("isActive")}
              className="h-4 w-4 rounded accent-blue-600"
            />
          </label>

          <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="sm"
              disabled={submitting}
            >
              {submitting && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              <span>{isEdit ? "Save Coupon" : "Create Coupon"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
