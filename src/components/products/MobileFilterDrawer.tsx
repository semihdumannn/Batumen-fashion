'use client';

import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useUIStore } from '@/store/useUIStore';
import { ProductFilters } from './ProductFilters';
import type { Category, Brand } from '@/types';

interface Props {
  categories?: Category[];
  brands?: Brand[];
}

export function MobileFilterDrawer({ categories, brands }: Props) {
  const isFilterOpen = useUIStore((s) => s.isFilterOpen);
  const closeFilter = useUIStore((s) => s.closeFilter);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFilter();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeFilter]);

  useEffect(() => {
    document.body.style.overflow = isFilterOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isFilterOpen]);

  return (
    <div
      className={`fixed inset-0 z-[40] md:hidden ${isFilterOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!isFilterOpen}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${isFilterOpen ? 'opacity-60' : 'opacity-0'}`}
        onClick={closeFilter}
      />

      {/* Bottom sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-200 max-h-[85vh] flex flex-col transition-transform duration-300 ease-out ${isFilterOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-sm font-semibold tracking-widest text-white">FİLTRELE</h2>
          <button
            onClick={closeFilter}
            className="p-1 text-gray-500 hover:text-white transition-colors"
            aria-label="Filtreleri kapat"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          <ProductFilters categories={categories} brands={brands} />
        </div>
        <div className="px-6 py-4 border-t border-gray-200 shrink-0">
          <button
            onClick={closeFilter}
            className="w-full bg-[#F8F7F5] text-gray-900 text-xs font-semibold tracking-widest py-4"
          >
            FİLTRELERİ UYGULA
          </button>
        </div>
      </div>
    </div>
  );
}
