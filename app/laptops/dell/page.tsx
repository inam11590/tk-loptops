import { Suspense } from "react";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import { getPublishedProducts } from "@/lib/productStore";
import { ProductListing } from "@/components/product/product-listing";
import { ProductListingSkeleton } from "@/components/product/product-listing-skeleton";

export async function generateMetadata(): Promise<Metadata> {
  const products = getPublishedProducts();
  const dellCount = products.filter((p) => p.brand === "Dell").length;
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
  const products = getPublishedProducts();
  return (
    <Suspense fallback={<ProductListingSkeleton />}>
      <ProductListing
        title="Dell Laptops"
        description="Discover Dell engineering excellence across machined-aluminum XPS ultrabooks, vPro Latitude & Precision workstations, and Cryo-Tech Alienware gaming laptops."
        breadcrumbs={[
          { label: "Laptops", href: "/laptops" },
          { label: "Dell" },
        ]}
        products={products}
        preset={{ fixedBrand: "Dell" }}
      />
    </Suspense>
  );
}
