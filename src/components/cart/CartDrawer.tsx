'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { XMarkIcon, ShoppingBagIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useUIStore } from '@/store/useUIStore';
import { useCartStore } from '@/store/useCartStore';
import { CouponInput } from './CouponInput';
import { GiftCardInput } from './GiftCardInput';
import { getProductImages, parseVariantOptions } from '@/lib/product';

export function CartDrawer() {
  const isCartOpen = useUIStore((s) => s.isCartOpen);
  const closeCart = useUIStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const getDiscountedTotal = useCartStore((s) => s.getDiscountedTotal);
  const couponDiscount = useCartStore((s) => s.couponDiscount);
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeCart]);

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isCartOpen]);

  return (
    <div
      className={`fixed inset-0 z-[40] ${isCartOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!isCartOpen}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeCart}
      />

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl flex flex-col transition-transform duration-300 ease-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900 tracking-wide">
            SEPETİM {items.length > 0 && `(${items.reduce((c, i) => c + i.quantity, 0)})`}
          </h2>
          <button onClick={closeCart} className="p-1 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Sepeti kapat">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
            <ShoppingBagIcon className="w-10 h-10 text-gray-300" />
            <p className="text-sm text-gray-400">Sepetiniz boş</p>
            <Link href="/products" onClick={closeCart} className="text-xs text-black underline underline-offset-4 hover:opacity-70 transition-opacity">
              Alışverişe başla
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4 px-5 space-y-4">
            {items.map((item) => {
              const productImages = getProductImages(item.product);
              const primaryImage = productImages.find((i) => i.is_primary) ?? productImages[0];
              return (
                <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className="relative w-20 h-24 bg-gray-100 shrink-0 overflow-hidden">
                    {primaryImage && (
                      <Image
                        src={primaryImage.thumbnail_url ?? primaryImage.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product.slug}`} onClick={closeCart} className="text-xs font-medium text-gray-900 hover:underline line-clamp-2 leading-snug">
                      {item.product.name}
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {Object.entries(parseVariantOptions(item.variant.options))
                          .filter(([, v]) => v)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' / ')}
                      </p>
                    )}
                    <p className="text-xs font-semibold text-gray-900 mt-1">
                      {(item.price * item.quantity).toFixed(2)} ₺
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                        className="w-6 h-6 flex items-center justify-center border border-gray-300 text-gray-500 hover:border-black hover:text-black transition-colors"
                      >
                        <MinusIcon className="w-3 h-3" />
                      </button>
                      <span className="text-xs text-gray-700 w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center border border-gray-300 text-gray-500 hover:border-black hover:text-black transition-colors"
                      >
                        <PlusIcon className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors">
                        Kaldır
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-200 space-y-3 bg-gray-50">
            <CouponInput />
            <GiftCardInput />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Ara Toplam</span>
              <span>{getTotal().toFixed(2)} ₺</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span>İndirim</span>
                <span>-{couponDiscount.toFixed(2)} ₺</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold text-gray-900">
              <span>Toplam</span>
              <span>{getDiscountedTotal().toFixed(2)} ₺</span>
            </div>
            <p className="text-xs text-gray-400">Kargo ödeme adımında hesaplanır</p>
            <Link href="/checkout" onClick={closeCart} className="block w-full bg-black hover:bg-gray-800 text-white text-sm font-semibold text-center py-3 transition-colors">
              Ödemeye Geç
            </Link>
            <Link href="/cart" onClick={closeCart} className="block w-full text-center text-xs text-gray-500 hover:text-black underline underline-offset-4 transition-colors py-1">
              Sepeti Görüntüle
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
