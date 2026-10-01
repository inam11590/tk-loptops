import { Suspense } from "react";
import type { Metadata } from "next";
import { PRODUCTS } from "@/data/products";
import { SITE_CONFIG } from "@/lib/config";
import { ProductListing } from "@/components/product/product-listing";
import { ProductListingSkeleton } from "@/components/product/product-listing-skeleton";

interface LaptopsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams,
}: LaptopsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const rawCategory =
    typeof params.category === "string" ? params.category : undefined;
  const categoryTitle = rawCategory
    ? `${rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1)} `
    : "";

  const title = `Buy ${categoryTitle}HP & Dell Laptops`;
  const description = `Browse all ${PRODUCTS.length} certified HP and Dell ${categoryTitle.toLowerCase()}laptops with transparent pricing, 1-year official warranty, and fast express delivery at ${SITE_CONFIG.name}.`;

  return {
    title,
    description,
    alternates: { canonical: "/laptops" },
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      url: `${SITE_CONFIG.url}/laptops`,
    },
  };
}

export default function AllLaptopsPage() {
  return (
    <Suspense fallback={<ProductListingSkeleton />}>
      <ProductListing
        title="All HP & Dell Laptops"
        description="Explore our complete catalog of 24 factory-sealed HP and Dell laptops—filterable by category, processor, RAM, SSD capacity, display size, and graphics."
        breadcrumbs={[{ label: "Laptops" }]}
        products={PRODUCTS}
      />
    </Suspense>
  );
}
