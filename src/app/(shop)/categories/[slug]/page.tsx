import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { ProductCard } from '@/components/products/ProductCard';
import { FilterDrawer } from '@/components/products/FilterDrawer';
import { getCachedProducts, getCachedBrands } from '@/lib/cache';

export const revalidate = Number(process.env.CACHE_TTL_LISTING ?? 180);

interface SearchParams {
  sort?: string;
  page?: string;
  brand?: string;
  min_price?: string;
  max_price?: string;
  size?: string;
  color?: string;
  min_rating?: string;
  is_new?: string;
  on_sale?: string;
  in_stock?: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  return {
    title: name,
    description: `${name} kategorisindeki ürünleri keşfet.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const [{ data: products, meta }, brands] = await Promise.all([
    getCachedProducts({
      category: slug,
      brand: sp.brand,
      min_price: sp.min_price ? Number(sp.min_price) : undefined,
      max_price: sp.max_price ? Number(sp.max_price) : undefined,
      size: sp.size,
      color: sp.color,
      min_rating: sp.min_rating ? Number(sp.min_rating) : undefined,
      is_new: sp.is_new === 'true',
      on_sale: sp.on_sale === 'true',
      in_stock: sp.in_stock === 'true',
      sort: sp.sort as 'price_asc' | 'price_desc' | 'newest' | 'popular' | undefined,
      page: sp.page ? Number(sp.page) : undefined,
      per_page: 20,
    }),
    getCachedBrands(),
  ]);

  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

  return (
    <Container className="py-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <nav className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
            <a href="/" className="hover:text-black">Ana Sayfa</a>
            <span>/</span>
            <span className="text-black">{categoryName}</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight">{categoryName.toUpperCase()}</h1>
          <p className="text-xs text-gray-400 mt-1">{meta.total} ürün</p>
        </div>
        <Suspense>
          <FilterDrawer brands={brands} totalProducts={meta.total} />
        </Suspense>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm">Bu kategoride ürün bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
            <a
              key={page}
              href={`/categories/${slug}?${new URLSearchParams({ ...sp, page: String(page) }).toString()}`}
              className={`w-10 h-10 flex items-center justify-center text-sm border transition-colors ${
                page === meta.current_page
                  ? 'bg-black text-white border-black'
                  : 'border-gray-200 text-gray-700 hover:border-black'
              }`}
            >
              {page}
            </a>
          ))}
        </div>
      )}
    </Container>
  );
}
