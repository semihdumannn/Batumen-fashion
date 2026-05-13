import type { Product, ProductImage, ProductVariant } from '@/types';

/** http://adm.* → https://adm.* (local dev API http döner) */
export function normalizeImageUrl(url: string): string {
  if (!url) return url;
  return url.replace(/^http:\/\/(adm\.batumen-fashion\.test)/, 'https://$1');
}

/**
 * Ürünün görsellerini döner.
 * API'nin `images` alanı boşsa `media_files`'tan,
 * o da yoksa `primary_image` string'inden fallback yapar.
 */
export function getProductImages(product: Product): ProductImage[] {
  // 1. images dolu mu?
  if (product.images && product.images.length > 0) {
    return product.images.map((img) => ({
      ...img,
      image_url: normalizeImageUrl(img.image_url),
      thumbnail_url: img.thumbnail_url ? normalizeImageUrl(img.thumbnail_url) : undefined,
    }));
  }

  // 2. media_files kullan (detay API)
  if (product.media_files && product.media_files.length > 0) {
    return product.media_files
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((mf) => ({
        id: mf.id,
        image_url: normalizeImageUrl(mf.url),
        thumbnail_url: normalizeImageUrl(mf.url),
        is_primary: mf.is_primary,
        sort_order: mf.sort_order,
      }));
  }

  // 3. primary_image string (liste API)
  if (product.primary_image) {
    return [
      {
        id: 0,
        image_url: normalizeImageUrl(product.primary_image),
        thumbnail_url: normalizeImageUrl(product.primary_image),
        is_primary: true,
        sort_order: 0,
      },
    ];
  }

  return [];
}

/** Variant options'ı her zaman obje olarak döner (API bazen string JSON gönderir) */
export function parseVariantOptions(options: ProductVariant['options']): Record<string, string | null> {
  if (typeof options === 'string') {
    try {
      return JSON.parse(options) as Record<string, string | null>;
    } catch {
      return {};
    }
  }
  return options ?? {};
}

/** Variant'tan görünen beden/renk etiketini döner */
export function getVariantLabel(variant: ProductVariant): string {
  const opts = parseVariantOptions(variant.options);
  return Object.entries(opts)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([, v]) => v as string)
    .join(' / ') || variant.sku;
}
