'use client';

import { useEffect } from 'react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import type { Product } from '@/types';

type Props = {
  product: Pick<Product, 'id' | 'name' | 'slug' | 'base_price' | 'compare_at_price' | 'images' | 'media_files' | 'primary_image' | 'brand'>;
};

export function ProductViewTracker({ product }: Props) {
  const { addItem } = useRecentlyViewed();

  useEffect(() => {
    addItem(product);
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
