'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import type { Brand } from '@/types';

const SORT_OPTIONS = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'popular', label: 'En Popüler' },
  { value: 'price_asc', label: 'Fiyat: Düşük → Yüksek' },
  { value: 'price_desc', label: 'Fiyat: Yüksek → Düşük' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];

const COLORS = [
  { label: 'Siyah', value: 'siyah', hex: '#111111' },
  { label: 'Beyaz', value: 'beyaz', hex: '#F0F0F0' },
  { label: 'Gri', value: 'gri', hex: '#9CA3AF' },
  { label: 'Lacivert', value: 'lacivert', hex: '#1E3A5F' },
  { label: 'Mavi', value: 'mavi', hex: '#2563EB' },
  { label: 'Kırmızı', value: 'kirmizi', hex: '#DC2626' },
  { label: 'Yeşil', value: 'yesil', hex: '#16A34A' },
  { label: 'Kahverengi', value: 'kahverengi', hex: '#7C4B1A' },
  { label: 'Bej', value: 'bej', hex: '#D4B896' },
  { label: 'Sarı', value: 'sari', hex: '#F59E0B' },
  { label: 'Pembe', value: 'pembe', hex: '#F9A8D4' },
  { label: 'Mor', value: 'mor', hex: '#7C3AED' },
];

