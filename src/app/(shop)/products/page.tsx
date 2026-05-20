import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { ProductCard } from '@/components/products/ProductCard';
import { FilterDrawer } from '@/components/products/FilterDrawer';
import { getCachedProducts, getCachedBrands } from '@/lib/cache';

export const metadata: Metadata = {
  title: 'Tüm Ürünler',
  description: 'Batumen Fashion ürün koleksiyonu.',
};

export const revalidate = 180;

interface SearchParams {
  search?: string;
  category?: string;
  brand?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
  page?: string;
  size?: string;
  color?: string;
  min_rating?: string;
  is_new?: string;
  on_sale?: string;
  in_stock?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const [productsData, brands] = await Promise.all([
    getCachedProducts({
      search: params.search,
      category: params.category,
      brand: params.brand,
      min_price: params.min_price ? Number(params.min_price) : undefined,
      max_price: params.max_price ? Number(params.max_price) : undefined,
      size: params.size,
      color: params.color,
      min_rating: params.min_rating ? Number(params.min_rating) : undefined,
      is_new: params.is_new === 'true',
      on_sale: params.on_sale === 'true',
      in_stock: params.in_stock === 'true',
      sort: params.sort as 'price_asc' | 'price_desc' | 'newest' | 'popular' | undefined,
      page: params.page ? Number(params.page) : undefined,
      per_page: 20,
    }),
    getCachedBrands(),
  ]);

  const { data: products, meta } = productsData;
  const currentPage = meta.current_page;
  const totalPages = meta.last_page;

  return (
    <Container className="py-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">TÜM ÜRÜNLER</h1>
          <p className="text-xs text-gray-400 mt-1">{meta.total} ürün</p>
        </div>
        <Suspense>
          <FilterDrawer brands={brands} totalProducts={meta.total} />
        </Suspense>
      </div>

      {params.search && (
        <p className="text-sm text-gray-600 mb-4">
          &quot;{params.search}&quot; için sonuçlar
        </p>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm">Ürün bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <a
              key={page}
              href={`/products?${new URLSearchParams({ ...params, page: String(page) }).toString()}`}
              className={`w-10 h-10 flex items-center justify-center text-sm border transition-colors ${
                page === currentPage
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
