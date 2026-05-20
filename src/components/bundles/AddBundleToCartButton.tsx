'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useToastStore } from '@/store/useToastStore';
import type { Product } from '@/types';

interface Props {
  products: Product[];
}

export function AddBundleToCartButton({ products }: Props) {
  const [loading, setLoading] = useState(false);
  const toast = useToastStore();

  const handleAddBundle = async () => {
    setLoading(true);
    let added = 0;
    try {
      await Promise.all(
        products.map(async (product) => {
          try {
            await useCartStore.getState().addItem(product.id, 1, undefined);
            added++;
          } catch {
            // individual product failure — count it as failed
          }
        })
      );

      if (added === products.length) {
        toast.success(`Paket sepete eklendi (${added} ürün)`);
      } else if (added > 0) {
        toast.warning(`${added} ürün sepete eklendi, bazı ürünler eklenemedi`);
      } else {
        toast.error('Bazı ürünler eklenemedi');
      }
    } catch {
      toast.error('Bazı ürünler eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddBundle}
      disabled={loading}
      className="w-full bg-black text-white py-4 text-sm font-bold tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
    >
      {loading ? 'EKLENİYOR...' : 'PAKETE EKLE'}
    </button>
  );
}
