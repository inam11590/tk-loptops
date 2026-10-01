import { create } from "zustand";
import { Product } from "@/types";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface ShopStoreState {
  cartItems: CartItem[];
  wishlistIds: string[];
}

/**
 * Zustand store foundation for TK Laptop client state (cart & wishlist).
 * Cart and wishlist mutation actions will be wired in the next phase.
 */
export const useShopStore = create<ShopStoreState>(() => ({
  cartItems: [],
  wishlistIds: [],
}));
