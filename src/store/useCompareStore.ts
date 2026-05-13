'use client';

import { create } from 'zustand';
import type { Product } from '@/types';

type CompareProduct = Pick<Product, 'id' | 'name' | 'slug' | 'base_price' | 'compare_at_price' | 'images' | 'brand' | 'variants' | 'average_rating' | 'stock_quantity'>;

const MAX_ITEMS = 3;

interface CompareState {
  products: CompareProduct[];
  addProduct: (product: CompareProduct) => boolean;
  removeProduct: (productId: number) => void;
  clearAll: () => void;
  isInComparison: (productId: number) => boolean;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  products: [],

  addProduct: (product) => {
    if (get().products.length >= MAX_ITEMS) return false;
    if (get().isInComparison(product.id)) return true;
    set((state) => ({ products: [...state.products, product] }));
    return true;
  },

  removeProduct: (productId) => {
    set((state) => ({ products: state.products.filter((p) => p.id !== productId) }));
  },

  clearAll: () => set({ products: [] }),

  isInComparison: (productId) => get().products.some((p) => p.id === productId),
}));
