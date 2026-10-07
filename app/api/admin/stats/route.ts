import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/guard";
import {
  computeAdminDashboardStats,
  type AdminDateRangePreset,
} from "@/lib/admin/stats";
import { getSettings } from "@/lib/config";
import { getAllOrders } from "@/lib/orders";
import { getAllProducts } from "@/lib/productStore";
import { getAllReviews } from "@/lib/reviewStore";
import { getAllSafeUsers } from "@/lib/users";

export async function GET(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.authorized) {
    return guard.response;
  }

  const { searchParams } = new URL(request.url);
  const presetParam = (searchParams.get("range") ??
    "30d") as AdminDateRangePreset;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  const settings = getSettings();
  const stats = computeAdminDashboardStats({
    orders: getAllOrders(),
    users: getAllSafeUsers(),
    products: getAllProducts({ includeDrafts: true }),
    reviews: getAllReviews(),
    lowStockThreshold: settings.shipping.lowStockThreshold,
    filter: {
      preset: presetParam,
      from,
      to,
    },
  });

  return NextResponse.json({ stats });
}
