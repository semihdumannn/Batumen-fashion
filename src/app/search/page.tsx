import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { ProductGrid } from '@/components/products/ProductGrid';
import { getCachedProducts } from '@/lib/cache';

export const metadata: Metadata = {
  title: 'Arama',
};

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q?.trim() ?? '';
  const page = Number(params.page ?? 1);

  const { data: products, meta } = query
    ? await getCachedProducts({ search: query, page, per_page: 24 })
    : { data: [], meta: { current_page: 1, last_page: 1, per_page: 24, total: 0 } };

  return (
    <>
      <section className="bg-gray-900 text-white py-16">
        <Container>
          <p className="text-[10px] tracking-[0.35em] text-gray-600 mb-4">ARAMA SONUÇLARI</p>
          {query ? (
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
              &ldquo;{query}&rdquo;
            </h1>
          ) : (
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">ARAMA</h1>
          )}
          {query && (
            <p className="text-gray-500 text-sm mt-3">{meta.total} sonuç bulundu</p>
          )}
        </Container>
      </section>

      <section className="py-16 bg-[#F8F7F5]">
        <Container>
          {!query ? (
            <div className="text-center py-20">
              <p className="text-sm text-gray-500">Aramak istediğiniz ürünü girin.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-gray-500 mb-4">
                &ldquo;{query}&rdquo; için sonuç bulunamadı.
              </p>
              <a href="/products" className="text-xs tracking-widest underline underline-offset-4 text-gray-900">
                TÜM ÜRÜNLERE GİT
              </a>
            </div>
          ) : (
            <>
              <ProductGrid products={products} />
              {meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={`/search?q=${encodeURIComponent(query)}&page=${p}`}
                      className={`w-10 h-10 flex items-center justify-center text-xs font-medium border transition-colors ${p === page ? 'bg-gray-900 text-white border-[#0A0A0A]' : 'border-gray-200 text-gray-900 hover:border-[#0A0A0A]'}`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </Container>
      </section>
    </>
  );
}
