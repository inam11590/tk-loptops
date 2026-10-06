"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCartStore } from "@/store/cartStore";

export const WISHLIST_STORAGE_KEY = "tk-laptop-wishlist";

function pushWishlistToServer(items: string[], mode: "merge" | "replace") {
  if (typeof window === "undefined") return;
  fetch("/api/account/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, mode }),
  }).catch(() => {
    // Unauthenticated or offline — localStorage remains authoritative
  });
}

interface WishlistStoreState {
  items: string[]; // Array of product IDs
  setItems: (items: string[]) => void;
  syncWithServerWishlist: (serverItems: string[]) => Promise<string[]>;
  toggleItem: (productId: string, productName?: string) => boolean;
  removeItem: (productId: string, productName?: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStoreState>()(
  persist(
    (set, get) => ({
      items: [],

      setItems: (items) => {
        const unique = Array.from(new Set(items));
        set({ items: unique });
      },

      syncWithServerWishlist: async (serverItems) => {
        const currentLocal = get().items;
        const combined = Array.from(
          new Set([...currentLocal, ...serverItems])
        ).filter(Boolean);
        set({ items: combined });

        try {
          const res = await fetch("/api/account/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: combined, mode: "merge" }),
          });
          if (res.ok) {
            const data = (await res.json()) as { items?: string[] };
            if (Array.isArray(data.items)) {
              set({ items: data.items });
              return data.items;
            }
          }
        } catch {
          // Ignore network errors
        }
        return combined;
      },

      toggleItem: (productId, productName) => {
        const exists = get().items.includes(productId);
        const label = productName || "Item";

        if (exists) {
          const next = get().items.filter((id) => id !== productId);
          set({ items: next });
          pushWishlistToServer(next, "replace");
          useCartStore
            .getState()
            .showToast(`Removed ${label} from your wishlist.`, "info");
          return false;
        } else {
          const next = [productId, ...get().items];
          set({ items: next });
          pushWishlistToServer(next, "replace");
          useCartStore
            .getState()
            .showToast(`Saved ${label} to your wishlist.`, "success");
          return true;
        }
      },

      removeItem: (productId, productName) => {
        const exists = get().items.includes(productId);
        if (!exists) return;
        const next = get().items.filter((id) => id !== productId);
        set({ items: next });
        pushWishlistToServer(next, "replace");
        if (productName) {
          useCartStore
            .getState()
            .showToast(`Removed ${productName} from your wishlist.`, "info");
        }
      },

      clearWishlist: () => {
        set({ items: [] });
        pushWishlistToServer([], "replace");
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
