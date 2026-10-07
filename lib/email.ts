import { formatPrice, SITE_CONFIG } from "@/lib/config";
import type { OrderRecord } from "@/lib/orders";

/**
 * Generates an HTML confirmation email for an order and logs it to the server console.
 * Structured so it can be directly passed to Resend or Nodemailer in production.
 */
export function buildOrderConfirmationEmailHtml(order: OrderRecord): string {
  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
          <strong>${item.name}</strong> (${item.brand})<br />
          <span style="color: #64748b; font-size: 12px;">Qty: ${
            item.quantity
          } × ${formatPrice(item.unitPrice)}</span>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600;">
          ${formatPrice(item.lineTotal)}
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Order Confirmation ${order.id} — ${SITE_CONFIG.name}</title>
</head>
<body style="font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f5f7fa; color: #0b1220; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0;">
    <h1 style="margin: 0 0 8px; color: #0b1220; font-size: 22px;">Thank you for your order, ${
      order.customer.fullName
    }!</h1>
    <p style="margin: 0 0 20px; color: #475569; font-size: 14px;">
      We have received your order <strong>${
        order.id
      }</strong>. Estimated arrival: <strong>${
    order.estimatedDelivery
  }</strong>.
    </p>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
      <thead>
        <tr>
          <th style="text-align: left; border-bottom: 2px solid #0b1220; padding-bottom: 8px;">Item</th>
          <th style="text-align: right; border-bottom: 2px solid #0b1220; padding-bottom: 8px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div style="background: #f8fafc; padding: 16px; border-radius: 12px; font-size: 14px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span>Subtotal:</span>
        <strong>${formatPrice(order.totals.subtotal)}</strong>
      </div>
      ${
        order.totals.couponDiscount > 0
          ? `<div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #059669;">
              <span>Promo (${order.totals.couponCode}):</span>
              <strong>- ${formatPrice(order.totals.couponDiscount)}</strong>
            </div>`
          : ""
      }
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span>Delivery (${order.deliveryMethodLabel}):</span>
        <strong>${
          order.totals.shipping === 0
            ? "FREE"
            : formatPrice(order.totals.shipping)
        }</strong>
      </div>
      ${
        order.totals.codFee > 0
          ? `<div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span>COD Handling Fee:</span>
              <strong>${formatPrice(order.totals.codFee)}</strong>
            </div>`
          : ""
      }
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span>Estimated Tax:</span>
        <strong>${formatPrice(order.totals.tax)}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 16px;">
        <strong>Grand Total:</strong>
        <strong style="color: #2563eb;">${formatPrice(
          order.totals.grandTotal
        )}</strong>
      </div>
    </div>

    <p style="margin-top: 24px; font-size: 12px; color: #64748b;">
      Track your order anytime at ${SITE_CONFIG.url}/orders/track?orderId=${
    order.id
  } • Questions? Contact ${SITE_CONFIG.contact.email}.
    </p>
  </div>
</body>
</html>`;
}

export async function sendOrderConfirmationEmail(
  order: OrderRecord
): Promise<{ sent: boolean; subject: string }> {
  const subject = `[${SITE_CONFIG.name}] Order Confirmation #${order.id} (${formatPrice(
    order.totals.grandTotal
  )})`;
  const html = buildOrderConfirmationEmailHtml(order);

  // Log structured mock email to server console (ready for Resend / Nodemailer)
  console.info(
    `\n==================== [MOCK EMAIL DISPATCHED] ====================\n` +
      `To: ${order.customer.fullName} <${order.customer.email}>\n` +
      `Subject: ${subject}\n` +
      `Order ID: ${order.id} | Status: ${order.status} | Payment: ${order.paymentMethodLabel}\n` +
      `HTML Length: ${html.length} bytes\n` +
      `=================================================================\n`
  );

  return { sent: true, subject };
}

/**
 * Logs a password reset link (30-minute expiry) to the server console.
 */
export async function sendPasswordResetEmail(params: {
  email: string;
  fullName: string;
  token: string;
  expiresAt: string;
}): Promise<{ sent: boolean; resetUrl: string }> {
  const baseUrl = process.env.NEXTAUTH_URL || SITE_CONFIG.url;
  const resetUrl = `${baseUrl}/reset-password/${params.token}`;
  const subject = `[${SITE_CONFIG.name}] Reset your password (valid for 30 minutes)`;

  console.info(
    `\n==================== [MOCK PASSWORD RESET EMAIL] ====================\n` +
      `To: ${params.fullName} <${params.email}>\n` +
      `Subject: ${subject}\n` +
      `Reset Link: ${resetUrl}\n` +
      `Expires At: ${params.expiresAt}\n` +
      `=====================================================================\n`
  );

  return { sent: true, resetUrl };
}

/**
 * Logs a welcome email when a user registers or creates an account at checkout.
 */
export async function sendWelcomeEmail(params: {
  email: string;
  fullName: string;
  temporaryPasswordNote?: string;
}): Promise<{ sent: boolean }> {
  const subject = `Welcome to ${SITE_CONFIG.name}, ${params.fullName}!`;

  console.info(
    `\n==================== [MOCK WELCOME EMAIL] ===========================\n` +
      `To: ${params.fullName} <${params.email}>\n` +
      `Subject: ${subject}\n` +
      (params.temporaryPasswordNote
        ? `Account Note: ${params.temporaryPasswordNote}\n`
        : "") +
      `Dashboard: ${SITE_CONFIG.url}/account\n` +
      `=====================================================================\n`
  );

  return { sent: true };
}

/**
 * Logs a mock order status update email to the customer when an admin changes order or payment status.
 */
export async function sendOrderStatusUpdateEmail(params: {
  order: OrderRecord;
  previousStatus?: string;
  note?: string;
}): Promise<{ sent: boolean; subject: string }> {
  const { order, previousStatus, note } = params;
  const subject = `[${SITE_CONFIG.name}] Order #${order.id} Update: ${order.status}`;

  console.info(
    `\n==================== [MOCK ORDER STATUS EMAIL] ======================\n` +
      `To: ${order.customer.fullName} <${order.customer.email}>\n` +
      `Subject: ${subject}\n` +
      `Order ID: ${order.id} | Status: ${
        previousStatus ? `${previousStatus} -> ` : ""
      }${order.status} | Payment: ${order.paymentStatus}\n` +
      (order.trackingNumber
        ? `Courier: ${order.courier || "Express Courier"} | Tracking #: ${order.trackingNumber}\n`
        : "") +
      (note ? `Update Note: ${note}\n` : "") +
      `Track Order: ${SITE_CONFIG.url}/orders/track?orderId=${order.id}\n` +
      `=====================================================================\n`
  );

  return { sent: true, subject };
}


