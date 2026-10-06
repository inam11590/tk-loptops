import { z } from "zod";
import { addressSchema } from "@/lib/validations/checkout";

export const MAX_SAVED_ADDRESSES = 5;

/**
 * Sanitizes user-provided text by stripping HTML tags and control characters.
 */
export function sanitizeText(value: string): string {
  return value
    .replace(/<[^>]*>?/gm, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim();
}

/**
 * Password validation rule: minimum 8 characters, at least 1 letter and 1 number.
 */
export const passwordRuleSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(128, "Password cannot exceed 128 characters.")
  .regex(/[A-Za-z]/, "Password must contain at least one letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

export interface PasswordStrengthAnalysis {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Too Short" | "Weak" | "Fair" | "Good" | "Strong";
  checks: {
    minLength: boolean;
    hasLetter: boolean;
    hasNumber: boolean;
    hasMixedCase: boolean;
    hasSpecial: boolean;
  };
}

/**
 * Computes password strength metrics for the live <PasswordStrength /> meter.
 */
export function evaluatePasswordStrength(
  password: string
): PasswordStrengthAnalysis {
  const minLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!password || password.length < 8) {
    return {
      score: password.length > 0 ? 1 : 0,
      label: "Too Short",
      checks: { minLength, hasLetter, hasNumber, hasMixedCase, hasSpecial },
    };
  }

  const meetsMinimumRules = minLength && hasLetter && hasNumber;
  if (!meetsMinimumRules) {
    return {
      score: 1,
      label: "Weak",
      checks: { minLength, hasLetter, hasNumber, hasMixedCase, hasSpecial },
    };
  }

  let points = 2; // Meets base requirements (8+ chars, letter + number)
  if (hasMixedCase) points += 1;
  if (hasSpecial || password.length >= 12) points += 1;

  const score = Math.min(4, points) as 0 | 1 | 2 | 3 | 4;
  const labels: Record<number, PasswordStrengthAnalysis["label"]> = {
    0: "Too Short",
    1: "Weak",
    2: "Fair",
    3: "Good",
    4: "Strong",
  };

  return {
    score,
    label: labels[score] ?? "Fair",
    checks: { minLength, hasLetter, hasNumber, hasMixedCase, hasSpecial },
  };
}

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(80, "Full name cannot exceed 80 characters."),
    email: z
      .string()
      .trim()
      .min(1, "Email address is required.")
      .email("Enter a valid email address."),
    phone: z
      .string()
      .trim()
      .refine(
        (val) => !val || /^\+?[0-9\s\-()]{7,20}$/.test(val),
        "Enter a valid phone number (7–20 digits) or leave blank."
      ),
    password: passwordRuleSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms of Service and Privacy Policy.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Enter a valid email address."),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(10, "Invalid or missing reset token."),
    password: passwordRuleSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const MAX_AVATAR_DATA_URL_LENGTH = 1_450_000; // ~1 MB binary encoded as base64

export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(80, "Full name cannot exceed 80 characters."),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => !val || /^\+?[0-9\s\-()]{7,20}$/.test(val),
      "Enter a valid phone number (7–20 digits) or leave blank."
    ),
  avatarUrl: z
    .string()
    .trim()
    .max(MAX_AVATAR_DATA_URL_LENGTH, "Avatar image must be smaller than 1 MB.")
    .refine(
      (val) =>
        !val ||
        /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(
          val
        ) ||
        /^https?:\/\//.test(val),
      "Avatar must be a valid image (PNG, JPG, WebP, or GIF under 1 MB)."
    ),
});

export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;

export const savedAddressFormSchema = addressSchema.extend({
  id: z.string().optional(),
  label: z
    .string()
    .trim()
    .min(1, "Address label is required (e.g. Home, Office).")
    .max(30, "Label cannot exceed 30 characters."),
  fullName: z
    .string()
    .trim()
    .min(2, "Recipient name must be at least 2 characters.")
    .max(80, "Recipient name cannot exceed 80 characters."),
  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[0-9\s\-()]{7,20}$/,
      "Enter a valid phone number (7–20 digits)."
    ),
  isDefault: z.boolean(),
});

export type SavedAddressFormValues = z.infer<typeof savedAddressFormSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: passwordRuleSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "New passwords do not match.",
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ["newPassword"],
    message: "New password must be different from your current password.",
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const deleteAccountSchema = z.object({
  confirmation: z
    .string()
    .trim()
    .min(1, "Please type DELETE or your email address to confirm."),
});

export type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;
