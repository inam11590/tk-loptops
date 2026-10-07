import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { Container } from "@/components/common/container";
import { ImageGallery } from "@/components/product/ImageGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductTabs } from "@/components/product/ProductTabs";
import { CompareSimilar } from "@/components/product/CompareSimilar";
import { FrequentlyBoughtTogether } from "@/components/product/FrequentlyBoughtTogether";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { StickyCartBar } from "@/components/product/StickyCartBar";
import { SITE_CONFIG } from "@/lib/config";
import { getPublishedProducts } from "@/lib/productStore";
import {
  getProductBySlug,
  getRelatedProducts,
  getSimilarProductsForComparison,
} from "@/lib/products";
import { getApprovedReviewsForProduct } from "@/lib/reviewStore";

export const dynamicParams = true;

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const published = getPublishedProducts();
  const slugs = published.map((product) => ({
    slug: product.slug,
  }));
  // Include the example alias slug so /laptops/hp-pavilion-15 is pre-rendered too
  slugs.push({ slug: "hp-pavilion-15" });
  return slugs;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const products = getPublishedProducts();
  const product = getProductBySlug(slug, products);

  if (!product) {
    return {
      title: "Laptop Not Found",
      description: "The requested laptop configuration could not be found.",
    };
  }

  const title =
    product.seoTitle ||
    `${product.name} (${product.specs.processor}, ${product.specs.ram}, ${product.specs.storage})`;
  const description =
    product.seoDescription ||
    `${product.description} Official ${product.brand} warranty, free insured delivery, and easy returns at ${SITE_CONFIG.name}.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      type: "website",
      url: `${SITE_CONFIG.url}/laptops/${product.slug}`,
      images: [
        {
          url: product.images[0],
          width: 1200,
          height: 900,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      images: [product.images[0]],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const products = getPublishedProducts();
  const product = getProductBySlug(slug, products);

  if (!product) {
    notFound();
  }

  const reviews = getApprovedReviewsForProduct(product);
  const similarForCompare = getSimilarProductsForComparison(
    product,
    products,
    2
  );
  const relatedProducts = getRelatedProducts(product, products, 6);
  const brandSlug = product.brand.toLowerCase();

  // JSON-LD Product schema for rich search snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: `TK-${product.brand.toUpperCase()}-${product.id.toUpperCase()}`,
    image: product.images.map((img) => `${SITE_CONFIG.url}${img}`),
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_CONFIG.url}/laptops/${product.slug}`,
      priceCurrency: SITE_CONFIG.currency.code,
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: SITE_CONFIG.name,
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-16">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs Bar */}
      <div className="border-b border-border/60 bg-secondary/25">
        <Container className="py-3.5">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-muted-foreground"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1 font-medium hover:text-primary transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            <Link
              href="/laptops"
              className="font-medium hover:text-primary transition-colors"
            >
              Laptops
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            <Link
              href={`/laptops/${brandSlug}`}
              className="font-medium hover:text-primary transition-colors"
            >
              {product.brand}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span
              aria-current="page"
              className="truncate max-w-[220px] sm:max-w-[380px] font-semibold text-foreground"
            >
              {product.name}
            </span>
          </nav>
        </Container>
      </div>

      <Container className="pt-8">
        {/* Top Section: Two-column desktop, stacked mobile */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left column: Image Gallery */}
          <div className="lg:col-span-6">
            <div className="lg:sticky lg:top-24">
              <ImageGallery
                images={product.images}
                productName={product.name}
              />
            </div>
          </div>

          {/* Right column: Product Info & Purchase Controls */}
          <div className="lg:col-span-6">
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Below the Fold: Tabbed Content (Overview, Full Specs, Reviews, Shipping & Warranty) */}
        <div className="mt-14">
          <ProductTabs product={product} reviews={reviews} />
        </div>

        {/* Compare With Similar Laptops */}
        <CompareSimilar
          currentProduct={product}
          similarProducts={similarForCompare}
        />

        {/* Frequently Bought Together Bundle Selector */}
        <FrequentlyBoughtTogether product={product} />

        {/* Related Products Carousel */}
        <RelatedProducts products={relatedProducts} />

        {/* Recently Viewed (persisted in localStorage via Zustand) */}
        <RecentlyViewed currentSlug={product.slug} />
      </Container>

      {/* Mobile Sticky Bottom Cart Bar */}
      <StickyCartBar product={product} />
    </div>
  );
}
