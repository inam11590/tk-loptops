import { Product, ProductReview } from "@/types";

interface ReviewTemplate {
  author: string;
  avatar: string;
  date: string;
  isoDate: string;
  verifiedPurchase: boolean;
  rating: number;
  titleTemplate: (product: Product) => string;
  textTemplate: (product: Product) => string;
}

const REVIEW_TEMPLATES: ReviewTemplate[] = [
  {
    author: "Marcus Vance",
    avatar: "/images/avatars/avatar-1.svg",
    date: "September 24, 2026",
    isoDate: "2026-09-24",
    verifiedPurchase: true,
    rating: 5,
    titleTemplate: (p) => `Flawless ${p.brand} build quality & genuine serial tag`,
    textTemplate: (p) =>
      `My ${p.name} arrived double-boxed and factory-sealed within 24 hours. The ${p.specs.processor} paired with ${p.specs.ram} handles Docker containers, multiple browser profiles, and 4K external monitors without breaking a sweat.`,
  },
  {
    author: "Dr. Elena Rostova",
    avatar: "/images/avatars/avatar-2.svg",
    date: "September 18, 2026",
    isoDate: "2026-09-18",
    verifiedPurchase: true,
    rating: 5,
    titleTemplate: (p) => `Incredible display clarity on the ${p.specs.display}`,
    textTemplate: (p) =>
      `I spend 10+ hours a day reading research papers and running Python analyses. The ${p.specs.display} panel on this ${p.name} is razor-sharp, easy on the eyes, and the keyboard travel is the best in its class.`,
  },
  {
    author: "Devon Brooks",
    avatar: "/images/avatars/avatar-3.svg",
    date: "September 11, 2026",
    isoDate: "2026-09-11",
    verifiedPurchase: true,
    rating: 5,
    titleTemplate: (p) => `Blazing fast ${p.specs.storage} SSD & silent thermals`,
    textTemplate: (p) =>
      `Boot time is under 6 seconds and project loads are instantaneous. Even under sustained multi-core workloads on the ${p.specs.processor}, fan acoustics stay controlled and the palm rest remains cool.`,
  },
  {
    author: "Priya Nair",
    avatar: "/images/avatars/avatar-4.svg",
    date: "August 29, 2026",
    isoDate: "2026-08-29",
    verifiedPurchase: true,
    rating: 5,
    titleTemplate: (p) => `Best value and peace of mind with 1-Year Warranty`,
    textTemplate: (p) =>
      `TK Laptop beat every major retailer on price for this ${p.brand} configuration. I verified the warranty status directly on the official ${p.brand} support portal right after unboxing—100% authentic.`,
  },
  {
    author: "Liam O'Connor",
    avatar: "/images/avatars/avatar-1.svg",
    date: "August 19, 2026",
    isoDate: "2026-08-19",
    verifiedPurchase: true,
    rating: 4,
    titleTemplate: (p) => `Solid daily driver with great battery endurance`,
    textTemplate: (p) =>
      `Been using the ${p.name} for three weeks now. Battery life easily gets me through a full workday of meetings and coding (${p.specs.battery}). Would love one extra USB-A port, but USB-C hub solves that easily.`,
  },
  {
    author: "Hannah Chen",
    avatar: "/images/avatars/avatar-2.svg",
    date: "August 08, 2026",
    isoDate: "2026-08-08",
    verifiedPurchase: true,
    rating: 5,
    titleTemplate: (p) => `Graphics and multitasking exceeded expectations`,
    textTemplate: (p) =>
      `With ${p.specs.gpu} and ${p.specs.ram}, switching between Figma, Premiere Pro, and twenty Chrome tabs is completely stutter-free. At ${p.specs.weight}, it's also surprisingly easy to carry in my backpack.`,
  },
  {
    author: "Omar Al-Mansoor",
    avatar: "/images/avatars/avatar-3.svg",
    date: "July 27, 2026",
    isoDate: "2026-07-27",
    verifiedPurchase: true,
    rating: 4,
    titleTemplate: (p) => `Clean Windows 11 setup & fast courier delivery`,
    textTemplate: (p) =>
      `Pre-installed ${p.specs.os} was clean and ready for work out of the box. Customer support answered my RAM upgrade question within 10 minutes before I placed the order.`,
  },
  {
    author: "Sophia Martinez",
    avatar: "/images/avatars/avatar-4.svg",
    date: "July 14, 2026",
    isoDate: "2026-07-14",
    verifiedPurchase: false,
    rating: 3,
    titleTemplate: () => `Great hardware, courier arrived in the afternoon`,
    textTemplate: (p) =>
      `The ${p.name} itself is a 5-star machine—super fast ${p.specs.processor} and crisp screen. Knocking one star only because the local courier delivered at 5 PM instead of the morning window, though packaging was pristine.`,
  },
];

/**
 * Generates 8 realistic, model-specific reviews for any product in the catalog.
 */
export function getReviewsForProduct(product: Product): ProductReview[] {
  return REVIEW_TEMPLATES.map((tpl, index) => ({
    id: `${product.id}-review-${index + 1}`,
    productSlug: product.slug,
    author: tpl.author,
    avatar: tpl.avatar,
    date: tpl.date,
    isoDate: tpl.isoDate,
    verifiedPurchase: tpl.verifiedPurchase,
    rating: tpl.rating,
    title: tpl.titleTemplate(product),
    text: tpl.textTemplate(product),
  }));
}
