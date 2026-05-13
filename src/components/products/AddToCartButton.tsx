'use client';

import { useState } from 'react';
import { HeartIcon, ChevronDownIcon, TruckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useCartStore } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';
import { useToastStore } from '@/store/useToastStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuthStore } from '@/store/useAuthStore';
import { SizeGuideModal } from './SizeGuideModal';
import { StockNotifyButton } from './StockNotifyButton';
import { parseVariantOptions } from '@/lib/product';
import type { Product, ProductVariant } from '@/types';

const COLOR_MAP: Record<string, string> = {
  siyah: '#111111', beyaz: '#FAFAFA', gri: '#9CA3AF', lacivert: '#1E3A5F',
  mavi: '#3B82F6', kirmizi: '#DC2626', kırmızı: '#DC2626', yesil: '#16A34A',
  yeşil: '#16A34A', kahverengi: '#7C4B1A', bej: '#D4B896', sarı: '#FCD34D',
  pembe: '#F9A8D4', mor: '#9333EA', turuncu: '#F97316', bordo: '#9B1C1C',
  haki: '#78716C', ekru: '#F5F0E8',
};

function getColorHex(colorName: string): string {
  return COLOR_MAP[colorName.toLowerCase()] ?? '#E5E5E5';
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left"
      >
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-4 text-sm text-gray-600 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

interface Props {
  product: Product & { slug: string };
}

export function AddToCartButton({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const openCart = useUIStore((s) => s.openCart);
  const toast = useToastStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);

  // Variant options normalize (API string JSON veya obje döner)
  const parsedVariants = (product.variants ?? []).map((v) => ({
    ...v,
    options: parseVariantOptions(v.options),
  }));

  // Unique colors from variants
  const colors = parsedVariants.length > 0
    ? [...new Set(parsedVariants.map((v) => v.options['Renk'] ?? v.options['color']).filter(Boolean))] as string[]
    : [];

  const hasColors = colors.length > 0;
  const hasSizes = parsedVariants.some((v) => v.options['Beden'] ?? v.options['size']);

  const [selectedColor, setSelectedColor] = useState<string | null>(
    hasColors ? (colors[0] ?? null) : null
  );
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(() => {
    if (!parsedVariants.length) return null;
    if (hasColors && colors[0]) {
      return parsedVariants.find((v) => (v.options['Renk'] ?? v.options['color']) === colors[0]) ?? parsedVariants[0];
    }
    return parsedVariants[0];
  });
  const [added, setAdded] = useState(false);

  // Variants filtered by selected color
  const sizeVariants = selectedColor
    ? parsedVariants.filter((v) => (v.options['Renk'] ?? v.options['color']) === selectedColor)
    : parsedVariants;

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const first = parsedVariants.find((v) => (v.options['Renk'] ?? v.options['color']) === color);
    setSelectedVariant(first ?? null);
  };

  const handleSizeSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  const isOutOfStock =
    product.stock_quantity === 0 ||
    (selectedVariant ? selectedVariant.stock_quantity === 0 : false);

  const lowStock = selectedVariant
    ? selectedVariant.stock_quantity > 0 && selectedVariant.stock_quantity <= 5
    : product.stock_quantity > 0 && product.stock_quantity <= 5;

  const currentPrice = selectedVariant?.price ?? product.base_price;
  const isOnSale = product.compare_at_price != null && product.compare_at_price > product.base_price;
  const discount = isOnSale
    ? Math.round(((product.compare_at_price! - product.base_price) / product.compare_at_price!) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    if (hasSizes && !selectedVariant) {
      toast.error('Lütfen bir beden seçin');
      return;
    }
    try {
      await addItem(product.id, 1, selectedVariant?.id);
      setAdded(true);
      openCart();
      toast.success('Ürün sepete eklendi');
      setTimeout(() => setAdded(false), 2000);
    } catch {
      toast.error('Ürün sepete eklenemedi');
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    try {
      if (isInWishlist) { await removeFromWishlist(product.id); toast.info('Favorilerden kaldırıldı'); }
      else { await addToWishlist(product.id); toast.success('Favorilere eklendi'); }
    } catch { toast.error('Bir hata oluştu'); }
  };

  return (
    <div>
      {/* Price */}
      <div className="flex items-baseline gap-3 mb-5">
        <span className={`text-2xl font-bold ${isOnSale ? 'text-[#E8001A]' : 'text-gray-900'}`}>
          {currentPrice.toFixed(2)} ₺
        </span>
        {isOnSale && (
          <>
            <span className="text-lg text-gray-400 line-through">{product.compare_at_price?.toFixed(2)} ₺</span>
            <span className="text-sm font-semibold text-[#E8001A] bg-red-50 px-2 py-0.5">%{discount} İNDİRİM</span>
          </>
        )}
      </div>

      {/* Color selection */}
      {hasColors && (
        <div className="mb-5">
          <p className="text-sm text-gray-700 mb-2.5">
            <span className="font-semibold">Renk:</span>{' '}
            <span className="text-gray-500">{selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const hex = getColorHex(color);
              const isSelected = selectedColor === color;
              const isLight = ['beyaz', 'bej', 'ekru', 'sarı'].includes(color.toLowerCase());
              return (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  title={color}
                  className={`relative w-8 h-8 rounded-full transition-transform ${
                    isSelected ? 'ring-2 ring-gray-900 ring-offset-2 scale-110' : 'hover:scale-105'
                  } ${isLight ? 'border border-gray-200' : ''}`}
                  style={{ backgroundColor: hex }}
                >
                  <span className="sr-only">{color}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size selection */}
      {hasSizes && sizeVariants.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-sm font-semibold text-gray-700">
              {(() => {
                const opts = parseVariantOptions(selectedVariant?.options ?? {});
                const size = opts['Beden'] ?? opts['size'];
                return <>Beden{size ? ': ' : ''}<span className="font-normal text-gray-500">{size ?? ''}</span></>;
              })()}
            </p>
            <SizeGuideModal />
          </div>
          <div className="flex flex-wrap gap-2">
            {sizeVariants.map((variant) => {
              const opts = parseVariantOptions(variant.options);
              const sizeLabel = opts['Beden'] ?? opts['size'] ?? variant.sku;
              const isSelected = selectedVariant?.id === variant.id;
              const outOfStock = variant.stock_quantity === 0;
              return (
                <button
                  key={variant.id}
                  onClick={() => !outOfStock && handleSizeSelect(variant)}
                  disabled={outOfStock}
                  className={`min-w-[52px] h-11 px-3 border text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : outOfStock
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through bg-gray-50'
                      : 'border-gray-300 text-gray-800 hover:border-gray-900'
                  }`}
                >
                  {sizeLabel}
                </button>
              );
            })}
          </div>

          {/* Low stock warning */}
          {lowStock && !isOutOfStock && (
            <p className="text-xs text-[#E8001A] mt-2">
              ⚠ Son {selectedVariant?.stock_quantity ?? product.stock_quantity} ürün!
            </p>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="space-y-3 mb-6">
        {isOutOfStock ? (
          <StockNotifyButton slug={product.slug} variantId={selectedVariant?.id} />
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className={`w-full py-4 text-sm font-semibold tracking-wide transition-colors ${
              added ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-black'
            }`}
          >
            {added ? '✓ Sepete Eklendi' : isLoading ? 'Ekleniyor...' : 'Sepete Ekle'}
          </button>
        )}

        <button
          onClick={handleWishlist}
          className="w-full py-3.5 border border-gray-300 text-sm font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
        >
          {isInWishlist
            ? <><HeartSolidIcon className="w-4 h-4 text-[#E8001A]" /> Favorilerimde</>
            : <><HeartIcon className="w-4 h-4" /> Favorilere Ekle</>
          }
        </button>
      </div>

      {/* Accordions */}
      <div>
        {product.description && (
          <AccordionItem title="Ürün Açıklaması" defaultOpen>
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </AccordionItem>
        )}

        <AccordionItem title="Ürün Detayları">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">SKU</span>
              <span className="font-mono text-gray-800">{product.sku}</span>
            </div>
            {product.categories?.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Kategori</span>
                <span className="text-gray-800">{product.categories.map((c) => c.name).join(', ')}</span>
              </div>
            )}
            {product.brand && (
              <div className="flex justify-between">
                <span className="text-gray-500">Marka</span>
                <span className="text-gray-800">{product.brand.name}</span>
              </div>
            )}
          </div>
        </AccordionItem>

        <AccordionItem title="Kargo & Teslimat">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <TruckIcon className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Standart Teslimat</p>
                <p className="text-gray-500 mt-0.5">500 ₺ ve üzeri siparişlerde ücretsiz kargo. Tahmini teslimat 2–5 iş günü.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ArrowPathIcon className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Kolay İade</p>
                <p className="text-gray-500 mt-0.5">Teslim tarihinden itibaren 14 gün içinde ücretsiz iade.</p>
              </div>
            </div>
          </div>
        </AccordionItem>
      </div>
    </div>
  );
}
