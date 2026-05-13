'use client';

import Link from 'next/link';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCompareStore } from '@/store/useCompareStore';

export function CompareBar() {
  const products = useCompareStore((s) => s.products);
  const removeProduct = useCompareStore((s) => s.removeProduct);
  const clearAll = useCompareStore((s) => s.clearAll);

  if (products.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[35] bg-gray-900 border-t border-gray-200 shadow-2xl">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
        <p className="text-[10px] tracking-widest text-gray-500 shrink-0 hidden sm:block">
          KARŞILAŞTIR
        </p>

        <div className="flex-1 flex items-center gap-3 overflow-x-auto">
          {products.map((product) => {
            const img = product.images?.find((i) => i.is_primary) ?? product.images?.[0];
            return (
              <div key={product.id} className="flex items-center gap-2 shrink-0 bg-gray-50 border border-gray-200 px-3 py-1.5">
                {img && (
                  <div className="relative w-8 h-10 overflow-hidden">
                    <Image
                      src={img.thumbnail_url ?? img.image_url}
                      alt={product.name}
                      fill
                      sizes="32px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <p className="text-xs text-white max-w-[100px] truncate">{product.name}</p>
                <button
                  onClick={() => removeProduct(product.id)}
                  className="text-gray-600 hover:text-white transition-colors"
                  aria-label="Kaldır"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {products.length < 3 && (
            <div className="shrink-0 w-24 h-12 border border-dashed border-gray-200 flex items-center justify-center">
              <span className="text-[9px] text-gray-600 tracking-wider">+ EKLE</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {products.length >= 2 && (
            <Link
              href="/compare"
              className="bg-[#E8001A] hover:bg-[#C40017] text-white text-[10px] font-bold tracking-widest px-5 py-2.5 transition-colors whitespace-nowrap"
            >
              KARŞILAŞTIR ({products.length})
            </Link>
          )}
          <button
            onClick={clearAll}
            className="text-[10px] text-gray-600 hover:text-white transition-colors"
          >
            Temizle
          </button>
        </div>
      </div>
    </div>
  );
}
