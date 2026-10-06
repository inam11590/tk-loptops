"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  calculateCartTotals,
  resolveCatalogItem,
  validateCoupon,
  type CartItemData,
  type CartTotals,
  type CouponValidationResult,
} from "@/lib/cart";

export const CART_STORAGE_KEY = "tk-laptop-cart";

export interface CartToast {
  id: number;
  message: string;
  type: "success" | "warning" | "error" | "info";
}

export interface AddCartItemInput {
  productId: string;
  slug: string;
  name: string;
  brand: "HP" | "Dell" | "TK Accessory";
  image: string;
  price: number;
  oldPrice?: number;
  stock: number;
  specsSummary?: string;
  itemType?: "laptop" | "accessory";
}

interface AddItemOptions {
  openMiniCart?: boolean;
  silent?: boolean;
}

interface CartStoreState {
  items: CartItemData[];
  couponCode: string | null;
  isMiniCartOpen: boolean;
  toast: CartToast | null;
  lastAnnouncement: string;

  // Drawer & Toast UI helpers
  setMiniCartOpen: (open: boolean) => void;
  showToast: (
    message: string,
    type?: "success" | "warning" | "error" | "info"
  ) => void;
  dismissToast: () => void;

  // Cart item actions
  addItem: (
    product: AddCartItemInput,
    quantity?: number,
    options?: AddItemOptions
  ) => { added: boolean; capped: boolean; finalQuantity: number };
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  clearCart: () => void;

  // Coupon actions
  applyCoupon: (code: string) => CouponValidationResult;
  removeCoupon: () => void;

  // Selectors
  getTotals: () => CartTotals;
  totalItems: () => number;
  subtotal: () => number;
  savings: () => number;
  shipping: () => number;
  tax: () => number;
  grandTotal: () => number;
  getItemQuantity: (productId: string) => number;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      isMiniCartOpen: false,
      toast: null,
      lastAnnouncement: "",

      setMiniCartOpen: (open) => set({ isMiniCartOpen: open }),

      showToast: (message, type = "success") => {
        if (toastTimer) {
          clearTimeout(toastTimer);
        }
        const id = Date.now();
        set({
          toast: { id, message, type },
          lastAnnouncement: message,
        });
        if (typeof window !== "undefined") {
          toastTimer = setTimeout(() => {
            if (get().toast?.id === id) {
              set({ toast: null });
            }
          }, 3800);
        }
      },

      dismissToast: () => set({ toast: null }),

      addItem: (input, quantity = 1, options = {}) => {
        const { openMiniCart = true, silent = false } = options;
        const live = resolveCatalogItem(input.productId);
        const currentStock = live ? live.stock : input.stock;
        const currentPrice = live ? live.price : input.price;
        const currentOldPrice = live ? live.oldPrice : input.oldPrice;

        if (currentStock <= 0) {
          if (!silent) {
            get().showToast(
              `${input.name} is currently out of stock.`,
              "error"
            );
          }
          return { added: false, capped: false, finalQuantity: 0 };
        }

        const requestedToAdd = Math.max(1, Math.floor(quantity));
        const existing = get().items.find(
          (i) => i.productId === input.productId
        );

        if (existing) {
          const desiredTotal = existing.quantity + requestedToAdd;
          const capped = desiredTotal > currentStock;
          const nextQty = Math.min(desiredTotal, currentStock);

          set((state) => ({
            items: state.items.map((item) =>
              item.productId === input.productId
                ? {
                    ...item,
                    price: currentPrice,
                    oldPrice: currentOldPrice,
                    stock: currentStock,
                    quantity: nextQty,
                  }
                : item
            ),
            isMiniCartOpen: openMiniCart ? true : state.isMiniCartOpen,
          }));

          if (!silent) {
            if (capped) {
              get().showToast(
                `Maximum available stock (${currentStock}) reached for ${input.name}.`,
                "warning"
              );
            } else {
              get().showToast(
                `Added ${input.name} to cart (${nextQty} in cart).`,
                "success"
              );
            }
          }

          return { added: true, capped, finalQuantity: nextQty };
        }

        const capped = requestedToAdd > currentStock;
        const initialQty = Math.min(requestedToAdd, currentStock);

        const newItem: CartItemData = {
          productId: input.productId,
          slug: input.slug,
          name: input.name,
          brand: input.brand,
          image: input.image,
          price: currentPrice,
          oldPrice: currentOldPrice,
          quantity: initialQty,
          stock: currentStock,
          specsSummary: live?.specsSummary ?? input.specsSummary,
          itemType: live?.itemType ?? input.itemType ?? "laptop",
        };

        set((state) => ({
          items: [...state.items, newItem],
          isMiniCartOpen: openMiniCart ? true : state.isMiniCartOpen,
        }));

        if (!silent) {
          if (capped) {
            get().showToast(
              `Added ${initialQty} × ${input.name} (max stock ${currentStock}).`,
              "warning"
            );
          } else {
            get().showToast(`Added ${input.name} to cart.`, "success");
          }
        }

        return { added: true, capped, finalQuantity: initialQty };
      },

