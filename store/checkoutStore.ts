"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DeliveryMethodId, PaymentMethodId } from "@/lib/config";
import {
  DEFAULT_SHIPPING_VALUES,
  type CardFormValues,
  type ShippingStepValues,
} from "@/lib/validations/checkout";

export type CheckoutStepNumber = 1 | 2 | 3 | 4;

interface CheckoutStoreState {
  currentStep: CheckoutStepNumber;
  completedSteps: CheckoutStepNumber[];
  shippingData: ShippingStepValues;
  deliveryMethodId: DeliveryMethodId;
  paymentMethodId: PaymentMethodId;
  walletPhone: string;

  /**
   * Transient in-memory card fields (NEVER persisted to localStorage).
   */
  transientCardData: CardFormValues;

  setStep: (step: CheckoutStepNumber) => void;
  markStepCompleted: (step: CheckoutStepNumber) => void;
  setShippingData: (data: ShippingStepValues) => void;
  setDeliveryMethodId: (id: DeliveryMethodId) => void;
  setPaymentMethodId: (id: PaymentMethodId) => void;
  setWalletPhone: (phone: string) => void;
  setTransientCardData: (data: Partial<CardFormValues>) => void;
  resetCheckout: () => void;
}

const INITIAL_CARD_DATA: CardFormValues = {
  cardHolderName: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvv: "",
};

/**
 * Zustand store for multi-step checkout progress.
 * Persists non-sensitive shipping, delivery, and payment method selection to localStorage
 * so progress survives a page refresh. Never persists credit card numbers, expiry, or CVV.
 */
export const useCheckoutStore = create<CheckoutStoreState>()(
  persist(
    (set) => ({
      currentStep: 1,
      completedSteps: [],
      shippingData: DEFAULT_SHIPPING_VALUES,
      deliveryMethodId: "standard",
      paymentMethodId: "card",
      walletPhone: "",
      transientCardData: INITIAL_CARD_DATA,

      setStep: (step) => set({ currentStep: step }),

      markStepCompleted: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
        })),

      setShippingData: (data) => set({ shippingData: data }),

      setDeliveryMethodId: (id) => set({ deliveryMethodId: id }),

      setPaymentMethodId: (id) => set({ paymentMethodId: id }),

      setWalletPhone: (phone) => set({ walletPhone: phone }),

      setTransientCardData: (data) =>
        set((state) => ({
          transientCardData: { ...state.transientCardData, ...data },
        })),

      resetCheckout: () =>
        set({
          currentStep: 1,
          completedSteps: [],
          deliveryMethodId: "standard",
          paymentMethodId: "card",
          walletPhone: "",
          transientCardData: INITIAL_CARD_DATA,
          shippingData: stateCopyOrResetShipping(DEFAULT_SHIPPING_VALUES),
        }),
    }),
    {
      name: "tk-laptop-checkout",
      // Strictly exclude transientCardData from localStorage persistence
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        shippingData: state.shippingData.saveAddress
          ? state.shippingData
          : DEFAULT_SHIPPING_VALUES,
        deliveryMethodId: state.deliveryMethodId,
        paymentMethodId: state.paymentMethodId,
        walletPhone: state.walletPhone,
      }),
    }
  )
);

function stateCopyOrResetShipping(
  defaults: ShippingStepValues
): ShippingStepValues {
  return {
    ...defaults,
    shippingAddress: { ...defaults.shippingAddress },
    billingAddress: defaults.billingAddress
      ? { ...defaults.billingAddress }
      : undefined,
  };
}
