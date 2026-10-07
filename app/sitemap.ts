import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/config";
import { getPublishedProducts } from "@/lib/productStore";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/laptops`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/laptops/hp`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/laptops/dell`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/deals`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = getPublishedProducts().map(
    (product) => ({
      url: `${baseUrl}/laptops/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  return [...staticRoutes, ...productRoutes];
}
