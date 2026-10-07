"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/guard";
import { recordAuditLog } from "@/lib/auditLog";
import {
  createCoupon,
  deleteCoupon,
  getCouponByCode,
  updateCoupon,
} from "@/lib/couponStore";
import { sendOrderStatusUpdateEmail } from "@/lib/email";
import {
  addOrderInternalNote,
  updateOrderPaymentStatus,
  updateOrderStatus,
} from "@/lib/orders";
import {
  bulkUpdateProducts,
  createProduct,
  deleteProduct,
  duplicateProduct,
  getProductById,
  updateProduct,
} from "@/lib/productStore";
import {
  bulkUpdateReviewStatus,
  deleteReviewById,
} from "@/lib/reviewStore";
import { saveStoreSettings } from "@/lib/settingsStore";
import {
  setUserDisabledStatus,
  setUserRole,
} from "@/lib/users";
import {
  adminCouponSchema,
  adminOrderNoteSchema,
  adminOrderPaymentUpdateSchema,
  adminOrderStatusUpdateSchema,
  adminProductSchema,
  adminStoreSettingsSchema,
  type AdminCouponFormValues,
  type AdminProductFormValues,
  type AdminStoreSettingsFormValues,
} from "@/lib/validations/admin";
import type { LaptopCategory, Product } from "@/types/product";

function revalidateAllStorePaths(slug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/laptops");
  revalidatePath("/laptops/hp");
  revalidatePath("/laptops/dell");
  revalidatePath("/deals");
  revalidatePath("/search");
  if (slug) {
    revalidatePath(`/laptops/${slug}`);
  }
  revalidatePath("/admin", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/customers");
  revalidatePath("/admin/coupons");
  revalidatePath("/admin/reviews");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/activity");
}

/* ============================================================================
 * 1. Product Actions
 * ========================================================================== */

export async function createProductAction(
  input: AdminProductFormValues
): Promise<{
  success: boolean;
  product?: Product;
  error?: string;
}> {
  try {
    const guard = await requireAdmin();
    if (!guard.authorized) {
      return { success: false, error: guard.error };
    }
    const admin = guard.admin;

    const parsed = adminProductSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid product data.",
      };
    }

    const created = createProduct(parsed.data);

    recordAuditLog({
      actor: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
      action: "product.create",
      entityType: "product",
      entityId: created.id,
      summary: `Created product "${created.name}" (${created.brand}, $${created.price})`,
    });

    revalidateAllStorePaths(created.slug);
    return { success: true, product: created };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create product.",
    };
  }
}

export async function updateProductAction(
  id: string,
  input: AdminProductFormValues
): Promise<{
  success: boolean;
  product?: Product;
  error?: string;
}> {
  try {
    const guard = await requireAdmin();
    if (!guard.authorized) {
      return { success: false, error: guard.error };
    }
    const admin = guard.admin;

    const parsed = adminProductSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid product data.",
      };
    }

    const previous = getProductById(id, { includeDrafts: true });
    const updated = updateProduct(id, parsed.data);
    if (!updated) {
      return { success: false, error: "Product not found." };
    }

    recordAuditLog({
      actor: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
      action: "product.update",
      entityType: "product",
      entityId: updated.id,
      summary: `Updated product "${updated.name}" (Price: $${updated.price}, Stock: ${updated.stock}, Status: ${updated.status})`,
    });

    if (previous?.slug && previous.slug !== updated.slug) {
      revalidatePath(`/laptops/${previous.slug}`);
    }
    revalidateAllStorePaths(updated.slug);
    return { success: true, product: updated };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update product.",
    };
  }
}

export async function duplicateProductAction(id: string): Promise<{
  success: boolean;
  product?: Product;
  error?: string;
}> {
  try {
    const guard = await requireAdmin();
    if (!guard.authorized) {
      return { success: false, error: guard.error };
    }
    const admin = guard.admin;

    const copy = duplicateProduct(id);
    if (!copy) {
      return { success: false, error: "Source product not found." };
    }

    recordAuditLog({
      actor: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
      action: "product.duplicate",
      entityType: "product",
      entityId: copy.id,
      summary: `Duplicated product as "${copy.name}" (draft)`,
    });

    revalidateAllStorePaths(copy.slug);
    return { success: true, product: copy };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to duplicate product.",
    };
  }
}