const PRICE_RANGES = [
  { label: '0 – 250 ₺', min: '0', max: '250' },
  { label: '250 – 500 ₺', min: '250', max: '500' },
  { label: '500 – 1.000 ₺', min: '500', max: '1000' },
  { label: '1.000 – 2.000 ₺', min: '1000', max: '2000' },
  { label: '2.000 ₺ ve üzeri', min: '2000', max: '' },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between"
      >
        <span className="text-xs font-semibold text-black tracking-wider">{title}</span>
        <ChevronIcon open={open} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

interface LocalFilters {
  sort: string;
  brand: string;
  min_price: string;
  max_price: string;
  size: string;
  color: string;
  is_new: string;
  on_sale: string;
  in_stock: string;
}

interface Props {
  brands?: Brand[];
  totalProducts?: number;
}

export function FilterDrawer({ brands = [], totalProducts }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const [local, setLocal] = useState<LocalFilters>({
    sort:      searchParams.get('sort') ?? '',
    brand:     searchParams.get('brand') ?? '',
    min_price: searchParams.get('min_price') ?? '',
    max_price: searchParams.get('max_price') ?? '',
    size:      searchParams.get('size') ?? '',
    color:     searchParams.get('color') ?? '',
    is_new:    searchParams.get('is_new') ?? '',
    on_sale:   searchParams.get('on_sale') ?? '',
    in_stock:  searchParams.get('in_stock') ?? '',
  });

  const activeCount = Object.values(local).filter(Boolean).length;

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    Object.entries(local).forEach(([k, v]) => { if (v) params.set(k, v); });
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  }, [local, router, pathname]);

  const clearFilters = useCallback(() => {
    setLocal({ sort: '', brand: '', min_price: '', max_price: '', size: '', color: '', is_new: '', on_sale: '', in_stock: '' });
    router.push(pathname);
    setIsOpen(false);
  }, [router, pathname]);

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 border border-gray-300 px-4 py-2.5 text-xs font-semibold tracking-widest hover:border-black transition-colors"
      >
        <AdjustmentsHorizontalIcon className="w-4 h-4" />
        FİLTRELE VE SIRALA
        {activeCount > 0 && (
          <span className="ml-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-sm font-bold tracking-widest">FİLTRELE VE SIRALA</h2>
          <button onClick={() => setIsOpen(false)}>
            <XMarkIcon className="w-5 h-5 text-gray-500 hover:text-black" />
          </button>
        </div>

        {/* Scroll area */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {/* SIRALA */}
          <FilterSection title="SIRALA">
            <div className="space-y-2.5">
              {SORT_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${local.sort === opt.value ? 'border-black' : 'border-gray-300'}`}
                  >
                    {local.sort === opt.value && <span className="w-2 h-2 rounded-full bg-black" />}
                  </span>
                  <span
                    onClick={() => setLocal((l) => ({ ...l, sort: l.sort === opt.value ? '' : opt.value }))}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* BEDEN */}
          <FilterSection title="BEDEN">
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setLocal((l) => ({ ...l, size: l.size === size ? '' : size }))}
                  className={`px-3 py-1.5 text-xs border transition-colors ${
                    local.size === size ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-black'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* MARKA */}
          {brands.length > 0 && (
            <FilterSection title="MARKA">
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {brands.map((brand) => (
                  <label key={brand.id} className="flex items-center gap-2.5 cursor-pointer">
                    <span
                      onClick={() => setLocal((l) => ({ ...l, brand: l.brand === brand.slug ? '' : brand.slug }))}
                      className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center cursor-pointer ${
                        local.brand === brand.slug ? 'bg-black border-black' : 'border-gray-300'
                      }`}
                    >
                      {local.brand === brand.slug && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm text-gray-700">{brand.name}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          )}

          {/* RENK */}
          <FilterSection title="RENK">
            <div className="flex flex-wrap gap-2.5">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  title={color.label}
                  onClick={() => setLocal((l) => ({ ...l, color: l.color === color.value ? '' : color.value }))}
                  className={`w-7 h-7 rounded-full transition-all ${
                    local.color === color.value ? 'ring-2 ring-black ring-offset-2' : 'ring-1 ring-gray-200 hover:ring-gray-400'
                  } ${color.value === 'beyaz' ? 'border border-gray-200' : ''}`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </FilterSection>

          {/* FİYAT */}
          <FilterSection title="FİYAT">
            <div className="space-y-1.5 mb-3">
              {PRICE_RANGES.map((range) => {
                const active = local.min_price === range.min && local.max_price === range.max;
                return (
                  <button
                    key={range.label}
                    type="button"
                    onClick={() => setLocal((l) =>
                      active
                        ? { ...l, min_price: '', max_price: '' }
                        : { ...l, min_price: range.min, max_price: range.max }
                    )}
                    className={`w-full text-left text-sm py-1 transition-colors ${active ? 'text-black font-medium' : 'text-gray-500 hover:text-black'}`}
                  >
                    {active ? '✓ ' : ''}{range.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min ₺"
                value={local.min_price}
                onChange={(e) => setLocal((l) => ({ ...l, min_price: e.target.value }))}
                className="w-full border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-black"
              />
              <span className="text-gray-300 text-xs shrink-0">—</span>
              <input
                type="number"
                placeholder="Max ₺"
                value={local.max_price}
                onChange={(e) => setLocal((l) => ({ ...l, max_price: e.target.value }))}
                className="w-full border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-black"
              />
            </div>
          </FilterSection>

          {/* İNDİRİMLİ */}
          <FilterSection title="İNDİRİMLİ ÜRÜNLER">
            <button
              type="button"
              onClick={() => setLocal((l) => ({ ...l, on_sale: l.on_sale === 'true' ? '' : 'true' }))}
              className={`flex items-center gap-2 text-sm ${local.on_sale === 'true' ? 'text-black font-medium' : 'text-gray-500'}`}
            >
              <span className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center ${local.on_sale === 'true' ? 'bg-black border-black' : 'border-gray-300'}`}>
                {local.on_sale === 'true' && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              İndirimli ürünleri göster
            </button>
          </FilterSection>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 space-y-2">
          <button
            onClick={applyFilters}
            className="w-full bg-black text-white py-4 text-xs font-bold tracking-widest hover:bg-gray-800 transition-colors"
          >
            ÜRÜNLERİ GÖSTER{totalProducts !== undefined ? ` (${totalProducts})` : ''}
          </button>
          <button
            onClick={clearFilters}
            className="w-full text-xs text-gray-400 hover:text-black underline underline-offset-2 py-1"
          >
            Filtreleri Kaldır
          </button>
        </div>
      </div>
    </>
  );
}
