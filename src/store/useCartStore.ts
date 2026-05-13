'use client';

import { create } from 'zustand';
import { api } from '@/lib/api';
import type { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  couponCode: string | null;
  couponDiscount: number;
  loyaltyDiscount: number;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity: number, variantId?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  getTotal: () => number;
  getDiscountedTotal: () => number;
  getItemCount: () => number;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<string>;
  removeCoupon: () => Promise<void>;
  applyLoyaltyPoints: (points: number) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  couponCode: null,
  couponDiscount: 0,
  loyaltyDiscount: 0,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const cart = await api.getCart();
      set({
        items: cart?.items ?? [],
        couponCode: cart?.coupon_code ?? null,
        couponDiscount: cart?.discount ?? 0,
      });
    } catch {
      set({ items: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity, variantId) => {
    set({ isLoading: true });
    try {
      await api.addToCart(productId, quantity, variantId);
      await get().fetchCart();
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (itemId, quantity) => {
    set({ isLoading: true });
    try {
      await api.updateCartItem(itemId, quantity);
      await get().fetchCart();
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true });
    try {
      await api.removeFromCart(itemId);
      await get().fetchCart();
    } finally {
      set({ isLoading: false });
    }
  },

  getTotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  getDiscountedTotal: () => {
    const subtotal = get().getTotal();
    const discount = get().couponDiscount + get().loyaltyDiscount;
    return Math.max(0, subtotal - discount);
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },

  clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0, loyaltyDiscount: 0 }),

  applyCoupon: async (code) => {
    const result = await api.applyCoupon(code);
    set({ couponCode: result.code, couponDiscount: result.discount });
    return result.message;
  },

  removeCoupon: async () => {
    await api.removeCoupon();
    set({ couponCode: null, couponDiscount: 0 });
  },

  applyLoyaltyPoints: (points) => {
    const discount = Math.floor(points / 100);
    set({ loyaltyDiscount: discount });
  },
}));