export async function deleteProductAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const guard = await requireAdmin();
    if (!guard.authorized) {
      return { success: false, error: guard.error };
    }
    const admin = guard.admin;

    const deleted = deleteProduct(id);
    if (!deleted) {
      return { success: false, error: "Product not found." };
    }

    recordAuditLog({
      actor: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
      action: "product.delete",
      entityType: "product",
      entityId: id,
      summary: `Deleted product "${deleted.name}" (${deleted.sku ?? deleted.slug})`,
    });

    revalidateAllStorePaths(deleted.slug);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete product.",
    };
  }
}

export async function bulkProductsAction(input: {
  ids: string[];
  action: "publish" | "unpublish" | "delete" | "set_category";
  category?: LaptopCategory;
}): Promise<{
  success: boolean;
  affected?: number;
  error?: string;
}> {
  try {
    const guard = await requireAdmin();
    if (!guard.authorized) {
      return { success: false, error: guard.error };
    }
    const admin = guard.admin;

    if (!Array.isArray(input.ids) || input.ids.length === 0) {
      return { success: false, error: "Select at least one product." };
    }

    const result = bulkUpdateProducts(input.ids, {
      type: input.action,
      category: input.category,
    });

    recordAuditLog({
      actor: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
      action: `product.bulk_${input.action}`,
      entityType: "product",
      entityId: input.ids.join(","),
      summary: `Executed bulk "${input.action}" on ${result.count} product(s)${
        input.category ? ` -> ${input.category}` : ""
      }`,
    });

    revalidateAllStorePaths();
    return { success: true, affected: result.count };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to run bulk product action.",
    };
  }
}

/* ============================================================================
 * 2. Order Actions
 * ========================================================================== */

export async function updateOrderStatusAction(input: {
  orderId: string;
  nextStatus: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  trackingNumber?: string;
  courier?: string;
  note?: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const guard = await requireAdmin();
    if (!guard.authorized) {
      return { success: false, error: guard.error };
    }
    const admin = guard.admin;

    const parsed = adminOrderStatusUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid order update data.",
      };
    }

    const result = updateOrderStatus(
      parsed.data.orderId,
      parsed.data.nextStatus,
      {
        trackingNumber: parsed.data.trackingNumber,
        courier: parsed.data.courier,
        note: parsed.data.note,
        changedBy: admin.fullName,
        changedByEmail: admin.email,
      }
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const updated = result.order;

    await sendOrderStatusUpdateEmail({
      order: updated,
      previousStatus: result.previousStatus,
      note: parsed.data.note,
    });

    recordAuditLog({
      actor: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
      action: "order.status_change",
      entityType: "order",
      entityId: updated.id,
      summary: `Changed order ${updated.id} status from ${result.previousStatus} to ${updated.status}${
        updated.trackingNumber
          ? ` (Tracking: ${updated.courier ?? "Courier"} ${updated.trackingNumber})`
          : ""
      }`,
    });

    revalidateAllStorePaths();
    revalidatePath(`/admin/orders/${updated.id}`);
    revalidatePath(`/order-confirmation/${updated.id}`);
    revalidatePath(`/account/orders/${updated.id}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to update order status.",
    };
  }
}

export async function updateOrderPaymentStatusAction(input: {
  orderId: string;
  paymentStatus: "Unpaid" | "Pending Verification" | "Paid" | "Refunded";
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const guard = await requireAdmin();
    if (!guard.authorized) {
      return { success: false, error: guard.error };
    }
    const admin = guard.admin;

    const parsed = adminOrderPaymentUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid payment status.",
      };
    }

    const result = updateOrderPaymentStatus(
      parsed.data.orderId,
      parsed.data.paymentStatus,
      {
        changedBy: admin.fullName,
        changedByEmail: admin.email,
      }
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const updated = result.order;

    recordAuditLog({
      actor: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
      action: "order.payment_status_change",
      entityType: "order",
      entityId: updated.id,
      summary: `Marked payment for order ${updated.id} as ${updated.paymentStatus}`,
    });

    revalidateAllStorePaths();
    revalidatePath(`/admin/orders/${updated.id}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to update payment status.",
    };
  }
}

export async function addOrderNoteAction(input: {
  orderId: string;
  text: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const guard = await requireAdmin();
    if (!guard.authorized) {
      return { success: false, error: guard.error };
    }
    const admin = guard.admin;

    const parsed = adminOrderNoteSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid note.",
      };
    }

    const result = addOrderInternalNote(parsed.data.orderId, parsed.data.text, {
      fullName: admin.fullName,
      email: admin.email,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const updated = result.order;

    recordAuditLog({
      actor: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
      action: "order.add_note",
      entityType: "order",
      entityId: updated.id,
      summary: `Added internal note on order ${updated.id}`,
    });

    revalidatePath(`/admin/orders/${updated.id}`);
    revalidatePath("/admin/activity");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to add order note.",
    };
  }
}

