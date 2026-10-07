import Link from "next/link";
import { Plus } from "lucide-react";
import { ProductsTableClient } from "@/app/admin/products/ProductsTableClient";
import { Button } from "@/components/ui/button";
import { requireAdminPage } from "@/lib/admin/guard";
import { getAllProducts } from "@/lib/productStore";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdminPage();
  const products = getAllProducts({ includeDrafts: true });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
            Products Catalog ({products.length})
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Manage HP and Dell laptops, pricing, inventory stock, and publishing
            status.
          </p>
        </div>

        <Button
          asChild
          variant="accent"
          size="sm"
          className="h-9 gap-1.5 rounded-xl px-4 text-xs font-bold shadow-sm"
        >
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </Link>
        </Button>
      </div>

      <ProductsTableClient initialProducts={products} />
    </div>
  );
}
