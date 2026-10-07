import { Suspense } from "react";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import { getPublishedProducts } from "@/lib/productStore";
import { ProductListing } from "@/components/product/product-listing";
import { ProductListingSkeleton } from "@/components/product/product-listing-skeleton";

export async function generateMetadata(): Promise<Metadata> {
  const products = getPublishedProducts();
  const hpCount = products.filter((p) => p.brand === "HP").length;
  const title = "Buy HP Laptops — Spectre, EliteBook, OMEN & Pavilion";
  const description = `Shop ${hpCount} genuine HP laptops including Spectre x360 OLED convertibles, Wolf-secured EliteBook workstations, and OMEN RTX gaming rigs at ${SITE_CONFIG.name}.`;

  return {
    title,
    description,
    alternates: { canonical: "/laptops/hp" },
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      url: `${SITE_CONFIG.url}/laptops/hp`,
    },
  };
}

export default function HpLaptopsPage() {
  const products = getPublishedProducts();
  return (
    <Suspense fallback={<ProductListingSkeleton />}>
      <ProductListing
        title="HP Laptops"
        description="Precision-crafted HP notebooks—from executive Spectre x360 2-in-1 OLEDs and commercial EliteBooks to high-refresh OMEN and Victus gaming machines."
        breadcrumbs={[
          { label: "Laptops", href: "/laptops" },
          { label: "HP" },
        ]}
        products={products}
        preset={{ fixedBrand: "HP" }}
      />
    </Suspense>
  );
}
