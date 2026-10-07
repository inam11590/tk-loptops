import { OrdersTableClient } from "@/app/admin/orders/OrdersTableClient";
import { requireAdminPage } from "@/lib/admin/guard";
import { getAllOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

interface AdminOrdersPageProps {
  searchParams: Promise<{
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
  }>;
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  await requireAdminPage();
  const params = await searchParams;
  const orders = getAllOrders();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card">
        <h1 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
          Orders Management ({orders.length})
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Search, filter, update fulfillment status, verify bank transfers, and
          export order data to CSV.
        </p>
      </div>

      <OrdersTableClient
        initialOrders={orders}
        initialStatus={params.status ?? "all"}
        initialPaymentStatus={params.paymentStatus ?? "all"}
        initialPaymentMethod={params.paymentMethod ?? "all"}
      />
    </div>
  );
}