/* ============================================================================
 * 3. Customer Actions
 * ========================================================================== */

export async function toggleCustomerDisabledAction(
  userId: string,
  disabled: boolean
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const guard = await requireAdmin();
    if (!guard.authorized) {
      return { success: false, error: guard.error };
    }
    const admin = guard.admin;

    const result = setUserDisabledStatus(userId, disabled);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const updated = result.user;

    recordAuditLog({
      actor: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
      action: disabled ? "customer.disable" : "customer.enable",
      entityType: "customer",
      entityId: updated.id,
      summary: `${disabled ? "Disabled" : "Enabled"} account for ${updated.fullName} (${updated.email})`,
    });

    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${userId}`);
    revalidatePath("/admin/activity");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to update customer account status.",
    };
  }
}

export async function updateCustomerRoleAction(
  userId: string,
  role: "customer" | "admin"
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const guard = await requireAdmin();
    if (!guard.authorized) {
      return { success: false, error: guard.error };
    }
    const admin = guard.admin;

    const result = setUserRole(userId, role);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const updated = result.user;

    recordAuditLog({
      actor: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
      action:
        role === "admin" ? "customer.promote_admin" : "customer.demote_admin",
      entityType: "customer",
      entityId: updated.id,
      summary: `Changed role for ${updated.fullName} (${updated.email}) to ${role.toUpperCase()}`,
    });

    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${userId}`);
    revalidatePath("/admin/activity");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to update user role.",
    };
  }
}

/* ============================================================================
 * 4. Coupon Actions
 * ========================================================================== */

export async function createCouponAction(
  input: AdminCouponFormValues
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const guard = await requireAdmin();
    if (!guard.authorized) {
      return { success: false, error: guard.error };
    }
    const admin = guard.admin;

    const parsed = adminCouponSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid coupon data.",
      };
    }

    const created = createCoupon(parsed.data);

    recordAuditLog({
      actor: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
      action: "coupon.create",
      entityType: "coupon",
      entityId: created.code,
      summary: `Created coupon ${created.code} (${
        created.discountType === "percentage"
          ? `${created.discountValue}% off`
          : `$${created.discountValue} off`
      })`,
    });

    revalidateAllStorePaths();
    return { success: true };
  } catch (err) {
    const msg =
      err instanceof Error && err.message === "DUPLICATE_COUPON_CODE"
        ? "A coupon with this code already exists."
        : err instanceof Error
        ? err.message
        : "Failed to create coupon.";
    return {
      success: false,
      error: msg,
    };
  }
}

export async function updateCouponAction(
  idOrCode: string,
  input: AdminCouponFormValues
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const guard = await requireAdmin();
    if (!guard.authorized) {
      return { success: false, error: guard.error };
    }
    const admin = guard.admin;

    const parsed = adminCouponSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid coupon data.",
      };
    }

    const target = getCouponByCode(idOrCode);
    const couponId = target ? target.id : idOrCode;
    const updated = updateCoupon(couponId, parsed.data);
    if (!updated) {
      return { success: false, error: "Coupon not found." };
    }

    recordAuditLog({
      actor: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
      action: "coupon.update",
      entityType: "coupon",
      entityId: updated.code,
      summary: `Updated coupon ${updated.code} (Active: ${updated.isActive})`,
    });

    revalidateAllStorePaths();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update coupon.",
    };
  }
}

export async function toggleCouponActiveAction(
  codeOrId: string,
  isActive: boolean
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const guard = await requireAdmin();
    if (!guard.authorized) {
      return { success: false, error: guard.error };
    }
    const admin = guard.admin;

    const target = getCouponByCode(codeOrId);
    const couponId = target ? target.id : codeOrId;
    const updated = updateCoupon(couponId, { isActive });
    if (!updated) {
      return { success: false, error: "Coupon not found." };
    }

    recordAuditLog({
      actor: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
      action: isActive ? "coupon.activate" : "coupon.deactivate",
      entityType: "coupon",
      entityId: updated.code,
      summary: `${isActive ? "Activated" : "Deactivated"} coupon ${updated.code}`,
    });

    revalidateAllStorePaths();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle coupon.",
    };
  }
}

