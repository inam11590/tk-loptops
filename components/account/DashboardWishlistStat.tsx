"use client";

import { useHydrated } from "@/hooks/use-hydrated";
import { useWishlistStore } from "@/store/wishlistStore";

export function DashboardWishlistStat({
  serverCount,
}: {
  serverCount: number;
}) {
  const hydrated = useHydrated();
  const items = useWishlistStore((state) => state.items);
  return <>{hydrated ? items.length : serverCount}</>;
}
