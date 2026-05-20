import { unstable_cache } from 'next/cache';
import type { Product, Category, Brand, BlogPost, PaginatedResponse, ProductFilters, Campaign, Banner, SiteSettings } from '@/types';

const API = process.env.NEXT_PUBLIC_API_URL!;

// CACHE_ENABLED=false → tüm fetch'ler no-store (dev), true → TTL aktif (prod)
const CACHE_ENABLED = process.env.CACHE_ENABLED === 'true';

// TTL env'den okunur, fallback = production varsayılanı
export const TTL = {
  STATIC:       Number(process.env.CACHE_TTL_STATIC       ?? 14400),
  LISTING:      Number(process.env.CACHE_TTL_LISTING      ?? 180),
  PRODUCT:      Number(process.env.CACHE_TTL_PRODUCT      ?? 300),
  HOMEPAGE:     Number(process.env.CACHE_TTL_HOMEPAGE     ?? 900),
  REVIEWS:      Number(process.env.CACHE_TTL_STATIC       ?? 14400),
  BLOG_LISTING: Number(process.env.CACHE_TTL_BLOG_LISTING ?? 600),
  BLOG_POST:    Number(process.env.CACHE_TTL_BLOG_POST    ?? 1800),
} as const;

// fetch options builder: cache kapalıysa no-store, açıksa ISR tag'li
function fetchOpts(revalidate: number, tags: string[]): RequestInit {
  if (!CACHE_ENABLED) return { cache: 'no-store' };
  return { next: { revalidate, tags } };
}

// ─── Cache Tags ───────────────────────────────────────────────────────────────
// Admin paneli bu tag'leri kullanarak revalidateTag() ile cache'i temizler.
// Örnek webhook endpoint: POST /api/revalidate?tag=products&secret=...

export const TAGS = {
  products: 'products',
  product: (slug: string) => `product-${slug}`,
  categories: 'categories',
  brands: 'brands',
  homepage: 'homepage',
  reviews: (slug: string) => `reviews-${slug}`,
  blogPosts: 'blog-posts',
  blogPost: (slug: string) => `blog-post-${slug}`,
} as const;

// ─── Cached Fetchers ─────────────────────────────────────────────────────────

async function _fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API}/categories`, fetchOpts(TTL.STATIC, [TAGS.categories]));
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

async function _fetchBrands(): Promise<Brand[]> {
  try {
    const res = await fetch(`${API}/brands`, fetchOpts(TTL.STATIC, [TAGS.brands]));
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

async function _fetchProducts(params: URLSearchParams): Promise<PaginatedResponse<Product>> {
  const empty: PaginatedResponse<Product> = {
    data: [],
    meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
  };
  try {
    const res = await fetch(`${API}/products?${params.toString()}`, fetchOpts(TTL.LISTING, [TAGS.products]));
    if (!res.ok) return empty;
    return res.json();
  } catch {
    return empty;
  }
}

async function _fetchProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API}/products/${slug}`, fetchOpts(TTL.PRODUCT, [TAGS.products, TAGS.product(slug)]));
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ?? null;
  } catch {
    return null;
  }
}

async function _fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/products?filter[is_featured]=true&per_page=8`, fetchOpts(TTL.HOMEPAGE, [TAGS.homepage, TAGS.products]));
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

async function _fetchNewProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/products?filter[is_new]=true&per_page=8`, fetchOpts(TTL.HOMEPAGE, [TAGS.homepage, TAGS.products]));
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────
// CACHE_ENABLED=true → unstable_cache ile sarılır (in-memory + disk, tag-based invalidation)
// CACHE_ENABLED=false → doğrudan çağrı, no-store fetch

function withCache<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  keyParts: string[],
  revalidate: number,
  tags: string[]
): (...args: T) => Promise<R> {
  if (!CACHE_ENABLED) return fn;
  return unstable_cache(fn, keyParts, { revalidate, tags });
}

export const getCachedCategories = withCache(
  _fetchCategories, ['categories'], TTL.STATIC, [TAGS.categories]
);

export const getCachedBrands = withCache(
  _fetchBrands, ['brands'], TTL.STATIC, [TAGS.brands]
);

export const getCachedFeaturedProducts = withCache(
  _fetchFeaturedProducts, ['featured-products'], TTL.HOMEPAGE, [TAGS.homepage, TAGS.products]
);

export const getCachedNewProducts = withCache(
  _fetchNewProducts, ['new-products'], TTL.HOMEPAGE, [TAGS.homepage, TAGS.products]
);

export const getCachedProduct = withCache(
  _fetchProduct, ['product'], TTL.PRODUCT, [TAGS.products]
);

