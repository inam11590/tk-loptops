import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { BrandCards } from "@/components/home/BrandCards";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedLaptops } from "@/components/home/FeaturedLaptops";
import { DealOfTheDay } from "@/components/home/DealOfTheDay";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Testimonials } from "@/components/home/Testimonials";
import { NewsletterCta } from "@/components/home/NewsletterCta";
import { FaqPreview } from "@/components/home/FaqPreview";

export const metadata: Metadata = {
  title: "Power Your Work. Elevate Your Play. | Official HP & Dell Store",
  description:
    "Shop 100% genuine HP and Dell laptops across Budget, Business, Gaming, Student, and Ultrabook categories. Backed by a 1-Year Official Warranty and fast nationwide delivery.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TK Laptop — Power Your Work. Elevate Your Play.",
    description:
      "Authorized HP & Dell laptop specialist offering Spectre, EliteBook, OMEN, XPS, Latitude, and Alienware configurations with a 1-Year Official Warranty.",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    type: "website",
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} — Official HP & Dell Laptop Store`,
      },
    ],
  },
};

/**
 * Conversion-focused Home Page for TK Laptop.
 * Sections rendered in strict sequence:
 * 1. Hero banner
 * 2. Trust bar
 * 3. Shop by brand (HP & Dell)
 * 4. Shop by category (Budget, Business, Gaming, Student, Ultrabook)
 * 5. Featured laptops (Best Sellers, New Arrivals, Top Rated tabs)
 * 6. Deal of the Day (with live countdown timer)
 * 7. Why choose TK Laptop
 * 8. Customer testimonials
 * 9. Newsletter CTA
 * 10. FAQ preview (Accordion)
 */
export default function HomePage() {
  return (
    <div>
      <Hero />
      <TrustBar />
      <BrandCards />
      <CategoryGrid />
      <FeaturedLaptops />
      <DealOfTheDay />
      <WhyChooseUs />
      <Testimonials />
      <NewsletterCta />
      <FaqPreview />
    </div>
  );
}
