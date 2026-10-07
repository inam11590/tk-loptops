import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone, User } from "lucide-react";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { OrderTimeline } from "@/components/admin/OrderTimeline";
import { Badge } from "@/components/ui/badge";
import { requireAdminPage } from "@/lib/admin/guard";
import { formatPrice, getSettings } from "@/lib/config";
import { getOrderById } from "@/lib/orders";

export const dynamic = "force-dynamic";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  await requireAdminPage();
  const { id } = await params;

  const order = getOrderById(id);
  if (!order) {
    notFound();
  }

  const settings = getSettings();

  return (
    <div className="space-y-6">
      {/* Print-Only Official Invoice & Packing Slip Header */}
      <div className="hidden border-b border-border pb-4 print:block">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-foreground">
              {settings.storeInfo.name} — Official Invoice &amp; Packing Slip
            </h1>
            <p className="text-xs text-muted-foreground">
              {settings.storeInfo.address}
            </p>
            <p className="text-xs text-muted-foreground">
              {settings.storeInfo.email} • {settings.storeInfo.phone}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-base font-bold text-foreground">
              Order #{order.id}
            </p>
            <p className="text-xs text-muted-foreground">
              Date: {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Screen Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="space-y-1">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Orders</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
              Order {order.id}
            </h1>
            <Badge variant="outline" className="text-xs font-bold">
              {order.status}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Payment: {order.paymentStatus ?? "Unpaid"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Placed on {new Date(order.createdAt).toLocaleString()} • Estimated
            Delivery: {order.estimatedDelivery}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 8 Cols: Order Items, Totals, Timeline, Customer & Addresses */}
        <div className="space-y-6 lg:col-span-8">
          {/* Ordered Items & Totals */}
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
            <div className="border-b border-border/60 px-5 py-4">
              <h2 className="font-heading text-base font-bold text-foreground">
                Order Items ({order.totals.totalItems})
              </h2>
            </div>

            <ul className="divide-y divide-border/60">
              {order.items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center justify-between gap-4 p-4 sm:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl bg-surface p-1.5 print:hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={60}
                        height={44}
                        unoptimized={item.image.startsWith("/uploads/")}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-heading text-xs font-bold text-foreground sm:text-sm">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.brand} • {formatPrice(item.unitPrice)} ×{" "}
                        {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 font-heading text-sm font-extrabold text-foreground">
                    {formatPrice(item.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Order Totals Breakdown */}
            <div className="space-y-2 border-t border-border/60 bg-surface/40 p-5 text-xs sm:text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(order.totals.subtotal)}
                </span>
              </div>
              {order.totals.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>
                    Coupon Discount{" "}
                    {order.totals.couponCode
                      ? `(${order.totals.couponCode})`
                      : ""}
                  </span>
                  <span>-{formatPrice(order.totals.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery ({order.deliveryMethodLabel})</span>
                <span className="font-semibold text-foreground">
                  {order.totals.shipping === 0
                    ? "Free"
                    : formatPrice(order.totals.shipping)}
                </span>
              </div>
              {order.totals.codFee > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>COD Handling Fee</span>
                  <span className="font-semibold text-foreground">
                    {formatPrice(order.totals.codFee)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Tax</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(order.totals.tax)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border/80 pt-3 font-heading text-base font-extrabold text-foreground">
                <span>Grand Total</span>
                <span className="text-accent">
                  {formatPrice(order.totals.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline & Audit Trail */}
          <OrderTimeline order={order} />

          {/* Customer & Shipping/Billing Addresses */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 shadow-card">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-accent" />
                <h3 className="font-heading text-sm font-bold text-foreground">
                  Customer Contact
                </h3>
              </div>
              <div className="space-y-1.5 text-xs">
                <p className="font-bold text-foreground">
                  {order.customer.fullName}
                </p>
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{order.customer.email}</span>
                </p>
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{order.customer.phone}</span>
                </p>
                <p className="pt-1 text-muted-foreground">
                  Payment Method:{" "}
                  <strong className="text-foreground">
                    {order.paymentMethodLabel}
                  </strong>
                  {order.paymentDetails?.cardLast4 &&
                    ` (•••• ${order.paymentDetails.cardLast4})`}
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 shadow-card">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                <h3 className="font-heading text-sm font-bold text-foreground">
                  Shipping Address
                </h3>
              </div>
              <address className="not-italic space-y-1 text-xs text-muted-foreground">
                <p className="font-bold text-foreground">
                  {order.customer.fullName}
                </p>
                <p>{order.shippingAddress.streetAddress}</p>
                {order.shippingAddress.apartment && (
                  <p>{order.shippingAddress.apartment}</p>
                )}
                <p>
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.stateProvince}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.notes && (
                  <p className="mt-2 rounded-lg bg-surface p-2 text-[11px] text-foreground">
                    Note: {order.notes}
                  </p>
                )}
              </address>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Status Workflow, Payment Toggle, Internal Notes, Print */}
        <div className="lg:col-span-4">
          <OrderStatusSelect order={order} />
        </div>
      </div>
    </div>
  );
}
