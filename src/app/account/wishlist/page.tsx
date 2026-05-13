'use client';

import { useEffect } from 'react';
import { Container } from '@/components/layout/Container';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useWishlistStore } from '@/store/useWishlistStore';

export default function WishlistPage() {
  const { items, isLoading, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const products = items.map((item) => item.product);

  return (
    <div>
      <h1 className="text-xl font-bold mb-6 tracking-tight">FAVORİLERİM</h1>

      {isLoading ? (
        <ProductGrid products={[]} isLoading />
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm mb-4">Favorilerinizde ürün bulunmuyor.</p>
          <a
            href="/products"
            className="inline-block bg-black text-white px-8 py-3 text-sm font-semibold hover:bg-gray-900 transition-colors"
          >
            ÜRÜNLERE GİT
          </a>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
