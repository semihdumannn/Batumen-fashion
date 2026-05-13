'use client';

import type { Product } from '@/types';

const STORAGE_KEY = 'recently-viewed';
const MAX_ITEMS = 10;

type RecentProduct = Pick<Product, 'id' | 'name' | 'slug' | 'base_price' | 'compare_at_price' | 'images' | 'brand'>;

export function useRecentlyViewed() {
  const getItems = (): RecentProduct[] => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  };

  const addItem = (product: RecentProduct) => {
    if (typeof window === 'undefined') return;
    const existing = getItems();
    const filtered = existing.filter((p) => p.id !== product.id);
    const updated = [product, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return { getItems, addItem };
}
