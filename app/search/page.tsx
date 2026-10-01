import { Suspense } from "react";
import type { Metadata } from "next";
import { PRODUCTS } from "@/data/products";
import { SITE_CONFIG } from "@/lib/config";
import { ProductListing } from "@/components/product/product-listing";
import { ProductListingSkeleton } from "@/components/product/product-listing-skeleton";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";

  const title = query
    ? `Search Results for "${query}" — HP & Dell Laptops`
    : "Search HP & Dell Laptops";
  const description = query
    ? `Explore matching HP and Dell laptops for "${query}" with verified specs, warranty protection, and transparent pricing at ${SITE_CONFIG.name}.`
    : `Search all certified HP and Dell laptops by model name, brand, processor, RAM, or category at ${SITE_CONFIG.name}.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      url: `${SITE_CONFIG.url}/search`,
    },
  };
}

export default function SearchPage() {
  return (
    <Suspense fallback={<ProductListingSkeleton />}>
      <ProductListing
        title="Search Laptops"
        description="Search across product names, brands (HP, Dell), processors (Intel Core i3/i5/i7/i9, Core Ultra, AMD Ryzen), and hardware tags."
        breadcrumbs={[{ label: "Search" }]}
        products={PRODUCTS}
        showSearchInput
      />
    </Suspense>
  );
}
