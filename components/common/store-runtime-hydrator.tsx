"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { setRuntimeSettings, type StoreSettings } from "@/lib/config";
import { setRuntimeCoupons, type CouponRecord } from "@/lib/couponStore";
import { setRuntimeProducts } from "@/lib/productStore";
import type { Product } from "@/types/product";

interface StoreRuntimeHydratorProps {
  settings: StoreSettings;
  products: Product[];
  coupons: CouponRecord[];
  announcementBar: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  miniCart: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Synchronizes server-backed JSON stores (`settings`, `products`, `coupons`) into
 * the client runtime cache so `formatPrice()`, `getSettings()`, `useCartStore()`,
 * `SearchBar`, and `CheckoutFlow` reflect live admin changes immediately.
 * Also hides storefront header/footer when rendering `/admin/*` routes.
 */
export function StoreRuntimeHydrator({
  settings,
  products,
  coupons,
  announcementBar,
  header,
  footer,
  miniCart,
  children,
}: StoreRuntimeHydratorProps) {
  const pathname = usePathname();

  // Synchronously populate runtime caches before child components render
  setRuntimeSettings(settings);
  setRuntimeProducts(products);
  setRuntimeCoupons(coupons);

  useEffect(() => {
    setRuntimeSettings(settings);
    setRuntimeProducts(products);
    setRuntimeCoupons(coupons);
  }, [settings, products, coupons]);

  const isAdminRoute =
    pathname === "/admin" || Boolean(pathname?.startsWith("/admin/"));

  if (isAdminRoute) {
    return (
      <div id="main-content" className="flex min-h-screen flex-1 flex-col">
        {children}
      </div>
    );
  }

  return (
    <>
      {announcementBar}
      {header}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {footer}
      {miniCart}
    </>
  );
}
