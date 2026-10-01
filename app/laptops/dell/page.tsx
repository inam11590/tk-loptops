import { Suspense } from "react";
import type { Metadata } from "next";
import { PRODUCTS } from "@/data/products";
import { SITE_CONFIG } from "@/lib/config";
import { ProductListing } from "@/components/product/product-listing";
import { ProductListingSkeleton } from "@/components/product/product-listing-skeleton";

export async function generateMetadata(): Promise<Metadata> {
  const dellCount = PRODUCTS.filter((p) => p.brand === "Dell").length;
  const title = "Buy Dell Laptops — XPS, Latitude, Precision & Alienware";
  const description = `Shop ${dellCount} genuine Dell laptops featuring InfinityEdge XPS ultrabooks, ultralight Latitude enterprise fleets, and Alienware gaming rigs at ${SITE_CONFIG.name}.`;

  return {
    title,
    description,
    alternates: { canonical: "/laptops/dell" },
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      url: `${SITE_CONFIG.url}/laptops/dell`,
    },
  };
}

export default function DellLaptopsPage() {
  return (
    <Suspense fallback={<ProductListingSkeleton />}>
      <ProductListing
        title="Dell Laptops"
        description="Discover Dell engineering excellence across machined-aluminum XPS ultrabooks, vPro Latitude & Precision workstations, and Cryo-Tech Alienware gaming laptops."
        breadcrumbs={[
          { label: "Laptops", href: "/laptops" },
          { label: "Dell" },
        ]}
        products={PRODUCTS}
        preset={{ fixedBrand: "Dell" }}
      />
    </Suspense>
  );
}
