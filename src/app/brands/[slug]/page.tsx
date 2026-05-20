import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { ProductGrid } from '@/components/products/ProductGrid';
import { getCachedProducts, getCachedBrands } from '@/lib/cache';

export const revalidate = 180;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brands = await getCachedBrands();
  const brand = brands.find((b) => b.slug === slug);
  return {
    title: brand ? `${brand.name} Ürünleri` : 'Marka',
    description: brand ? `${brand.name} markasına ait tüm ürünler.` : undefined,
  };
}

export default async function BrandPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const qParams = await searchParams;
  const page = Number(qParams.page ?? 1);

  const [brands, { data: products, meta }] = await Promise.all([
    getCachedBrands(),
    getCachedProducts({ brand: slug, page, per_page: 24 }),
  ]);

  const brand = brands.find((b) => b.slug === slug);
  const brandName = brand?.name ?? slug;

  return (
    <>
      <section className="bg-gray-900 text-white py-20">
        <Container>
          <a href="/brands" className="text-[10px] tracking-widest text-gray-600 hover:text-gray-400 transition-colors mb-6 block">
            ← MARKALAR
          </a>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
            {brandName.toUpperCase()}
          </h1>
          <p className="text-gray-500 text-sm mt-3">{meta.total} ürün</p>
        </Container>
      </section>

      <section className="py-16 bg-[#F8F7F5]">
        <Container>
          <ProductGrid products={products} />

          {meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/brands/${slug}?page=${p}`}
                  className={`w-10 h-10 flex items-center justify-center text-xs font-medium border transition-colors ${p === page ? 'bg-gray-900 text-white border-[#0A0A0A]' : 'border-gray-200 text-gray-900 hover:border-[#0A0A0A]'}`}
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
