"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
} from "lucide-react";

import { DeleteAccountDialog } from "@/components/account/DeleteAccountDialog";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { changePasswordAction } from "@/lib/actions/auth-actions";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";

interface SecuritySettingsProps {
  userEmail: string;
}

/**
 * Security Settings (/account/security):
 * - Change Password form (current password, new password with strength meter, confirm password)
 * - Danger Zone with DeleteAccountDialog confirmation
 */
export function SecuritySettings({ userEmail }: SecuritySettingsProps) {
  const showToast = useCartStore((state) => state.showToast);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = watch("newPassword") ?? "";

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setServerError(null);
    setSuccessMessage(null);

    const result = await changePasswordAction(values);
    if (!result.success) {
      setServerError(result.error ?? "Could not change password.");
      showToast(result.error ?? "Could not change password.", "error");
      return;
    }

    reset();
    setSuccessMessage(result.message ?? "Your password has been updated.");
    showToast("Password updated successfully!", "success");
  };

  return (
    <div className="space-y-8">
      {/* Change Password Card */}
      <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-card sm:p-8">
        <div className="flex items-start gap-3 border-b border-border/70 pb-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">
              Change Password
            </h2>
            <p className="text-xs text-muted-foreground">
              Use a strong password with at least 8 characters, one letter, and
              one number.
            </p>
          </div>
        </div>

        {/* Status Messages */}
        <div className="mt-5" aria-live="polite" aria-atomic="true">
          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300"
            >
              <AlertCircle
                className="mt-0.5 h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              <p className="text-xs leading-relaxed">{serverError}</p>
            </div>
          )}

          {successMessage && !serverError && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-6 max-w-lg space-y-5"
        >
          {/* Current Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="sec-currentPassword"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
            >
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="sec-currentPassword"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                aria-invalid={Boolean(errors.currentPassword)}
                aria-describedby={
                  errors.currentPassword ? "sec-current-error" : undefined
                }
                className={cn(
                  "h-11 w-full rounded-xl border bg-background pl-10 pr-11 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.currentPassword ? "border-rose-500" : "border-input"
                )}
                {...register("currentPassword")}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((p) => !p)}
                aria-label={
                  showCurrent
                    ? "Hide current password"
                    : "Show current password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p
                id="sec-current-error"
                role="alert"
                className="text-xs font-medium text-rose-600 dark:text-rose-400"
              >
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="sec-newPassword"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
            >
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="sec-newPassword"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.newPassword)}
                aria-describedby={
                  errors.newPassword
                    ? "sec-new-error sec-password-strength"
                    : "sec-password-strength"
                }
                className={cn(
                  "h-11 w-full rounded-xl border bg-background pl-10 pr-11 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.newPassword ? "border-rose-500" : "border-input"
                )}
                {...register("newPassword")}
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                aria-label={
                  showNew ? "Hide new password" : "Show new password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground hover:text-foreground"
              >
                {showNew ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p
                id="sec-new-error"
                role="alert"
                className="text-xs font-medium text-rose-600 dark:text-rose-400"
              >
                {errors.newPassword.message}
              </p>
            )}
            <PasswordStrength
              password={newPasswordValue}
              id="sec-password-strength"
            />
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="sec-confirmPassword"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
            >
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="sec-confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={
                  errors.confirmPassword ? "sec-confirm-error" : undefined
                }
                className={cn(
                  "h-11 w-full rounded-xl border bg-background pl-10 pr-11 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.confirmPassword ? "border-rose-500" : "border-input"
                )}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                aria-label={
                  showConfirm
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                id="sec-confirm-error"
                role="alert"
                className="text-xs font-medium text-rose-600 dark:text-rose-400"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="accent"
            disabled={isSubmitting}
            className="h-11 rounded-xl px-6 text-xs font-bold shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                <span>Updating password...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </Button>
        </form>
      </section>

      {/* Danger Zone: Delete Account */}
      <section className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 shadow-card sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <h2 className="font-heading text-base font-bold text-foreground">
                Delete Account
              </h2>
              <p className="max-w-lg text-xs leading-relaxed text-muted-foreground">
                Permanently remove your TK Laptop account, saved shipping
                addresses, and profile data. Requires confirmation before
                deletion.
              </p>
            </div>
          </div>

          <DeleteAccountDialog userEmail={userEmail} />
        </div>
      </section>
    </div>
  );
}
