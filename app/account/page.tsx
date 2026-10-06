import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Heart,
  Laptop,
  MapPin,
  Package,
  Shield,
  User,
} from "lucide-react";

import { auth } from "@/auth";
import { DashboardWishlistStat } from "@/components/account/DashboardWishlistStat";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/config";
import { getOrdersByUser, type OrderStatus } from "@/lib/orders";
import { getSafeUserById, MAX_SAVED_ADDRESSES } from "@/lib/users";
import { cn } from "@/lib/utils";

function getOrderStatusBadgeClasses(status: OrderStatus): string {
  switch (status) {
    case "Delivered":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "Shipped":
      return "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300";
    case "Confirmed":
      return "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300";
    case "Cancelled":
      return "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300";
    default:
      return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Account Dashboard",
    description:
      "Overview of your TK Laptop orders, saved addresses, and synced wishlist.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AccountDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account");
  }

  const user = getSafeUserById(session.user.id);
  if (!user) {
    redirect("/login?callbackUrl=/account");
  }

  const orders = getOrdersByUser(user.id, user.email);
  const latestOrders = orders.slice(0, 3);
  const firstName = user.fullName.split(" ")[0] || user.fullName;
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-hero-gradient p-6 text-white shadow-card sm:p-8">
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-accent/25 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <span className="inline-block rounded-full border border-white/15 bg-white/10 px-3 py-0.5 text-[11px] font-semibold text-blue-200">
              Member since {memberSince}
            </span>
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {firstName}!
            </h1>
            <p className="text-xs text-slate-300 sm:text-sm">
              Track your HP &amp; Dell laptop shipments, manage delivery
              addresses, and review your warranty invoices.
            </p>
          </div>

          <Button
            asChild
            variant="accent"
            size="sm"
            className="h-10 shrink-0 rounded-xl px-4 text-xs font-bold shadow-glow"
          >
            <Link href="/laptops">
              <Laptop className="mr-1.5 h-4 w-4" aria-hidden="true" />
              <span>Explore Laptops</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/account/orders"
          className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-card transition-all hover:border-accent/50"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Orders
            </p>
            <p className="mt-1 font-heading text-3xl font-extrabold text-foreground">
              {orders.length}
            </p>
            <p className="mt-1 text-xs font-medium text-accent group-hover:underline">
              View order history →
            </p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <Package className="h-6 w-6" aria-hidden="true" />
          </span>
        </Link>

        <Link
          href="/account/wishlist"
          className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-card transition-all hover:border-accent/50"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Wishlist Items
            </p>
            <p className="mt-1 font-heading text-3xl font-extrabold text-foreground">
              <DashboardWishlistStat
                serverCount={user.wishlistProductIds.length}
              />
            </p>
            <p className="mt-1 text-xs font-medium text-accent group-hover:underline">
              Manage saved laptops →
            </p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <Heart className="h-6 w-6" aria-hidden="true" />
          </span>
        </Link>

        <Link
          href="/account/addresses"
          className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-card transition-all hover:border-accent/50"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Saved Addresses
            </p>
            <p className="mt-1 font-heading text-3xl font-extrabold text-foreground">
              {user.addresses.length}
              <span className="text-sm font-normal text-muted-foreground">
                /{MAX_SAVED_ADDRESSES}
              </span>
            </p>
            <p className="mt-1 text-xs font-medium text-accent group-hover:underline">
              Edit address book →
            </p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <MapPin className="h-6 w-6" aria-hidden="true" />
          </span>
        </Link>
      </div>

      {/* Latest 3 Orders */}
      <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-card">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">
              Recent Orders
            </h2>
            <p className="text-xs text-muted-foreground">
              Your latest 3 laptop purchases and shipment updates
            </p>
          </div>

          {orders.length > 0 && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 rounded-xl px-3.5 text-xs font-semibold"
            >
              <Link href="/account/orders">
                <span>View All ({orders.length})</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          )}
        </div>

        {latestOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/50 p-8 text-center">
            <p className="text-sm font-semibold text-foreground">
              You haven&apos;t placed any orders yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Browse our HP and Dell lineup to find your next workstation or
              gaming rig.
            </p>
            <Button
              asChild
              variant="accent"
              size="sm"
              className="mt-4 h-9 rounded-xl px-4 text-xs font-bold"
            >
              <Link href="/laptops">Shop All Laptops</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/70">
            {latestOrders.map((order) => {
              const formattedDate = new Date(
                order.createdAt
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={order.id}
                  className="flex flex-col justify-between gap-4 py-4 first:pt-1 last:pb-1 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3.5">
                    {order.items[0] && (
                      <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-surface p-1">
                        <Image
                          src={order.items[0].image}
                          alt={order.items[0].name}
                          width={64}
                          height={56}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="font-mono text-sm font-bold text-foreground hover:text-accent hover:underline"
                        >
                          {order.id}
                        </Link>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                            getOrderStatusBadgeClasses(order.status)
                          )}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {order.items[0]?.name}
                        {order.items.length > 1
                          ? ` + ${order.items.length - 1} more`
                          : ""}
                      </p>
                      <p className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar className="h-3 w-3" aria-hidden="true" />
                        <span>{formattedDate}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Total
                      </span>
                      <span className="font-heading text-sm font-bold text-foreground">
                        {formatPrice(order.totals.grandTotal)}
                      </span>
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-xl px-3.5 text-xs font-semibold"
                    >
                      <Link href={`/account/orders/${order.id}`}>Details</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/account/profile"
          className="flex items-start gap-3.5 rounded-2xl border border-border/80 bg-card p-5 shadow-card transition-colors hover:border-accent/50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-accent">
            <User className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground">
              Profile &amp; Avatar
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Update your name, phone number, and profile photo.
            </p>
          </div>
        </Link>

        <Link
          href="/account/addresses"
          className="flex items-start gap-3.5 rounded-2xl border border-border/80 bg-card p-5 shadow-card transition-colors hover:border-accent/50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-accent">
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground">
              Shipping Addresses
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Add or set your default address for one-click checkout.
            </p>
          </div>
        </Link>

        <Link
          href="/account/security"
          className="flex items-start gap-3.5 rounded-2xl border border-border/80 bg-card p-5 shadow-card transition-colors hover:border-accent/50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-accent">
            <Shield className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground">
              Password &amp; Security
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Change your password or manage account privacy.
            </p>
          </div>
        </Link>
      </section>
    </div>
  );
}
