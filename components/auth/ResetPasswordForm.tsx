"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
} from "lucide-react";

import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { resetPasswordWithTokenAction } from "@/lib/actions/auth-actions";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";

interface ResetPasswordFormProps {
  token: string;
  tokenStatus:
    | { valid: true; email: string }
    | { valid: false; reason: "not_found" | "expired" | "used" };
}

/**
 * Reset Password Form (/reset-password/[token]):
 * Validates token status, renders new password + confirm password with strength meter,
 * updates the user's bcrypt hash, and redirects to /login.
 */
export function ResetPasswordForm({
  token,
  tokenStatus,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const showToast = useCartStore((state) => state.showToast);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password") ?? "";

  if (!tokenStatus.valid) {
    const reasonText =
      tokenStatus.reason === "expired"
        ? "This password reset link has expired (links are valid for 30 minutes)."
        : tokenStatus.reason === "used"
        ? "This password reset link has already been used."
        : "This password reset link is invalid or could not be found.";

    return (
      <div className="space-y-6" role="alert" aria-live="assertive">
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-5 text-sm text-rose-700 dark:text-rose-300">
          <div className="flex items-start gap-3">
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <div className="space-y-1.5">
              <p className="font-bold">Reset Link Unavailable</p>
              <p className="text-xs leading-relaxed">{reasonText}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            variant="accent"
            className="h-11 flex-1 rounded-xl font-semibold"
          >
            <Link href="/forgot-password">Request New Reset Link</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 flex-1 rounded-xl font-semibold"
          >
            <Link href="/login">Back to Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setServerError(null);
    const result = await resetPasswordWithTokenAction(values);

    if (!result.success) {
      setServerError(
        result.error ?? "Could not reset your password. Please try again."
      );
      return;
    }

    setIsSuccess(true);
    showToast("Password updated! Redirecting to sign in...", "success");
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="space-y-6" aria-live="polite">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="font-bold text-foreground">
                Password Updated Successfully
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Your password for <strong>{tokenStatus.email}</strong> has been
                updated. Redirecting you to the sign-in page...
              </p>
            </div>
          </div>
        </div>

        <Button
          asChild
          variant="accent"
          className="h-11 w-full rounded-xl font-semibold"
        >
          <Link href="/login">Continue to Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/80 bg-surface px-4 py-3 text-xs text-muted-foreground">
        Resetting password for{" "}
        <strong className="font-semibold text-foreground">
          {tokenStatus.email}
        </strong>
      </div>

      <div aria-live="assertive" aria-atomic="true">
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
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
      >
        <input type="hidden" {...register("token")} />

        {/* New Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="reset-password"
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
              id="reset-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters, 1 letter & 1 number"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password
                  ? "reset-password-error reset-password-strength"
                  : "reset-password-strength"
              }
              className={cn(
                "h-11 w-full rounded-xl border bg-background pl-10 pr-11 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                errors.password
                  ? "border-rose-500 focus:ring-rose-500"
                  : "border-input"
              )}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password && (
            <p
              id="reset-password-error"
              role="alert"
              className="text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {errors.password.message}
            </p>
          )}
          <PasswordStrength
            password={passwordValue}
            id="reset-password-strength"
          />
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="reset-confirmPassword"
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
              id="reset-confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword
                  ? "reset-confirmPassword-error"
                  : undefined
              }
              className={cn(
                "h-11 w-full rounded-xl border bg-background pl-10 pr-11 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                errors.confirmPassword
                  ? "border-rose-500 focus:ring-rose-500"
                  : "border-input"
              )}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p
              id="reset-confirmPassword-error"
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
          size="lg"
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl font-bold shadow-md"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Updating password...</span>
            </>
          ) : (
            <span>Save New Password</span>
          )}
        </Button>
      </form>
    </div>
  );
}
