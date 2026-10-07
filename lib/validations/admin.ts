import { z } from "zod";

export const adminProductSpecsSchema = z.object({
  processor: z.string().trim().min(2, "Processor is required"),
  ram: z.string().trim().min(2, "RAM is required"),
  storage: z.string().trim().min(2, "Storage is required"),
  display: z.string().trim().min(2, "Display is required"),
  gpu: z.string().trim().min(2, "Graphics (GPU) is required"),
  os: z.string().trim().min(2, "Operating System is required"),
  battery: z.string().trim().min(2, "Battery info is required"),
  weight: z.string().trim().min(1, "Weight is required"),
  ports: z.string().trim().optional(),
  warranty: z.string().trim().optional(),
});

export const adminProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Product name must be at least 3 characters"),
    slug: z
      .string()
      .trim()
      .min(3, "Slug is required")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase letters, numbers, and hyphens only"
      ),
    sku: z.string().trim().min(2, "SKU is required"),
    brand: z.enum(["HP", "Dell"]),
    category: z.enum([
      "budget",
      "business",
      "gaming",
      "student",
      "ultrabook",
    ]),
    shortDescription: z
      .string()
      .trim()
      .min(10, "Short description must be at least 10 characters"),
    description: z
      .string()
      .trim()
      .min(20, "Full description must be at least 20 characters"),
    price: z.coerce.number().positive("Price must be greater than 0"),
    oldPrice: z
      .union([z.coerce.number().positive(), z.literal(""), z.undefined()])
      .optional()
      .transform((val) =>
        val === "" || val === undefined || Number.isNaN(Number(val))
          ? undefined
          : Number(val)
      ),
    stock: z.coerce
      .number()
      .int("Stock must be a whole number")
      .min(0, "Stock cannot be negative"),
    lowStockThreshold: z.coerce
      .number()
      .int()
      .min(1, "Low stock threshold must be at least 1")
      .default(5),
    status: z.enum(["published", "draft"]).default("published"),
    tags: z.array(z.string().trim().min(1)).default([]),
    highlights: z.array(z.string().trim().min(1)).default([]),
    images: z
      .array(z.string().trim().min(1))
      .min(1, "At least one product image is required"),
    specs: adminProductSpecsSchema,
    seoTitle: z.string().trim().optional(),
    seoDescription: z.string().trim().optional(),
  })
  .refine(
    (data) => data.oldPrice === undefined || data.oldPrice > data.price,
    {
      message: "Compare-at (old) price must be greater than the selling price",
      path: ["oldPrice"],
    }
  );

export type AdminProductFormValues = z.input<typeof adminProductSchema>;
export type AdminProductParsedValues = z.output<typeof adminProductSchema>;

export const adminOrderStatusUpdateSchema = z.object({
  orderId: z.string().trim().min(1, "Order ID is required"),
  nextStatus: z.enum([
    "Pending",
    "Confirmed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ]),
  trackingNumber: z.string().trim().optional(),
  courier: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

export const adminOrderPaymentUpdateSchema = z.object({
  orderId: z.string().trim().min(1, "Order ID is required"),
  paymentStatus: z.enum(["Unpaid", "Pending Verification", "Paid", "Refunded"]),
});

export const adminOrderNoteSchema = z.object({
  orderId: z.string().trim().min(1, "Order ID is required"),
  text: z.string().trim().min(2, "Note cannot be empty"),
});

export const adminCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Coupon code must be at least 3 characters")
    .max(24, "Coupon code cannot exceed 24 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Coupon code must be alphanumeric"),
  description: z.string().trim().min(4, "Description is required"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce
    .number()
    .positive("Discount value must be greater than 0"),
  minOrderAmount: z.coerce
    .number()
    .min(0, "Minimum order amount cannot be negative"),
  maxDiscountAmount: z
    .union([z.coerce.number().positive(), z.literal(""), z.undefined()])
    .optional()
    .transform((val) =>
      val === "" || val === undefined || Number.isNaN(Number(val))
        ? undefined
        : Number(val)
    ),
  usageLimit: z
    .union([z.coerce.number().int().positive(), z.literal(""), z.undefined()])
    .optional()
    .transform((val) =>
      val === "" || val === undefined || Number.isNaN(Number(val))
        ? undefined
        : Number(val)
    ),
  perUserLimit: z
    .union([z.coerce.number().int().positive(), z.literal(""), z.undefined()])
    .optional()
    .transform((val) =>
      val === "" || val === undefined || Number.isNaN(Number(val))
        ? undefined
        : Number(val)
    ),
  startDate: z.string().trim().optional(),
  expiresAt: z.string().trim().min(4, "Expiry date is required"),
  isActive: z.boolean().default(true),
});

export type AdminCouponFormValues = z.input<typeof adminCouponSchema>;

export const adminStoreSettingsSchema = z.object({
  storeName: z.string().trim().min(2, "Store name is required"),
  tagline: z.string().trim().min(4, "Tagline is required"),
  supportEmail: z.string().trim().email("Valid support email is required"),
  supportPhone: z.string().trim().min(6, "Support phone is required"),
  address: z.string().trim().min(5, "Store address is required"),
  hours: z.string().trim().min(3, "Business hours are required"),
  currencyCode: z.string().trim().min(3, "Currency code is required"),
  currencySymbol: z.string().trim().min(1, "Currency symbol is required"),
  locale: z.string().trim().min(2, "Locale is required"),
  freeDeliveryThreshold: z.coerce.number().min(0),
  standardShippingFee: z.coerce.number().min(0),
  expressShippingFee: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).max(1, "Tax rate must be between 0 and 1"),
  lowStockThreshold: z.coerce.number().int().min(1),
  codFee: z.coerce.number().min(0),
  warrantyText: z.string().trim().min(3, "Warranty text is required"),
  enabledPaymentMethods: z
    .array(z.enum(["card", "cod", "bank_transfer", "mobile_wallet"]))
    .min(1, "Enable at least one payment method"),
  bankDetails: z.object({
    bankName: z.string().trim().min(2, "Bank name is required"),
    accountTitle: z.string().trim().min(2, "Account title is required"),
    accountNumber: z.string().trim().min(4, "Account number is required"),
    iban: z.string().trim().min(4, "IBAN is required"),
    routingNumber: z.string().trim().min(3, "Routing number is required"),
    swiftCode: z.string().trim().min(3, "SWIFT code is required"),
    instructions: z.string().trim().min(5, "Instructions are required"),
  }),
});

export type AdminStoreSettingsFormValues = z.input<
  typeof adminStoreSettingsSchema
>;
