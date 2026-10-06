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
  Sparkles,
} from "lucide-react";

import { loginUserAction } from "@/lib/actions/auth-actions";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface LoginFormProps {
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
 * Accessible Login Form with show/hide password toggle, Remember Me,
 * 5-attempt rate-limiting lockout banner, wishlist merge on login, and optional Google OAuth.
 */
export function LoginForm({
  callbackUrl,
  isGoogleEnabled = false,
}: LoginFormProps) {
  const router = useRouter();
  const showToast = useCartStore((state) => state.showToast);
  const syncWithServerWishlist = useWishlistStore(
    (state) => state.syncWithServerWishlist
  );

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const safeRedirect = getSafeCallbackUrl(callbackUrl);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const rememberMeValue = watch("rememberMe");

  const fillDemoCredentials = () => {
    setValue("email", "alex@example.com", { shouldValidate: true });
    setValue("password", "Password123", { shouldValidate: true });
    setServerError(null);
    setIsLockedOut(false);
  };

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    const result = await loginUserAction(values);

    if (!result.success) {
      setServerError(result.error ?? "Invalid email or password.");
      setIsLockedOut(result.code === "ACCOUNT_LOCKED");
      return;
    }

    if (result.data?.user) {
      await syncWithServerWishlist(result.data.user.wishlistProductIds ?? []);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("tk-auth-changed"));
    }

    showToast(result.message ?? "Signed in successfully!", "success");
    router.push(safeRedirect);
    router.refresh();
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setServerError(null);
    try {
      await nextAuthSignIn("google", { callbackUrl: safeRedirect });
    } catch {
      setServerError("Could not start Google sign-in. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Demo Credentials Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-accent/25 bg-accent/5 px-4 py-3 text-xs">
        <div className="flex items-center gap-2 text-foreground">
          <Sparkles className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <span>
            Demo Account: <strong>alex@example.com</strong> /{" "}
            <code className="rounded bg-background px-1.5 py-0.5 font-mono text-[11px]">
              Password123
            </code>
          </span>
        </div>
        <button
          type="button"
          onClick={fillDemoCredentials}
          className="font-bold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          Auto-fill
        </button>
      </div>

      {/* Server Error / Lockout Alert */}
      <div aria-live="assertive" aria-atomic="true">
        {serverError && (
          <div
            role="alert"
            className={cn(
              "flex items-start gap-3 rounded-2xl border p-4 text-sm",
              isLockedOut
                ? "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                : "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
            )}
          >
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="font-semibold">
                {isLockedOut ? "Temporary Security Lockout" : "Sign-in Failed"}
              </p>
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
        {/* Email Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="alex@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "login-email-error" : undefined}
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
              id="login-email-error"
              role="alert"
              className="text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field with Show/Hide Toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "login-password-error" : undefined
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
              id="login-password-error"
              role="alert"
              className="text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="login-remember-me"
              checked={rememberMeValue}
              onCheckedChange={(checked) =>
                setValue("rememberMe", Boolean(checked))
              }
            />
            <label
              htmlFor="login-remember-me"
              className="cursor-pointer select-none text-xs font-medium text-foreground/90"
            >
              Remember me for 30 days
            </label>
          </div>
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
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In to TK Laptop</span>
          )}
        </Button>
      </form>

      {/* Optional Google OAuth Button */}
      {isGoogleEnabled && (
        <div className="space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border" />
            <span className="bg-card px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Or continue with
            </span>
            <div className="w-full border-t border-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isSubmitting || isGoogleLoading}
            onClick={handleGoogleSignIn}
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
            <span>Continue with Google</span>
          </Button>
        </div>
      )}

      {/* Footer Link to Register */}
      <p className="border-t border-border/70 pt-5 text-center text-sm text-muted-foreground">
        New to TK Laptop?{" "}
        <Link
          href={
            callbackUrl
              ? `/register?callbackUrl=${encodeURIComponent(safeRedirect)}`
              : "/register"
          }
          className="font-bold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
