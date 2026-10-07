import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/admin/guard";
import { computeAdminDashboardStats } from "@/lib/admin/stats";
import { getSettings } from "@/lib/config";
import { getAllOrders } from "@/lib/orders";
import { getAllProducts } from "@/lib/productStore";
import { getAllReviews } from "@/lib/reviewStore";
import { getAllSafeUsers } from "@/lib/users";

export const metadata: Metadata = {
  title: {
    default: "Admin Panel | TK Laptop",
    template: "%s | TK Laptop Admin",
  },
  description: "TK Laptop Store Administration & Inventory Control",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminPage();
  const settings = getSettings();

  const stats = computeAdminDashboardStats({
    orders: getAllOrders(),
    users: getAllSafeUsers(),
    products: getAllProducts({ includeDrafts: true }),
    reviews: getAllReviews(),
    lowStockThreshold: settings.shipping.lowStockThreshold,
  });

  return (
    <AdminShell
      adminUser={{
        name: admin.fullName,
        email: admin.email,
        image: admin.avatarUrl,
      }}
      pendingActions={stats.pendingActions}
    >
      {children}
    </AdminShell>
  );
}
