import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdminPage } from "@/lib/admin/guard";
import { getProductById } from "@/lib/productStore";

export const dynamic = "force-dynamic";

interface AdminEditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProductPage({
  params,
}: AdminEditProductPageProps) {
  await requireAdminPage();
  const { id } = await params;

  const product = getProductById(id, { includeDrafts: true });
  if (!product) {
    notFound();
  }

  return <ProductForm mode="edit" initialProduct={product} />;
}
