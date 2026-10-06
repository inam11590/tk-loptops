"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCartStore } from "@/store/cartStore";

export const WISHLIST_STORAGE_KEY = "tk-laptop-wishlist";

interface WishlistStoreState {
  items: string[]; // Array of product IDs
  toggleItem: (productId: string, productName?: string) => boolean;
  removeItem: (productId: string, productName?: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStoreState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleItem: (productId, productName) => {
        const exists = get().items.includes(productId);
        const label = productName || "Item";

        if (exists) {
          set((state) => ({
            items: state.items.filter((id) => id !== productId),
          }));
          useCartStore
            .getState()
            .showToast(`Removed ${label} from your wishlist.`, "info");
          return false;
        } else {
          set((state) => ({
            items: [productId, ...state.items],
          }));
          useCartStore
            .getState()
            .showToast(`Saved ${label} to your wishlist.`, "success");
          return true;
        }
      },

      removeItem: (productId, productName) => {
        const exists = get().items.includes(productId);
        if (!exists) return;
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        }));
        if (productName) {
          useCartStore
            .getState()
            .showToast(`Removed ${productName} from your wishlist.`, "info");
        }
      },

      clearWishlist: () => {
        set({ items: [] });
        useCartStore.getState().showToast("Wishlist cleared.", "info");
      },

      isInWishlist: (productId) => get().items.includes(productId),
    }),
    {
      name: WISHLIST_STORAGE_KEY,
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);
