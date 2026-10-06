"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
} from "lucide-react";

import { requestPasswordResetAction } from "@/lib/actions/auth-actions";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Forgot Password Form (/forgot-password):
 * Generates a 30-minute reset token, logs the reset link to the server console via /lib/email.ts,
 * and always displays a neutral confirmation message so it never leaks whether the email exists.
 */
export function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [neutralMessage, setNeutralMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setServerError(null);
    const result = await requestPasswordResetAction(values);

    if (!result.success) {
      setServerError(
        result.error ?? "Please enter a valid email address and try again."
      );
      return;
    }

    setSubmittedEmail(values.email.trim());
    setNeutralMessage(
      result.message ??
        "If an account exists for that email address, we have sent a password reset link (valid for 30 minutes)."
    );
  };

  if (neutralMessage) {
    return (
      <div className="space-y-6" aria-live="polite">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <div className="space-y-2">
              <p className="font-bold text-foreground">
                Check Your Inbox (or Server Console)
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {neutralMessage}
              </p>
              {submittedEmail && (
                <p className="text-xs text-muted-foreground">
                  Requested for:{" "}
                  <strong className="text-foreground">{submittedEmail}</strong>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setNeutralMessage(null);
              setSubmittedEmail(null);
            }}
            className="h-11 flex-1 rounded-xl font-semibold"
          >
            Send Another Link
          </Button>
          <Button
            asChild
            variant="accent"
            className="h-11 flex-1 rounded-xl font-semibold"
          >
            <Link href="/login">Back to Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        <div className="space-y-1.5">
          <label
            htmlFor="forgot-email"
            className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
          >
            Account Email Address
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="alex@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "forgot-email-error" : undefined}
              className={cn(
                "h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                errors.email
                  ? "border-rose-500 focus:ring-rose-500"
                  : "border-input"
              )}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p
              id="forgot-email-error"
              role="alert"
              className="text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {errors.email.message}
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
              <span>Sending reset link...</span>
            </>
          ) : (
            <span>Send Reset Link</span>
          )}
        </Button>
      </form>

      <div className="border-t border-border/70 pt-5 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
