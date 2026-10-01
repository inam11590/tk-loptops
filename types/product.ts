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
}

export interface Product {
  id: string;
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
}
