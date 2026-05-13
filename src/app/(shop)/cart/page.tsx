'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Container } from '@/components/layout/Container';
import { useCartStore } from '@/store/useCartStore';

export default function CartPage() {
  const { items, isLoading, fetchCart, updateItem, removeItem, getTotal } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (isLoading && items.length === 0) {
    return (
      <Container className="py-12">
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">SEPETİNİZ BOŞ</h1>
        <p className="text-gray-500 mb-8">Alışverişe devam etmek için ürün ekleyin.</p>
        <Link
          href="/products"
          className="inline-block bg-black text-white px-10 py-4 text-sm font-semibold hover:bg-gray-900 transition-colors"
        >
          ÜRÜNLERE GİT
        </Link>
      </Container>
    );
  }

  const total = getTotal();

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold mb-8 tracking-tight">SEPETİM</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const primaryImage =
              item.product.images?.find((img) => img.is_primary) ?? item.product.images?.[0];

            return (
              <div key={item.id} className="flex gap-4 py-4 border-b border-gray-100">
                {/* Image */}
                <div className="relative w-24 h-24 shrink-0 bg-gray-50">
                  {primaryImage ? (
                    <Image
                      src={primaryImage.image_url}
                      alt={item.product.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="text-sm font-medium text-black hover:underline line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  {item.variant?.options && (
                    <p className="text-xs text-gray-500 mt-1">
                      {Object.entries(item.variant.options)
                        .filter(([, v]) => v)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' / ')}
                    </p>
                  )}
                  <p className="text-sm font-bold text-black mt-2">
                    {item.price.toFixed(2)} ₺
                  </p>
                </div>

                {/* Quantity + Remove */}
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center border border-gray-200">
                    <button
                      onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-sm"
                      disabled={isLoading}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-sm"
                      disabled={isLoading}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Kaldır"
                    disabled={isLoading}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 sticky top-24">
            <h2 className="text-base font-semibold mb-4 tracking-wide">SİPARİŞ ÖZETİ</h2>

            <div className="space-y-2 text-sm pb-4 border-b border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600">Ara Toplam</span>
                <span>{total.toFixed(2)} ₺</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kargo</span>
                <span className="text-green-600">Ücretsiz</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-base pt-4 mb-6">
              <span>Toplam</span>
              <span>{total.toFixed(2)} ₺</span>
            </div>

            {/* Coupon */}
            <div className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Kupon kodu"
                  className="flex-1 border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
                />
                <button className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-900 transition-colors">
                  Uygula
                </button>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-red-500 text-white text-center py-4 text-sm font-semibold hover:bg-red-600 transition-colors tracking-wide"
            >
              ÖDEMEYE GEÇ
            </Link>

            <Link
              href="/products"
              className="block text-center text-sm text-gray-500 hover:text-black mt-3 underline"
            >
              Alışverişe Devam Et
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}
