'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Product } from '@/types';
import { getProductImages } from '@/lib/product';

interface Props {
  product: Product;
  productName: string;
}

export function ProductImages({ product, productName }: Props) {
  const images = getProductImages(product);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);

  const closeZoom = useCallback(() => setZoomedIndex(null), []);

  useEffect(() => {
    if (zoomedIndex === null) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeZoom(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [zoomedIndex, closeZoom]);

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-sm">Görsel yok</span>
      </div>
    );
  }

  return (
    <>
      {/* Masonry grid — LCW style */}
      {images.length >= 2 ? (
        <div>
          {/* First two side by side */}
          <div className="grid grid-cols-2 gap-1 mb-1">
            {images.slice(0, 2).map((img, i) => (
              <button
                key={img.id}
                onClick={() => setZoomedIndex(i)}
                className="relative aspect-[3/4] overflow-hidden bg-gray-100 cursor-zoom-in"
                aria-label="Görseli büyüt"
              >
                <Image
                  src={img.image_url}
                  alt={`${productName} ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover hover:scale-105 transition-transform duration-700 ease-out"
                  priority={i === 0}
                  unoptimized
                />
              </button>
            ))}
          </div>
          {/* Remaining images full width */}
          {images.slice(2).map((img, i) => (
            <button
              key={img.id}
              onClick={() => setZoomedIndex(i + 2)}
              className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-1 w-full block cursor-zoom-in"
              aria-label="Görseli büyüt"
            >
              <Image
                src={img.image_url}
                alt={`${productName} ${i + 3}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover hover:scale-105 transition-transform duration-700 ease-out"
                unoptimized
              />
            </button>
          ))}
        </div>
      ) : (
        /* Single image — large */
        <button
          onClick={() => setZoomedIndex(0)}
          className="relative aspect-[3/4] overflow-hidden bg-gray-100 w-full block cursor-zoom-in"
          aria-label="Görseli büyüt"
        >
          <Image
            src={images[0].image_url}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover hover:scale-105 transition-transform duration-700 ease-out"
            priority
            unoptimized
          />
        </button>
      )}

      {/* Lightbox */}
      {zoomedIndex !== null && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center cursor-zoom-out"
          onClick={closeZoom}
        >
          <button
            onClick={closeZoom}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2"
            aria-label="Kapat"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setZoomedIndex((i) => ((i ?? 0) - 1 + images.length) % images.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors text-3xl leading-none px-3 py-2"
                aria-label="Önceki"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setZoomedIndex((i) => ((i ?? 0) + 1) % images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors text-3xl leading-none px-3 py-2"
                aria-label="Sonraki"
              >
                ›
              </button>
            </>
          )}

          <div
            className="relative max-w-[90vw] max-h-[90vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[zoomedIndex].image_url}
              alt={productName}
              fill
              sizes="90vw"
              className="object-contain"
              unoptimized
            />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setZoomedIndex(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === zoomedIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
                  aria-label={`Görsel ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
