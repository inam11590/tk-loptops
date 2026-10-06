import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OrdersTable } from "@/components/account/OrdersTable";
import { getOrdersByUser } from "@/lib/orders";
import { getSafeUserById } from "@/lib/users";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "My Orders",
    description: "View your TK Laptop order history, statuses, and invoices.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AccountOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/orders");
  }

  const user = getSafeUserById(session.user.id);
  if (!user) {
    redirect("/login?callbackUrl=/account/orders");
  }

  const orders = getOrdersByUser(user.id, user.email);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Order History
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Filter by shipment status, search by Order ID, view invoices, or
          reorder with one click.
        </p>
      </div>

      <OrdersTable orders={orders} />
    </div>
  );
}