export async function deleteCouponAction(codeOrId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const guard = await requireAdmin();
    if (!guard.authorized) {
      return { success: false, error: guard.error };
    }
    const admin = guard.admin;

    const target = getCouponByCode(codeOrId);
    const couponId = target ? target.id : codeOrId;
    const deleted = deleteCoupon(couponId);
    if (!deleted) {
      return { success: false, error: "Coupon not found." };
    }

    recordAuditLog({
      actor: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
      action: "coupon.delete",
      entityType: "coupon",
      entityId: deleted.code,
      summary: `Deleted coupon ${deleted.code}`,
    });

    revalidateAllStorePaths();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete coupon.",
    };
  }
}

/* ============================================================================
 * 5. Review Moderation Actions
 * ========================================================================== */

export async function moderateReviewAction(
  id: string,
  status: "Pending" | "Approved" | "Rejected"
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const guard = await requireAdmin();
    if (!guard.authorized) {
      return { success: false, error: guard.error };
    }
    const admin = guard.admin;

    const result = bulkUpdateReviewStatus([id], status);
    if (result.updatedCount === 0) {
      return { success: false, error: "Review not found." };
    }

    recordAuditLog({
      actor: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
      action: `review.${status.toLowerCase()}`,
      entityType: "review",
      entityId: id,
      summary: `Marked review ${id} as ${status}`,
    });

    for (const slug of result.affectedProductSlugs) {
      revalidateAllStorePaths(slug);
    }
    revalidateAllStorePaths();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to moderate review.",
    };
  }
}

export async function bulkModerateReviewsAction(
  ids: string[],
  status: "Approved" | "Rejected"
): Promise<{
  success: boolean;
  affected?: number;
  error?: string;
}> {
  try {
    const guard = await requireAdmin();
    if (!guard.authorized) {
      return { success: false, error: guard.error };
    }
    const admin = guard.admin;

    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, error: "Select at least one review." };
    }

    const result = bulkUpdateReviewStatus(ids, status);

    recordAuditLog({
      actor: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
      action: `review.bulk_${status.toLowerCase()}`,
      entityType: "review",
      entityId: ids.join(","),
      summary: `Bulk ${status.toLowerCase()} ${result.updatedCount} review(s)`,
    });

    revalidateAllStorePaths();
    return { success: true, affected: result.updatedCount };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to bulk moderate reviews.",
    };
  }
}

export async function deleteReviewAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const guard = await requireAdmin();
    if (!guard.authorized) {
      return { success: false, error: guard.error };
    }
    const admin = guard.admin;

    const deleted = deleteReviewById(id);
    if (!deleted) {
      return { success: false, error: "Review not found." };
    }

    recordAuditLog({
      actor: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
      action: "review.delete",
      entityType: "review",
      entityId: id,
      summary: `Deleted review "${deleted.title}" by ${deleted.author}`,
    });

    revalidateAllStorePaths(deleted.productSlug);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete review.",
    };
  }
}

/* ============================================================================
 * 6. Store Settings Action
 * ========================================================================== */

export async function updateStoreSettingsAction(
  input: AdminStoreSettingsFormValues
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const guard = await requireAdmin();
    if (!guard.authorized) {
      return { success: false, error: guard.error };
    }
    const admin = guard.admin;

    const parsed = adminStoreSettingsSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid settings values.",
      };
    }

    const v = parsed.data;
    const updated = saveStoreSettings({
      storeInfo: {
        name: v.storeName,
        tagline: v.tagline,
        email: v.supportEmail,
        phone: v.supportPhone,
        address: v.address,
        hours: v.hours,
      },
      currency: {
        code: v.currencyCode,
        symbol: v.currencySymbol,
        locale: v.locale,
        maximumFractionDigits: 0,
      },
      shipping: {
        freeDeliveryThreshold: v.freeDeliveryThreshold,
        flatShippingFee: v.standardShippingFee,
        expressShippingFee: v.expressShippingFee,
        codHandlingFee: v.codFee,
        taxRate: v.taxRate,
        lowStockThreshold: v.lowStockThreshold,
        warrantyText: v.warrantyText,
      },
      bankDetails: v.bankDetails,
      enabledPaymentMethods: v.enabledPaymentMethods,
    });

    recordAuditLog({
      actor: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
      action: "settings.update",
      entityType: "settings",
      entityId: "store-settings",
      summary: `Updated store settings (Free Delivery: $${updated.shipping.freeDeliveryThreshold}, Standard Shipping: $${updated.shipping.flatShippingFee}, Tax Rate: ${(updated.shipping.taxRate * 100).toFixed(1)}%)`,
    });

    revalidateAllStorePaths();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update settings.",
    };
  }
}
