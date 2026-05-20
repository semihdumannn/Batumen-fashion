import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { ProductGrid } from '@/components/products/ProductGrid';
import { getCachedProducts, getCachedBrands } from '@/lib/cache';
import type { ProductFilters } from '@/types';

export const metadata: Metadata = {
  title: 'İndirim',
  description: 'Batumen Fashion indirimli ürünler — kampanya koleksiyonu.',
};

export const revalidate = 180;

interface Props {
  searchParams: Promise<{ brand?: string; sort?: string; page?: string }>;
}

export default async function SalePage({ searchParams }: Props) {
  const params = await searchParams;
  const filters: ProductFilters = {
    on_sale: true,
    brand: params.brand,
    sort: (params.sort as ProductFilters['sort']) ?? 'price_asc',
    page: Number(params.page ?? 1),
    per_page: 24,
  };

  const [{ data: products, meta }, brands] = await Promise.all([
    getCachedProducts(filters),
    getCachedBrands(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-[#E8001A] text-white py-16">
        <Container>
          <p className="text-[10px] tracking-[0.35em] text-red-200 mb-4">KAMPANYA</p>
          <h1 className="font-display text-6xl md:text-8xl font-bold tracking-tight">
            İNDİRİM
          </h1>
          <p className="text-red-200 text-sm mt-4">
            {meta.total} ürün — stoklar tükenene kadar
          </p>
        </Container>
      </section>

      <section className="py-16 bg-[#F8F7F5]">
        <Container>
          {/* Brand filter */}
          {brands.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              <a
                href="/sale"
                className={`text-[10px] tracking-widest px-4 py-2 border transition-colors ${!params.brand ? 'bg-gray-900 text-white border-[#0A0A0A]' : 'border-gray-200 text-gray-900 hover:border-[#0A0A0A]'}`}
              >
                TÜMÜ
              </a>
              {brands.map((brand) => (
                <a
                  key={brand.id}
                  href={`/sale?brand=${brand.slug}`}
                  className={`text-[10px] tracking-widest px-4 py-2 border transition-colors ${params.brand === brand.slug ? 'bg-gray-900 text-white border-[#0A0A0A]' : 'border-gray-200 text-gray-900 hover:border-[#0A0A0A]'}`}
                >
                  {brand.name.toUpperCase()}
                </a>
              ))}
            </div>
          )}

          <ProductGrid products={products} />

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/sale?page=${p}${params.brand ? `&brand=${params.brand}` : ''}`}
                  className={`w-10 h-10 flex items-center justify-center text-xs font-medium border transition-colors ${p === meta.current_page ? 'bg-gray-900 text-white border-[#0A0A0A]' : 'border-gray-200 text-gray-900 hover:border-[#0A0A0A]'}`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
