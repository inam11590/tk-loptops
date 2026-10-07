import { Suspense } from "react";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import { getPublishedProducts } from "@/lib/productStore";
import { ProductListing } from "@/components/product/product-listing";
import { ProductListingSkeleton } from "@/components/product/product-listing-skeleton";

export async function generateMetadata(): Promise<Metadata> {
  const products = getPublishedProducts();
  const dealsCount = products.filter(
    (p) => p.oldPrice && p.oldPrice > p.price
  ).length;
  const title = "Laptop Deals & Flash Discounts — Save on HP & Dell";
  const description = `Save up to 19% on ${dealsCount} discounted HP and Dell laptops. Every deal includes our 1-Year Official Warranty and fast insured delivery at ${SITE_CONFIG.name}.`;

  return {
    title,
    description,
    alternates: { canonical: "/deals" },
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      url: `${SITE_CONFIG.url}/deals`,
    },
  };
}

export default function DealsPage() {
  const products = getPublishedProducts();
  return (
    <Suspense fallback={<ProductListingSkeleton />}>
      <ProductListing
        title="Hot Laptop Deals & Price Drops"
        description="Limited-time instant savings on factory-sealed HP and Dell laptops—sorted by biggest discount first and backed by our 1-Year Official Warranty."
        breadcrumbs={[{ label: "Deals" }]}
        products={products}
        preset={{ dealsOnly: true }}
      />
    </Suspense>
  );
}
