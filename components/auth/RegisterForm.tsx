"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";

import { dispatchAuthUserUpdate } from "@/components/account/UserMenu";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { registerUserAction } from "@/lib/actions/auth-actions";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface RegisterFormProps {
  callbackUrl?: string;
  isGoogleEnabled?: boolean;
}

function getSafeCallbackUrl(raw?: string): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/account";
  }
  return raw;
}

/**
 * Accessible Registration Form with React Hook Form + Zod, live PasswordStrength meter,
 * duplicate email rejection, automatic guest order linking, and wishlist sync.
 */
export function RegisterForm({
  callbackUrl,
  isGoogleEnabled = false,
}: RegisterFormProps) {
  const router = useRouter();
  const showToast = useCartStore((state) => state.showToast);
  const syncWithServerWishlist = useWishlistStore(
    (state) => state.syncWithServerWishlist
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const safeRedirect = getSafeCallbackUrl(callbackUrl);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const passwordValue = watch("password") ?? "";
  const acceptTermsValue = watch("acceptTerms");

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    const result = await registerUserAction(values);

    if (!result.success) {
      if (result.code === "DUPLICATE_EMAIL") {
        setError("email", {
          type: "manual",
          message:
            result.error ??
            "An account with this email address already exists.",
        });
      }
      setServerError(
        result.error ?? "Could not create your account. Please try again."
      );
      return;
    }

    if (result.data?.user) {
      dispatchAuthUserUpdate(result.data.user, "tk-auth-changed");
      await syncWithServerWishlist(result.data.user.wishlistProductIds ?? []);
    }

    showToast(
      result.message ?? "Welcome to TK Laptop! Your account has been created.",
      "success"
    );
    router.push(safeRedirect);
    router.refresh();
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setServerError(null);
    try {
      await nextAuthSignIn("google", { callbackUrl: safeRedirect });
    } catch {
      setServerError("Could not start Google sign-up. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Server Error Alert */}
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
            <div className="space-y-1">
              <p className="font-semibold">Registration Error</p>
              <p className="text-xs leading-relaxed">{serverError}</p>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
      >
        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="register-fullName"
            className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
          >
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="register-fullName"
              type="text"
              autoComplete="name"
              placeholder="Alex Rivera"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={
                errors.fullName ? "register-fullName-error" : undefined
              }
              className={cn(
                "h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                errors.fullName
                  ? "border-rose-500 focus:ring-rose-500"
                  : "border-input"
              )}
              {...register("fullName")}
            />
          </div>
          {errors.fullName && (
            <p
              id="register-fullName-error"
              role="alert"
              className="text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email & Optional Phone */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="register-email"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
            >
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="alex@company.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "register-email-error" : undefined
                }
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
                id="register-email-error"
                role="alert"
                className="text-xs font-medium text-rose-600 dark:text-rose-400"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="register-phone"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
            >
              Phone <span className="text-muted-foreground">(Optional)</span>
            </label>
            <div className="relative">
              <Phone
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="register-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 (555) 234-5678"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={
                  errors.phone ? "register-phone-error" : undefined
                }
                className={cn(
                  "h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.phone
                    ? "border-rose-500 focus:ring-rose-500"
                    : "border-input"
                )}
                {...register("phone")}
              />
            </div>
            {errors.phone && (
              <p
                id="register-phone-error"
                role="alert"
                className="text-xs font-medium text-rose-600 dark:text-rose-400"
              >
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Password with Strength Meter */}
        <div className="space-y-1.5">
          <label
            htmlFor="register-password"
            className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
          >
            Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters, 1 letter & 1 number"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password
                  ? "register-password-error register-password-strength"
                  : "register-password-strength"
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
              id="register-password-error"
              role="alert"
              className="text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {errors.password.message}
            </p>
          )}
          <PasswordStrength
            password={passwordValue}
            id="register-password-strength"
          />
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="register-confirmPassword"
            className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
          >
            Confirm Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="register-confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword
                  ? "register-confirmPassword-error"
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
              id="register-confirmPassword-error"
              role="alert"
              className="text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="register-acceptTerms"
              checked={acceptTermsValue}
              onCheckedChange={(checked) =>
                setValue("acceptTerms", Boolean(checked), {
                  shouldValidate: true,
                })
              }
              aria-invalid={Boolean(errors.acceptTerms)}
              aria-describedby={
                errors.acceptTerms ? "register-acceptTerms-error" : undefined
              }
              className="mt-0.5"
            />
            <label
              htmlFor="register-acceptTerms"
              className="cursor-pointer select-none text-xs leading-relaxed text-foreground/90"
            >
              I agree to the{" "}
              <span className="font-semibold text-foreground">
                Terms of Service
              </span>
              ,{" "}
              <span className="font-semibold text-foreground">
                1-Year Warranty Policy
              </span>
              , and{" "}
              <span className="font-semibold text-foreground">
                Privacy Policy
              </span>
              .
            </label>
          </div>
          {errors.acceptTerms && (
            <p
              id="register-acceptTerms-error"
              role="alert"
              className="text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="accent"
          size="lg"
          disabled={isSubmitting || isGoogleLoading}
          className="h-12 w-full rounded-xl font-bold shadow-md"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Creating your account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </Button>
      </form>

      {/* Optional Sign up with Google Button */}
      {isGoogleEnabled && (
        <div className="space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border" />
            <span className="bg-card px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Or sign up with
            </span>
            <div className="w-full border-t border-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isSubmitting || isGoogleLoading}
            onClick={handleGoogleSignUp}
            className="h-11 w-full rounded-xl font-semibold"
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 15.25 5 12c0-3.25 3.36-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
                />
              </svg>
            )}
            <span>Sign up with Google</span>
          </Button>
        </div>
      )}

      {/* Footer Link to Login */}
      <p className="border-t border-border/70 pt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={
            callbackUrl
              ? `/login?callbackUrl=${encodeURIComponent(safeRedirect)}`
              : "/login"
          }
          className="font-bold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
