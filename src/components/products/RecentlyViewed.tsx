'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { getProductImages } from '@/lib/product';
import type { Product } from '@/types';

type RecentProduct = Pick<Product, 'id' | 'name' | 'slug' | 'base_price' | 'compare_at_price' | 'images' | 'media_files' | 'primary_image' | 'brand'>;

interface Props {
  excludeId?: number;
  className?: string;
}

export function RecentlyViewed({ excludeId, className = '' }: Props) {
  const { getItems } = useRecentlyViewed();
  const [items, setItems] = useState<RecentProduct[]>([]);

  useEffect(() => {
    const all = getItems();
    setItems(excludeId ? all.filter((p) => p.id !== excludeId) : all);
  }, [excludeId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (items.length === 0) return null;

  return (
    <section className={className}>
      <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 mb-6">
        SON GÖRÜNTÜLENDİLER
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((product) => {
          const images = getProductImages(product as Product);
          const img = images[0];
          const isOnSale = product.compare_at_price != null && product.compare_at_price > product.base_price;

          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group shrink-0 w-36 block"
            >
              <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden mb-2">
                {img && (
                  <Image
                    src={img.thumbnail_url ?? img.image_url}
                    alt={product.name}
                    fill
                    sizes="144px"
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <p className="text-[9px] text-gray-500 tracking-wider">{product.brand?.name}</p>
              <p className="text-xs text-gray-900 line-clamp-1 group-hover:underline underline-offset-2">
                {product.name}
              </p>
              <p className={`text-xs font-bold mt-0.5 ${isOnSale ? 'text-[#E8001A]' : 'text-gray-900'}`}>
                {product.base_price.toFixed(2)} ₺
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
