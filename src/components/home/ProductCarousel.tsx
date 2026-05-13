'use client';
import { useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ProductCard } from '@/components/products/ProductCard';
import type { Product } from '@/types';

interface Props {
  title: string;
  products: Product[];
  viewAllHref?: string;
}

export function ProductCarousel({ title, products, viewAllHref }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === 'right' ? 300 : -300, behavior: 'smooth' });
  };

  if (products.length === 0) return null;

  return (
    <section className="py-14 bg-white">
      <div className="px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-gray-900 uppercase">{title}</h2>
          <div className="flex items-center gap-3">
            {viewAllHref && (
              <a href={viewAllHref} className="text-xs text-gray-400 hover:text-black underline underline-offset-2 mr-4">
                Tümünü Gör
              </a>
            )}
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex w-8 h-8 border border-gray-200 items-center justify-center hover:border-black transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex w-8 h-8 border border-gray-200 items-center justify-center hover:border-black transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={ref}
          className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div key={product.id} className="snap-start shrink-0 w-[220px] sm:w-[260px] md:w-[280px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