      removeItem: (productId) => {
        const target = get().items.find((i) => i.productId === productId);
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
        if (target) {
          get().showToast(`Removed ${target.name} from cart.`, "info");
        }
      },

      updateQuantity: (productId, quantity) => {
        const existing = get().items.find((i) => i.productId === productId);
        if (!existing) return;

        const live = resolveCatalogItem(productId);
        const maxStock = live ? live.stock : existing.stock;

        if (maxStock <= 0) {
          get().showToast(
            `${existing.name} is currently out of stock.`,
            "error"
          );
          return;
        }

        const clampedMin = Math.max(1, Math.floor(quantity));
        const capped = clampedMin > maxStock;
        const nextQty = Math.min(clampedMin, maxStock);

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: nextQty, stock: maxStock }
              : item
          ),
        }));

        if (capped) {
          get().showToast(
            `Only ${maxStock} units of ${existing.name} available in stock.`,
            "warning"
          );
        } else {
          set({
            lastAnnouncement: `Updated ${existing.name} quantity to ${nextQty}.`,
          });
        }
      },

      incrementItem: (productId) => {
        const existing = get().items.find((i) => i.productId === productId);
        if (!existing) return;

        const live = resolveCatalogItem(productId);
        const maxStock = live ? live.stock : existing.stock;

        if (existing.quantity >= maxStock) {
          get().showToast(
            `Maximum available stock (${maxStock}) reached for ${existing.name}.`,
            "warning"
          );
          return;
        }

        get().updateQuantity(productId, existing.quantity + 1);
      },

      decrementItem: (productId) => {
        const existing = get().items.find((i) => i.productId === productId);
        if (!existing) return;
        if (existing.quantity <= 1) return;
        get().updateQuantity(productId, existing.quantity - 1);
      },

      clearCart: () => {
        set({
          items: [],
          couponCode: null,
          lastAnnouncement: "Shopping cart cleared.",
        });
        get().showToast("Cart has been cleared.", "info");
      },

      applyCoupon: (code) => {
        const totals = calculateCartTotals(get().items, null);
        const result = validateCoupon(code, totals.subtotal);
        if (result.valid && result.coupon) {
          set({
            couponCode: result.coupon.code,
            lastAnnouncement: result.message,
          });
          get().showToast(result.message, "success");
        } else {
          set({ lastAnnouncement: result.message });
        }
        return result;
      },

      removeCoupon: () => {
        const prev = get().couponCode;
        set({
          couponCode: null,
          lastAnnouncement: prev ? `Removed promo code ${prev}.` : "",
        });
        if (prev) {
          get().showToast(`Promo code ${prev} removed.`, "info");
        }
      },

      getTotals: () => calculateCartTotals(get().items, get().couponCode),

      totalItems: () => get().getTotals().totalItems,
      subtotal: () => get().getTotals().subtotal,
      savings: () => get().getTotals().totalSavings,
      shipping: () => get().getTotals().shipping,
      tax: () => get().getTotals().tax,
      grandTotal: () => get().getTotals().grandTotal,

      getItemQuantity: (productId) => {
        const found = get().items.find((i) => i.productId === productId);
        return found ? found.quantity : 0;
      },
    }),
    {
      name: CART_STORAGE_KEY,
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
      }),
    }
  )
);
