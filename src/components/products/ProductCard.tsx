'use client';

import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import type { Product } from '@/types';
import { getProductImages } from '@/lib/product';

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const isOnSale =
    product.compare_at_price != null && product.compare_at_price > product.base_price;
  const discount = isOnSale
    ? Math.round(((product.compare_at_price! - product.base_price) / product.compare_at_price!) * 100)
    : 0;

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);
  const toast = useToastStore();

  const images = getProductImages(product);
  const primaryImage = images.find((img) => img.is_primary) ?? images[0];

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id);
        toast.info('Favorilerden kaldırıldı');
      } else {
        await addToWishlist(product.id);
        toast.success('Favorilere eklendi');
      }
    } catch {
      toast.error('Bir hata oluştu');
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {primaryImage ? (
          <Image
            src={primaryImage.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-xs">Görsel yok</span>
          </div>
        )}

        {/* Badges */}
        {isOnSale && (
          <div className="absolute top-2 left-2 bg-[#E8001A] text-white text-xs font-semibold px-2 py-0.5">
            -%{discount}
          </div>
        )}
        {product.is_new && !isOnSale && (
          <div className="absolute top-2 left-2 bg-black text-white text-xs font-semibold px-2 py-0.5">
            YENİ
          </div>
        )}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-sm text-gray-500 font-medium">Tükendi</span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
          aria-label="Favorilere ekle"
        >
          {isInWishlist ? (
            <HeartSolidIcon className="w-4 h-4 text-[#E8001A]" />
          ) : (
            <HeartIcon className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="mt-2.5 space-y-0.5">
        {product.brand && (
          <p className="text-xs text-gray-500">{product.brand.name}</p>
        )}
        <h3 className="text-sm text-gray-900 leading-snug group-hover:underline underline-offset-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 pt-0.5">
          <span className={`text-sm font-semibold ${isOnSale ? 'text-[#E8001A]' : 'text-gray-900'}`}>
            {product.base_price.toFixed(2)} ₺
          </span>
          {isOnSale && (
            <span className="text-xs text-gray-400 line-through">
              {product.compare_at_price?.toFixed(2)} ₺
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
