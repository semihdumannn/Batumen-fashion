'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { Category, Brand } from '@/types';

interface Props {
  categories?: Category[];
  brands?: Brand[];
}

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
        className="flex w-full items-center justify-between mb-0"
      >
        <span className="text-xs font-semibold text-black tracking-wider">{title}</span>
        <ChevronIcon open={open} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function ProductFilters({ categories = [], brands = [] }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, searchParams, pathname]
  );

  const bulkUpdate = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, searchParams, pathname]
  );

  const clearAll = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const currentSort = searchParams.get('sort') ?? '';
  const currentCategory = searchParams.get('category') ?? '';
  const currentBrand = searchParams.get('brand') ?? '';
  const minPrice = searchParams.get('min_price') ?? '';
  const maxPrice = searchParams.get('max_price') ?? '';
  const currentSize = searchParams.get('size') ?? '';
  const currentColor = searchParams.get('color') ?? '';
  const currentRating = searchParams.get('min_rating') ?? '';
  const isNew = searchParams.get('is_new') ?? '';
  const onSale = searchParams.get('on_sale') ?? '';
  const inStock = searchParams.get('in_stock') ?? '';

  const hasFilters = !!(
    currentSort || currentCategory || currentBrand || minPrice || maxPrice ||
    currentSize || currentColor || currentRating || isNew || onSale || inStock
  );

  type Chip = { key: string; label: string; clearKeys?: string[] };
  const activeChips: Chip[] = [];
  if (currentSort) activeChips.push({ key: 'sort', label: SORT_OPTIONS.find((o) => o.value === currentSort)?.label ?? currentSort });
  if (currentBrand) activeChips.push({ key: 'brand', label: brands.find((b) => b.slug === currentBrand)?.name ?? currentBrand });
  if (currentCategory) activeChips.push({ key: 'category', label: categories.find((c) => c.slug === currentCategory)?.name ?? currentCategory });
  if (minPrice || maxPrice) activeChips.push({ key: 'price', label: `₺${minPrice || '0'} – ₺${maxPrice || '∞'}`, clearKeys: ['min_price', 'max_price'] });
  if (currentSize) activeChips.push({ key: 'size', label: currentSize });
  if (currentColor) activeChips.push({ key: 'color', label: COLORS.find((c) => c.value === currentColor)?.label ?? currentColor });
  if (currentRating) activeChips.push({ key: 'min_rating', label: `${currentRating}★ ve üzeri` });
  if (isNew === 'true') activeChips.push({ key: 'is_new', label: 'Yeni Gelenler' });
  if (onSale === 'true') activeChips.push({ key: 'on_sale', label: 'İndirimli' });
  if (inStock === 'true') activeChips.push({ key: 'in_stock', label: 'Stokta' });

  const removeChip = (chip: Chip) => {
    const params = new URLSearchParams(searchParams.toString());
    (chip.clearKeys ?? [chip.key]).forEach((k) => params.delete(k));
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <aside>
      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-black tracking-wider">AKTİF FİLTRELER</span>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-black underline"
            >
              Temizle
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => removeChip(chip)}
                className="flex items-center gap-1 text-xs bg-black text-white px-2.5 py-1 hover:bg-gray-700 transition-colors"
              >
                {chip.label}
                <span className="text-gray-300 ml-0.5">×</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sort */}
      <FilterSection title="SIRALA">
        <div className="space-y-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateParam('sort', currentSort === opt.value ? '' : opt.value)}
              className={`flex items-center gap-2 w-full text-sm text-left transition-colors ${
                currentSort === opt.value ? 'text-black font-medium' : 'text-gray-500 hover:text-black'
              }`}
            >
              <span
                className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center ${
                  currentSort === opt.value ? 'bg-black border-black' : 'border-gray-300'
                }`}
              >
                {currentSort === opt.value && (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Product status */}
      <FilterSection title="ÜRÜN DURUMU">
        <div className="space-y-2">
          {[
            { key: 'is_new', label: 'Yeni Gelenler', value: isNew },
            { key: 'on_sale', label: 'İndirimli Ürünler', value: onSale },
            { key: 'in_stock', label: 'Stokta Olanlar', value: inStock },
          ].map(({ key, label, value }) => (
            <button
              key={key}
              type="button"
              onClick={() => updateParam(key, value === 'true' ? '' : 'true')}
              className={`flex items-center gap-2 w-full text-sm text-left transition-colors ${
                value === 'true' ? 'text-black font-medium' : 'text-gray-500 hover:text-black'
              }`}
            >
              <span
                className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center ${
                  value === 'true' ? 'bg-black border-black' : 'border-gray-300'
                }`}
              >
                {value === 'true' && (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="FİYAT ARALIĞI">
        <div className="space-y-1 mb-3">
          {PRICE_RANGES.map((range) => {
            const active = minPrice === range.min && maxPrice === range.max;
            return (
              <button
                key={range.label}
                type="button"
                onClick={() =>
                  active
                    ? bulkUpdate({ min_price: '', max_price: '' })
                    : bulkUpdate({ min_price: range.min, max_price: range.max })
                }
                className={`w-full text-left text-sm py-1 px-1 transition-colors ${
                  active ? 'text-black font-medium' : 'text-gray-500 hover:text-black'
                }`}
              >
                {active ? '✓ ' : ''}{range.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5">
          <input
            key={`min-${searchParams.toString()}`}
            type="number"
            placeholder="Min ₺"
            defaultValue={minPrice}
            onBlur={(e) => updateParam('min_price', e.target.value)}
            className="w-full border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-black"
          />
          <span className="text-gray-300 text-xs">—</span>
          <input
            key={`max-${searchParams.toString()}`}
            type="number"
            placeholder="Max ₺"
            defaultValue={maxPrice}
            onBlur={(e) => updateParam('max_price', e.target.value)}
            className="w-full border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-black"
          />
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="BEDEN">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => updateParam('size', currentSize === size ? '' : size)}
              className={`px-3 py-1.5 text-xs border transition-colors ${
                currentSize === size
                  ? 'bg-black text-white border-black'
                  : 'border-gray-200 text-gray-600 hover:border-black hover:text-black'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Color */}
      <FilterSection title="RENK">
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => updateParam('color', currentColor === color.value ? '' : color.value)}
              title={color.label}
              className={`w-7 h-7 rounded-full transition-all ${
                currentColor === color.value
                  ? 'ring-2 ring-black ring-offset-2'
                  : 'ring-1 ring-gray-200 hover:ring-gray-400'
              } ${color.value === 'beyaz' ? 'border border-gray-200' : ''}`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
        {currentColor && (
          <p className="text-xs text-gray-400 mt-2">
            {COLORS.find((c) => c.value === currentColor)?.label}
          </p>
        )}
      </FilterSection>

      {/* Brand */}
      {brands.length > 0 && (
        <FilterSection title="MARKA">
          <ul className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {brands.map((brand) => (
              <li key={brand.id}>
                <button
                  type="button"
                  onClick={() => updateParam('brand', currentBrand === brand.slug ? '' : brand.slug)}
                  className={`flex items-center gap-2 w-full text-sm text-left transition-colors ${
                    currentBrand === brand.slug ? 'text-black font-medium' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <span
                    className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center ${
                      currentBrand === brand.slug ? 'bg-black border-black' : 'border-gray-300'
                    }`}
                  >
                    {currentBrand === brand.slug && (
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {brand.name}
                </button>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* Category */}
      {categories.length > 0 && (
        <FilterSection title="KATEGORİ">
          <ul className="space-y-2">
            <li>
              <button
                type="button"
                onClick={() => updateParam('category', '')}
                className={`text-sm transition-colors ${
                  !currentCategory ? 'text-black font-medium' : 'text-gray-500 hover:text-black'
                }`}
              >
                Tümü
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => updateParam('category', currentCategory === cat.slug ? '' : cat.slug)}
                  className={`text-sm transition-colors ${
                    currentCategory === cat.slug ? 'text-black font-medium' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* Rating */}
      <FilterSection title="MÜŞTERİ DEĞERLENDİRMESİ" defaultOpen={false}>
        <ul className="space-y-2">
          {[4, 3, 2].map((stars) => (
            <li key={stars}>
              <button
                type="button"
                onClick={() =>
                  updateParam('min_rating', currentRating === String(stars) ? '' : String(stars))
                }
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  currentRating === String(stars) ? 'text-black font-medium' : 'text-gray-500 hover:text-black'
                }`}
              >
                <span className="text-amber-400 tracking-tight">{'★'.repeat(stars)}</span>
                <span className="text-gray-200 tracking-tight">{'★'.repeat(5 - stars)}</span>
                <span className="text-xs ml-0.5 text-gray-500">ve üzeri</span>
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="mt-4 w-full border border-gray-200 py-2.5 text-xs font-semibold tracking-wide text-gray-600 hover:border-black hover:text-black transition-colors"
        >
          TÜM FİLTRELERİ TEMİZLE
        </button>
      )}
    </aside>
  );
}
