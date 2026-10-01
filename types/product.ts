export type LaptopBrand = "HP" | "Dell";

export type LaptopCategory =
  | "budget"
  | "business"
  | "gaming"
  | "student"
  | "ultrabook";

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
  specs: ProductSpecs;
  tags: string[];
  description: string;
  highlights?: string[];
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

export interface ProductReview {
  id: string;
  productSlug: string;
  author: string;
  avatar: string;
  date: string;
  isoDate: string;
  verifiedPurchase: boolean;
  rating: number;
  title: string;
  text: string;
}
