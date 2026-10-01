import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface ShopStoreState {
  cartItems: CartItem[];
  wishlistIds: string[];
  recentlyViewedSlugs: string[];
  addRecentlyViewed: (slug: string) => void;
  clearRecentlyViewed: () => void;
}

/**
 * Zustand store for TK Laptop client state.
 * Persists `recentlyViewedSlugs` in localStorage; cart and wishlist mutations
 * will be wired in the next step.
 */
export const useShopStore = create<ShopStoreState>()(
  persist(
    (set) => ({
      cartItems: [],
      wishlistIds: [],
      recentlyViewedSlugs: [],
      addRecentlyViewed: (slug: string) =>
        set((state) => {
          const normalized = slug.trim();
          if (!normalized) return state;
          const filtered = state.recentlyViewedSlugs.filter(
            (item) => item !== normalized
          );
          return {
            recentlyViewedSlugs: [normalized, ...filtered].slice(0, 8),
          };
        }),
      clearRecentlyViewed: () => set({ recentlyViewedSlugs: [] }),
    }),
    {
      name: "tk-laptop-store",
      partialize: (state) => ({
        recentlyViewedSlugs: state.recentlyViewedSlugs,
      }),
    }
  )
);
