import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { AddBundleToCartButton } from '@/components/bundles/AddBundleToCartButton';
import { api } from '@/lib/api';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const bundle = await api.getBundle(slug);
    return { title: `${bundle.name} | Batumen Fashion` };
  } catch {
    return { title: 'Paket Bulunamadı' };
  }
}

export default async function BundleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let bundle;
  try {
    bundle = await api.getBundle(slug);
  } catch {
    return notFound();
  }

  const savings = bundle.original_price - bundle.bundle_price;
  const savingsPct = Math.round((savings / bundle.original_price) * 100);

  return (
    <div className="bg-white min-h-screen">
      <Container className="py-10">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-black transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/bundles" className="hover:text-black transition-colors">Paketler</Link>
          <span>/</span>
          <span className="text-gray-700">{bundle.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
            {bundle.image ? (
              <Image src={bundle.image} alt={bundle.name} fill sizes="50vw" className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-200 text-8xl font-bold">{bundle.products.length}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{bundle.name}</h1>
            {bundle.description && <p className="text-gray-500 text-sm mb-6">{bundle.description}</p>}

            <div className="flex items-baseline gap-4 mb-2">
              <span className="text-3xl font-bold text-[#E8001A]">{bundle.bundle_price.toFixed(2)} ₺</span>
              <span className="text-xl text-gray-400 line-through">{bundle.original_price.toFixed(2)} ₺</span>
            </div>
            {savingsPct > 0 && (
              <p className="text-sm font-semibold text-[#E8001A] mb-6">
                %{savingsPct} tasarruf — {savings.toFixed(2)} ₺ kazanç
              </p>
            )}

            {/* Products in bundle */}
            <div className="border-t border-gray-100 pt-6 mb-6">
              <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-4">PAKETE DAHİL ÜRÜNLER</h3>
              <div className="space-y-3">
                {bundle.products.map((product) => {
                  const img = product.images?.find((i) => i.is_primary) ?? product.images?.[0];
                  return (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="relative w-14 h-16 bg-gray-100 shrink-0 overflow-hidden">
                        {img && (
                          <Image
                            src={img.thumbnail_url ?? img.image_url}
                            alt={product.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${product.slug}`} className="text-sm font-medium text-gray-800 hover:underline line-clamp-1">
                          {product.name}
                        </Link>
                        <p className="text-xs text-gray-400">{product.base_price.toFixed(2)} ₺</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <AddBundleToCartButton products={bundle.products} />
          </div>
        </div>
      </Container>
    </div>
  );
}
