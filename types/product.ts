export type LaptopBrand = "HP" | "Dell";

export type LaptopCategory =
  | "budget"
  | "business"
  | "gaming"
  | "student"
  | "ultrabook";

export type ProductPublishStatus = "published" | "draft";

export interface ProductSpecs {
  processor: string;
  ram: string;
  storage: string;
  display: string;
  gpu: string;
  battery: string;
  os: string;
  weight: string;
  // Extended specification fields for the 8-section SpecsTable
  ports?: string;
  wireless?: string;
  webcam?: string;
  audio?: string;
  keyboard?: string;
  dimensions?: string;
  chassisMaterial?: string;
  chargerWattage?: string;
  security?: string;
  warranty?: string;
}

export interface Product {
  id: string;
  sku?: string;
  slug: string;
  name: string;
  brand: LaptopBrand;
  category: LaptopCategory;
  price: number;
  oldPrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  lowStockThreshold?: number;
  status?: ProductPublishStatus;
  shortDescription?: string;
  specs: ProductSpecs;
  tags: string[];
  description: string;
  highlights?: string[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Accessory {
  id: string;
  name: string;
  category: "bag" | "mouse" | "cooling";
  price: number;
  oldPrice?: number;
  image: string;
  shortSpec: string;
}

export type ReviewModerationStatus = "Pending" | "Approved" | "Rejected";

export interface ProductReview {
  id: string;
  productId?: string;
  productSlug: string;
  productName?: string;
  author: string;
  email?: string;
  avatar: string;
  date: string;
  isoDate: string;
  verifiedPurchase: boolean;
  rating: number;
  title: string;
  text: string;
  status?: ReviewModerationStatus;
  createdAt?: string;
}
