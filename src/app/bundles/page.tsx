import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { api } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Paketler | Batumen Fashion',
  description: 'Avantajlı fiyatlarla ürün paketleri.',
};

export const revalidate = Number(process.env.CACHE_TTL_BLOG_LISTING ?? 600);

export default async function BundlesPage() {
  let bundles: Awaited<ReturnType<typeof api.getBundles>> = [];
  try {
    bundles = await api.getBundles();
  } catch {
    bundles = [];
  }

  return (
    <>
      <section className="bg-gray-900 text-white py-16">
        <Container>
          <p className="text-[10px] tracking-[0.35em] text-gray-400 mb-4">FIRSATLAR</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">PAKETLER</h1>
          <p className="text-gray-400 text-sm mt-4">Birlikte daha avantajlı</p>
        </Container>
      </section>

      <section className="py-16 bg-[#F8F7F5]">
        <Container>
          {bundles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-gray-500">Şu anda aktif paket bulunmuyor.</p>
              <Link href="/products" className="text-sm text-black underline underline-offset-4 mt-4 inline-block">
                Ürünlere Göz At →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bundles.map((bundle) => {
                const savings = bundle.original_price - bundle.bundle_price;
                const savingsPct = Math.round((savings / bundle.original_price) * 100);
                return (
                  <Link
                    key={bundle.id}
                    href={`/bundles/${bundle.slug}`}
                    className="group bg-white border border-gray-100 hover:border-gray-400 transition-colors"
                  >
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      {bundle.image ? (
                        <Image
                          src={bundle.image}
                          alt={bundle.name}
                          fill
                          sizes="(max-width:768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-gray-300 text-4xl font-bold">{bundle.products.length}</span>
                        </div>
                      )}
                      {savingsPct > 0 && (
                        <span className="absolute top-3 left-3 bg-[#E8001A] text-white text-xs font-bold px-2 py-1">
                          %{savingsPct} TASARRUF
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h2 className="font-bold text-gray-900 mb-1">{bundle.name}</h2>
                      {bundle.description && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{bundle.description}</p>
                      )}
                      <div className="flex items-baseline gap-3">
                        <span className="text-lg font-bold text-[#E8001A]">
                          {bundle.bundle_price.toFixed(2)} ₺
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {bundle.original_price.toFixed(2)} ₺
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{bundle.products.length} ürün</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
