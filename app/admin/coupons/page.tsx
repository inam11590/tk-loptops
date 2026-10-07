import { CouponsTableClient } from "@/app/admin/coupons/CouponsTableClient";
import { requireAdminPage } from "@/lib/admin/guard";
import { getAllCoupons } from "@/lib/couponStore";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  await requireAdminPage();
  const coupons = getAllCoupons();

  return <CouponsTableClient initialCoupons={coupons} />;
}
