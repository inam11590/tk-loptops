import { CustomersTableClient, type CustomerRow } from "@/app/admin/customers/CustomersTableClient";
import { requireAdminPage } from "@/lib/admin/guard";
import { getAllOrders } from "@/lib/orders";
import { getAllSafeUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await requireAdminPage();
  const users = getAllSafeUsers();
  const orders = getAllOrders();

  const rows: CustomerRow[] = users.map((u) => {
    const userOrders = orders.filter(
      (o) =>
        o.userId === u.id ||
        o.customer.email.toLowerCase() === u.email.toLowerCase()
    );
    const nonCancelled = userOrders.filter((o) => o.status !== "Cancelled");
    const totalSpent = nonCancelled.reduce(
      (sum, o) => sum + o.totals.grandTotal,
      0
    );

    return {
      ...u,
      totalOrders: userOrders.length,
      totalSpent,
    };
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card">
        <h1 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
          Customers &amp; Accounts ({rows.length})
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          View customer order history, lifetime value, account status, and role
          permissions.
        </p>
      </div>

      <CustomersTableClient customers={rows} />
    </div>
  );
}