// Parametre alan fonksiyonlar için wrapper (unstable_cache key'i string[] olmalı)
export async function getCachedProducts(filters: ProductFilters): Promise<PaginatedResponse<Product>> {
  const params = buildProductParams(filters);
  // Listing'i unstable_cache'e sarmıyoruz — parametre kombinasyonları
  // çok fazla, her biri ayrı cache entry oluşturur.
  // Bunun yerine fetch-level next.tags kullanıyoruz.
  return _fetchProducts(params);
}

// ─── Blog cached fetchers ─────────────────────────────────────────────────────

async function _fetchRelatedProducts(slug: string): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/products/${slug}/related`, fetchOpts(TTL.LISTING, [TAGS.products, TAGS.product(slug)]));
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function getCachedRelatedProducts(slug: string): Promise<Product[]> {
  return _fetchRelatedProducts(slug);
}

async function _fetchBlogPosts(params?: URLSearchParams): Promise<PaginatedResponse<BlogPost>> {
  const empty: PaginatedResponse<BlogPost> = {
    data: [],
    meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
  };
  try {
    const query = params ? `?${params.toString()}` : '';
    const res = await fetch(`${API}/blog/posts${query}`, fetchOpts(TTL.BLOG_LISTING, [TAGS.blogPosts]));
    if (!res.ok) return empty;
    return res.json();
  } catch {
    return empty;
  }
}

async function _fetchBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API}/blog/posts/${slug}`, fetchOpts(TTL.BLOG_POST, [TAGS.blogPosts, TAGS.blogPost(slug)]));
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ?? null;
  } catch {
    return null;
  }
}

export const getCachedBlogPost = withCache(
  _fetchBlogPost, ['blog-post'], TTL.BLOG_POST, [TAGS.blogPosts]
);

export async function getCachedBlogPosts(params?: { page?: number; per_page?: number; tag?: string; category?: string }): Promise<PaginatedResponse<BlogPost>> {
  const urlParams = new URLSearchParams();
  if (params?.page) urlParams.set('page', String(params.page));
  if (params?.per_page) urlParams.set('per_page', String(params.per_page));
  if (params?.tag) urlParams.set('tag', params.tag);
  if (params?.category) urlParams.set('category', params.category);
  return _fetchBlogPosts(urlParams.toString() ? urlParams : undefined);
}

export async function getCachedBlogCategories() {
  try {
    const res = await fetch(`${API}/blog/categories`, fetchOpts(TTL.STATIC, [TAGS.blogPosts]));
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function getCachedBlogTags() {
  try {
    const res = await fetch(`${API}/blog/tags`, fetchOpts(TTL.STATIC, [TAGS.blogPosts]));
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export const getCachedSettings = withCache(
  async (): Promise<SiteSettings> => {
    try {
      const res = await fetch(`${API}/settings`, fetchOpts(TTL.STATIC, ['settings']));
      if (!res.ok) return {};
      const data = await res.json();
      return (data.data ?? data) as SiteSettings;
    } catch {
      return {};
    }
  },
  ['site-settings'],
  TTL.STATIC,
  ['settings']
);

export async function getCachedHeroBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(`${API}/banners?placement=home_hero`, fetchOpts(TTL.HOMEPAGE, [TAGS.homepage]));
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function getCachedBannersByPlacement(placement: string): Promise<Banner[]> {
  try {
    const res = await fetch(
      `${API}/banners?placement=${encodeURIComponent(placement)}`,
      fetchOpts(TTL.HOMEPAGE, [TAGS.homepage])
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function getCachedCampaigns(): Promise<Campaign[]> {
  try {
    const res = await fetch(`${API}/campaigns`, fetchOpts(TTL.BLOG_LISTING, ['campaigns']));
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export function buildProductParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search)    params.set('filter[search]', filters.search);
  if (filters.category)  params.set('filter[category]', filters.category);
  if (filters.brand)     params.set('filter[brand]', filters.brand);
  if (filters.min_price) params.set('filter[min_price]', String(filters.min_price));
  if (filters.max_price) params.set('filter[max_price]', String(filters.max_price));
  if (filters.is_featured) params.set('filter[is_featured]', 'true');
  if (filters.is_new)    params.set('filter[is_new]', 'true');
  if (filters.on_sale)   params.set('filter[on_sale]', 'true');
  if (filters.in_stock)  params.set('filter[in_stock]', 'true');
  if (filters.size)      params.set('filter[size]', filters.size);
  if (filters.color)     params.set('filter[color]', filters.color);
  if (filters.min_rating) params.set('filter[min_rating]', String(filters.min_rating));
  if (filters.sort)      params.set('sort', filters.sort);
  if (filters.page)      params.set('page', String(filters.page));
  params.set('per_page', String(filters.per_page ?? 20));
  return params;
}
