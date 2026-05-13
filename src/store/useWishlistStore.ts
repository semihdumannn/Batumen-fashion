'use client';

import { create } from 'zustand';
import { api } from '@/lib/api';
import type { WishlistItem } from '@/types';

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addItem: (productId: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const items = await api.getWishlist();
      set({ items: items ?? [] });
    } catch {
      set({ items: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId) => {
    set({ isLoading: true });
    try {
      await api.addToWishlist(productId);
      await get().fetchWishlist();
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (productId) => {
    set({ isLoading: true });
    try {
      await api.removeFromWishlist(productId);
      await get().fetchWishlist();
    } finally {
      set({ isLoading: false });
    }
  },

  isInWishlist: (productId) => {
    return get().items.some((item) => item.product.id === productId);
  },
}));
