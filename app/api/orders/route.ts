import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  calculateCartTotals,
  resolveCatalogItem,
  type CartItemData,
} from "@/lib/cart";
import {
  getDeliveryMethodConfig,
  getEstimatedDeliveryWindow,
  getPaymentMethodConfig,
} from "@/lib/checkout";
import { incrementCouponUsage } from "@/lib/couponStore";
import { sendOrderConfirmationEmail, sendWelcomeEmail } from "@/lib/email";
import {
  findOrderForTracking,
  generateOrderId,
  getOrderById,
  getOrdersByUser,
  linkGuestOrdersToUser,
  saveOrder,
  type OrderLineItem,
  type OrderRecord,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/orders";
import {
  createUser,
  getUserByEmail,
  upsertUserAddress,
} from "@/lib/users";
import { sanitizeText } from "@/lib/validations/auth";
import { createOrderPayloadSchema } from "@/lib/validations/checkout";

/**
 * GET /api/orders
 * - Without `orderId`: returns the authenticated user's orders (`401` if not logged in).
 * - With `orderId`: looks up a specific order, enforcing ownership / email verification so a user cannot read another user's order.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId") ?? "";
  const email = searchParams.get("email") ?? "";

  // List all orders for the authenticated user
  if (!orderId.trim()) {
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required to list your orders." },
        { status: 401 }
      );
    }
    const orders = getOrdersByUser(
      session.user.id,
      session.user.email ?? undefined
    );
    return NextResponse.json({ orders }, { status: 200 });
  }

  // Single order lookup
  const order = email.trim()
    ? findOrderForTracking(orderId, email)
    : getOrderById(orderId);

  if (!order) {
    return NextResponse.json(
      {
        error: email.trim()
          ? `No order found matching ID "${orderId.toUpperCase()}" and email "${email}".`
          : `Order "${orderId.toUpperCase()}" was not found.`,
      },
      { status: 404 }
    );
  }

  // Enforce ownership if a different user is logged in and did not supply the order's email
  if (session?.user?.id) {
    const isOwnerById = order.userId === session.user.id;
    const isOwnerBySessionEmail =
      Boolean(session.user.email) &&
      order.customer.email.toLowerCase() === session.user.email!.toLowerCase();
    const isVerifiedByQueryEmail =
      Boolean(email.trim()) &&
      order.customer.email.toLowerCase() === email.trim().toLowerCase();

    if (!isOwnerById && !isOwnerBySessionEmail && !isVerifiedByQueryEmail) {
      return NextResponse.json(
        { error: `Order "${orderId.toUpperCase()}" was not found.` },
        { status: 404 }
      );
    }
  }

  return NextResponse.json({ order }, { status: 200 });
}

/**
 * POST /api/orders
 * Validates payload with Zod, re-verifies product stock and live catalog prices on the server,
 * computes authoritative totals, links or creates the user account if requested,
 * stores the order in /lib/orders.ts, and dispatches a mock email.
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body.", step: 4 },
      { status: 400 }
    );
  }

  const parsed = createOrderPayloadSchema.safeParse(rawBody);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const pathStr = firstIssue?.path.join(".") ?? "";
    let returnStep: 1 | 2 | 3 | 4 = 4;
    if (pathStr.startsWith("shipping")) returnStep = 1;
    else if (pathStr.startsWith("deliveryMethodId")) returnStep = 2;
    else if (
      pathStr.startsWith("paymentMethodId") ||
      pathStr.startsWith("walletPhone") ||
      pathStr.startsWith("cardMeta")
    ) {
      returnStep = 3;
    }

    return NextResponse.json(
      {
        error: firstIssue?.message ?? "Please check your checkout information.",
        code: "VALIDATION_ERROR",
        step: returnStep,
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Re-verify every item against live catalog data (never trust client prices or stock)
  const serverCartItems: CartItemData[] = [];
  for (const clientItem of data.items) {
    const live = resolveCatalogItem(clientItem.productId);
    if (!live) {
      return NextResponse.json(
        {
          error: `Product "${clientItem.productId}" is no longer available in our catalog.`,
          code: "ITEM_NOT_FOUND",
          step: 4,
        },
        { status: 409 }
      );
    }

    if (live.stock <= 0) {
      return NextResponse.json(
        {
          error: `"${live.name}" is now out of stock. Please remove it from your cart to continue.`,
          code: "OUT_OF_STOCK",
          productId: live.productId,
          step: 4,
        },
        { status: 409 }
      );
    }

    if (clientItem.quantity > live.stock) {
      return NextResponse.json(
        {
          error: `Only ${live.stock} units of "${live.name}" remain in stock. Please adjust your quantity.`,
          code: "INSUFFICIENT_STOCK",
          productId: live.productId,
          availableStock: live.stock,
          step: 4,
        },
        { status: 409 }
      );
    }

    if (clientItem.expectedUnitPrice !== live.price) {
      return NextResponse.json(
        {
          error: `The price of "${live.name}" has updated to $${live.price}. Please review your updated total.`,
          code: "PRICE_CHANGED",
          productId: live.productId,
          newPrice: live.price,
          step: 4,
        },
        { status: 409 }
      );
    }

    serverCartItems.push({
      productId: live.productId,
      slug: live.slug,
      name: live.name,
      brand: live.brand,
      image: live.image,
      price: live.price,
      oldPrice: live.oldPrice,
      quantity: clientItem.quantity,
      stock: live.stock,
      specsSummary: live.specsSummary,
      itemType: live.itemType,
    });
  }

  // Compute authoritative server totals (including per-user coupon limit check)
  const userIdentifier =
    session?.user?.email || data.shipping.email.trim().toLowerCase();
  const totals = calculateCartTotals(serverCartItems, data.couponCode ?? null, {
    deliveryMethodId: data.deliveryMethodId,
    paymentMethodId: data.paymentMethodId,
    userIdentifier,
  });

  if (
    data.couponCode &&
    data.couponCode.trim().length > 0 &&
    totals.couponValidation &&
    !totals.couponValidation.valid
  ) {
    return NextResponse.json(
      {
        error: totals.couponValidation.message,
        code: "INVALID_COUPON",
        step: 4,
      },
      { status: 409 }
    );
  }

  const deliveryMethod = getDeliveryMethodConfig(data.deliveryMethodId);
  const paymentMethod = getPaymentMethodConfig(data.paymentMethodId);
  const deliveryWindow = getEstimatedDeliveryWindow(data.deliveryMethodId);

  const orderStatus: OrderStatus =
    data.paymentMethodId === "card" || data.paymentMethodId === "mobile_wallet"
      ? "Confirmed"
      : "Pending";

  const paymentStatus: PaymentStatus =
    data.paymentMethodId === "card"
      ? "Authorized (Demo)"
      : data.paymentMethodId === "cod"
      ? "Cash on Delivery"
      : data.paymentMethodId === "bank_transfer"
      ? "Awaiting Bank Transfer"
      : "Pending Verification";

  const orderItems: OrderLineItem[] = totals.reconciledItems.map((item) => ({
    productId: item.productId,
    slug: item.slug,
    name: item.name,
    brand: item.brand,
    image: item.image,
    unitPrice: item.currentPrice,
    oldPrice: item.currentOldPrice,
    quantity: item.effectiveQuantity,
    lineTotal: item.lineTotal,
    specsSummary: item.specsSummary,
  }));

  const billingAddress =
    data.shipping.billingSameAsShipping || !data.shipping.billingAddress
      ? data.shipping.shippingAddress
      : data.shipping.billingAddress;

  // Determine user linking or guest account creation
  let resolvedUserId: string | undefined = session?.user?.id;
  let accountCreated = false;
  let accountCreatedMessage: string | undefined;

  if (resolvedUserId) {
    // Save shipping address to the logged-in user's address book if requested
    if (data.shipping.saveAddress) {
      upsertUserAddress(resolvedUserId, {
        label: "Shipping",
        fullName: data.shipping.fullName,
        phone: data.shipping.phone,
        streetAddress: data.shipping.shippingAddress.streetAddress,
        apartment: data.shipping.shippingAddress.apartment,
        city: data.shipping.shippingAddress.city,
        stateProvince: data.shipping.shippingAddress.stateProvince,
        postalCode: data.shipping.shippingAddress.postalCode,
        country: data.shipping.shippingAddress.country,
        isDefault: false,
      });
    }
  } else {
    const existingByEmail = getUserByEmail(data.shipping.email);
    if (existingByEmail) {
      resolvedUserId = existingByEmail.id;
      if (data.shipping.createAccount) {
        accountCreatedMessage = `An account for ${existingByEmail.email} already exists — we automatically linked this order to your account.`;
      }
    } else if (data.shipping.createAccount) {
      const providedPassword =
        data.shipping.accountPassword &&
        data.shipping.accountPassword.trim().length >= 8
          ? data.shipping.accountPassword.trim()
          : undefined;

      const createdUser = await createUser({
        fullName: data.shipping.fullName,
        email: data.shipping.email,
        phone: data.shipping.phone,
        password: providedPassword,
        provider: "credentials",
        addresses: [
          {
            id: `addr-${Date.now()}`,
            label: "Home",
            fullName: sanitizeText(data.shipping.fullName),
            phone: sanitizeText(data.shipping.phone),
            streetAddress: sanitizeText(
              data.shipping.shippingAddress.streetAddress
            ),
            apartment: data.shipping.shippingAddress.apartment
              ? sanitizeText(data.shipping.shippingAddress.apartment)
              : "",
            city: sanitizeText(data.shipping.shippingAddress.city),
            stateProvince: sanitizeText(
              data.shipping.shippingAddress.stateProvince
            ),
            postalCode: sanitizeText(data.shipping.shippingAddress.postalCode),
            country: sanitizeText(data.shipping.shippingAddress.country),
            isDefault: true,
          },
        ],
      });

      resolvedUserId = createdUser.id;
      accountCreated = true;
      accountCreatedMessage = providedPassword
        ? `Account created for ${createdUser.email}! You can now sign in anytime using the password you chose at checkout.`
        : `Account created for ${createdUser.email}! Use "Forgot Password" on the login page to set your password and manage your orders.`;

      await sendWelcomeEmail({
        email: createdUser.email,
        fullName: createdUser.fullName,
        temporaryPasswordNote: accountCreatedMessage,
      });
    }
  }

  const newOrder: OrderRecord = {
    id: generateOrderId(),
    userId: resolvedUserId,
    createdAt: new Date().toISOString(),
    estimatedDelivery: deliveryWindow.label,
    status: orderStatus,
    paymentStatus,
    items: orderItems,
    customer: {
      fullName: sanitizeText(data.shipping.fullName),
      email: data.shipping.email.trim().toLowerCase(),
      phone: sanitizeText(data.shipping.phone),
      createAccount: data.shipping.createAccount,
    },
    shippingAddress: {
      streetAddress: sanitizeText(data.shipping.shippingAddress.streetAddress),
      apartment: data.shipping.shippingAddress.apartment
        ? sanitizeText(data.shipping.shippingAddress.apartment)
        : "",
      city: sanitizeText(data.shipping.shippingAddress.city),
      stateProvince: sanitizeText(data.shipping.shippingAddress.stateProvince),
      postalCode: sanitizeText(data.shipping.shippingAddress.postalCode),
      country: sanitizeText(data.shipping.shippingAddress.country),
    },
    billingAddress: {
      streetAddress: sanitizeText(billingAddress.streetAddress),
      apartment: billingAddress.apartment
        ? sanitizeText(billingAddress.apartment)
        : "",
      city: sanitizeText(billingAddress.city),
      stateProvince: sanitizeText(billingAddress.stateProvince),
      postalCode: sanitizeText(billingAddress.postalCode),
      country: sanitizeText(billingAddress.country),
    },
    deliveryMethodId: data.deliveryMethodId,
    deliveryMethodLabel: `${deliveryMethod.label} (${deliveryMethod.tagline})`,
    paymentMethodId: data.paymentMethodId,
    paymentMethodLabel: paymentMethod.label,
    paymentDetails: {
      cardBrand: data.cardMeta?.brand,
      cardLast4: data.cardMeta?.last4,
      cardHolderName: data.cardMeta?.cardHolderName
        ? sanitizeText(data.cardMeta.cardHolderName)
        : undefined,
      walletPhone: data.walletPhone
        ? sanitizeText(data.walletPhone)
        : undefined,
    },
    totals: {
      totalItems: totals.totalItems,
      subtotal: totals.subtotal,
      productSavings: totals.productSavings,
      couponCode: totals.couponValidation?.valid ? totals.couponCode : null,
      couponDiscount: totals.couponDiscount,
      shipping: totals.shipping,
      codFee: totals.codFee,
      tax: totals.tax,
      grandTotal: totals.grandTotal,
    },
    notes: data.shipping.deliveryNotes
      ? sanitizeText(data.shipping.deliveryNotes)
      : undefined,
    accountCreatedMessage,
  };

  saveOrder(newOrder);
  if (newOrder.totals.couponCode) {
    incrementCouponUsage(newOrder.totals.couponCode, userIdentifier);
  }
  if (resolvedUserId) {
    linkGuestOrdersToUser(newOrder.customer.email, resolvedUserId);
  }
  await sendOrderConfirmationEmail(newOrder);

  return NextResponse.json(
    {
      order: newOrder,
      accountCreated,
      accountCreatedMessage,
    },
    { status: 201 }
  );
}
