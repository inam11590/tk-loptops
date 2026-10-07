import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdminPage } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  await requireAdminPage();

  return <ProductForm mode="create" />;
}
