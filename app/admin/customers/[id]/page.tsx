import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
} from "lucide-react";
import { CustomerActionsClient } from "@/app/admin/customers/[id]/CustomerActionsClient";
import { Badge } from "@/components/ui/badge";
import { requireAdminPage } from "@/lib/admin/guard";
import { formatPrice } from "@/lib/config";
import { getOrdersByUser } from "@/lib/orders";
import { countActiveAdmins, getSafeUserById } from "@/lib/users";

export const dynamic = "force-dynamic";

interface AdminCustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCustomerDetailPage({
  params,
}: AdminCustomerDetailPageProps) {
  await requireAdminPage();
  const { id } = await params;

  const customer = getSafeUserById(id);
  if (!customer) {
    notFound();
  }

  const orders = getOrdersByUser(customer.id, customer.email);
  const nonCancelled = orders.filter((o) => o.status !== "Cancelled");
  const lifetimeValue = nonCancelled.reduce(
    (sum, o) => sum + o.totals.grandTotal,
    0
  );
  const activeAdmins = countActiveAdmins();
  const isLastActiveAdmin =
    customer.role === "admin" && !customer.disabled && activeAdmins <= 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Customers</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
              {customer.fullName}
            </h1>
            <Badge
              variant="outline"
              className={
                customer.role === "admin"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-border"
              }
            >
              {customer.role === "admin" ? "Admin" : "Customer"}
            </Badge>
            <Badge
              variant="outline"
              className={
                customer.disabled
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              }
            >
              {customer.disabled ? "Disabled" : "Active"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{customer.email}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <DollarSign className="h-4 w-4 text-accent" />
            <span>Lifetime Value (LTV)</span>
          </div>
          <p className="mt-2 font-heading text-2xl font-extrabold text-foreground">
            {formatPrice(lifetimeValue)}
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <ShoppingBag className="h-4 w-4 text-accent" />
            <span>Total Orders Placed</span>
          </div>
          <p className="mt-2 font-heading text-2xl font-extrabold text-foreground">
            {orders.length}
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Calendar className="h-4 w-4 text-accent" />
            <span>Member Since</span>
          </div>
          <p className="mt-2 font-heading text-xl font-extrabold text-foreground">
            {new Date(customer.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 8 Cols: Order History & Saved Addresses */}
        <div className="space-y-6 lg:col-span-8">
          {/* Order History */}
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
            <div className="border-b border-border/60 px-5 py-4">
              <h2 className="font-heading text-base font-bold text-foreground">
                Order History ({orders.length})
              </h2>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                This customer has not placed any orders yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-surface/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Items</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-surface/40"
                      >
                        <td className="px-4 py-3 font-mono font-bold">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-accent hover:underline"
                          >
                            {order.id}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {order.totals.totalItems} item(s)
                        </td>
                        <td className="px-4 py-3 font-heading font-bold">
                          {formatPrice(order.totals.grandTotal)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{order.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Saved Addresses */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" />
              <h2 className="font-heading text-base font-bold text-foreground">
                Saved Addresses ({customer.addresses.length})
              </h2>
            </div>

            {customer.addresses.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No saved addresses on file.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {customer.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="rounded-xl border border-border/60 bg-surface/50 p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">
                        {addr.label} — {addr.fullName}
                      </span>
                      {addr.isDefault && (
                        <Badge variant="secondary" className="text-[10px]">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      {addr.streetAddress}
                      {addr.apartment ? `, ${addr.apartment}` : ""}
                    </p>
                    <p className="text-muted-foreground">
                      {addr.city}, {addr.stateProvince} {addr.postalCode},{" "}
                      {addr.country}
                    </p>
                    <p className="mt-1 text-muted-foreground">{addr.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Profile Contact & Account Controls */}
        <div className="space-y-6 lg:col-span-4">
          <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 shadow-card text-xs">
            <h3 className="font-heading text-sm font-bold text-foreground">
              Profile Information
            </h3>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5 text-accent" />
              <span>{customer.email}</span>
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 text-accent" />
              <span>{customer.phone || "No phone provided"}</span>
            </p>
          </div>

          <CustomerActionsClient
            customer={customer}
            isLastActiveAdmin={isLastActiveAdmin}
          />
        </div>
      </div>
    </div>
  );
}
