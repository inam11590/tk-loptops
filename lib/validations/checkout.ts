import { z } from "zod";
import {
  stripNonDigits,
  validateCardExpiry,
  validateLuhn,
} from "@/lib/checkout";
import { SITE_CONFIG } from "@/lib/config";

export const addressSchema = z.object({
  streetAddress: z
    .string()
    .trim()
    .min(5, "Street address must be at least 5 characters."),
  apartment: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(2, "City is required."),
  stateProvince: z.string().trim().min(2, "State or province is required."),
  postalCode: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z0-9\s-]{3,12}$/,
      "Enter a valid postal or ZIP code (3–12 characters)."
    ),
  country: z.string().trim().min(2, "Please select a country."),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export const shippingStepSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters."),
    email: z
      .string()
      .trim()
      .min(1, "Email address is required.")
      .email("Enter a valid email address (e.g. alex@company.com)."),
    phone: z
      .string()
      .trim()
      .regex(
        /^\+?[0-9\s\-()]{7,20}$/,
        "Enter a valid phone number (7–20 digits)."
      ),
    shippingAddress: addressSchema,
    saveAddress: z.boolean(),
    billingSameAsShipping: z.boolean(),
    billingAddress: addressSchema.optional(),
    createAccount: z.boolean(),
    accountPassword: z.string().optional().or(z.literal("")),
    deliveryNotes: z
      .string()
      .trim()
      .max(300, "Delivery notes cannot exceed 300 characters.")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (!data.billingSameAsShipping) {
      const result = addressSchema.safeParse(data.billingAddress);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({
            ...issue,
            path: ["billingAddress", ...issue.path],
          });
        }
      }
    }
    if (data.createAccount && data.accountPassword && data.accountPassword.trim().length > 0) {
      const pwd = data.accountPassword;
      if (pwd.length < 8 || !/[A-Za-z]/.test(pwd) || !/[0-9]/.test(pwd)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["accountPassword"],
          message:
            "Account password must be at least 8 characters and include at least 1 letter and 1 number.",
        });
      }
    }
  });

export type ShippingStepValues = z.infer<typeof shippingStepSchema>;

export const deliveryStepSchema = z.object({
  deliveryMethodId: z.enum(["standard", "express", "pickup"], {
    required_error: "Please select a delivery method.",
  }),
});

export type DeliveryStepValues = z.infer<typeof deliveryStepSchema>;

export const cardFormSchema = z.object({
  cardHolderName: z
    .string()
    .trim()
    .min(2, "Name on card must be at least 2 characters."),
  cardNumber: z
    .string()
    .trim()
    .refine((val) => validateLuhn(val), {
      message: "Enter a valid card number (failed Luhn checksum check).",
    }),
  cardExpiry: z
    .string()
    .trim()
    .superRefine((val, ctx) => {
      const res = validateCardExpiry(val);
      if (!res.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: res.message ?? "Invalid card expiry date.",
        });
      }
    }),
  cardCvv: z
    .string()
    .trim()
    .refine(
      (val) => {
        const digits = stripNonDigits(val);
        return digits.length === 3 || digits.length === 4;
      },
      {
        message: "CVV must be 3 or 4 digits.",
      }
    ),
});

export type CardFormValues = z.infer<typeof cardFormSchema>;

export const paymentStepSchema = z
  .object({
    paymentMethodId: z.enum(
      ["card", "cod", "bank_transfer", "mobile_wallet"],
      {
        required_error: "Please select a payment method.",
      }
    ),
    walletPhone: z.string().trim().optional().or(z.literal("")),
    cardMeta: z
      .object({
        brand: z.string(),
        last4: z.string(),
        cardHolderName: z.string(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethodId === "mobile_wallet") {
      if (
        !data.walletPhone ||
        !/^\+?[0-9\s\-()]{10,16}$/.test(data.walletPhone.trim())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["walletPhone"],
          message:
            "Enter a valid 10–15 digit registered mobile wallet phone number.",
        });
      }
    }
  });

export type PaymentStepValues = z.infer<typeof paymentStepSchema>;

export const createOrderPayloadSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
        expectedUnitPrice: z.number().nonnegative(),
      })
    )
    .min(1, "Your cart cannot be empty."),
  shipping: shippingStepSchema,
  deliveryMethodId: z.enum(["standard", "express", "pickup"]),
  paymentMethodId: z.enum(["card", "cod", "bank_transfer", "mobile_wallet"]),
  walletPhone: z.string().optional(),
  cardMeta: z
    .object({
      brand: z.string(),
      last4: z.string().length(4),
      cardHolderName: z.string().min(2),
    })
    .optional(),
  couponCode: z.string().nullable().optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({
      message: "You must accept the Terms & Conditions to place your order.",
    }),
  }),
});

export type CreateOrderPayload = z.infer<typeof createOrderPayloadSchema>;

export const DEFAULT_SHIPPING_VALUES: ShippingStepValues = {
  fullName: "",
  email: "",
  phone: "",
  shippingAddress: {
    streetAddress: "",
    apartment: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: SITE_CONFIG.checkout.defaultCountry,
  },
  saveAddress: true,
  billingSameAsShipping: true,
  billingAddress: {
    streetAddress: "",
    apartment: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: SITE_CONFIG.checkout.defaultCountry,
  },
  createAccount: false,
  accountPassword: "",
  deliveryNotes: "",
};
