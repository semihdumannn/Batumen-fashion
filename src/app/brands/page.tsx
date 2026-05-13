import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { getCachedBrands } from '@/lib/cache';

export const metadata: Metadata = {
  title: 'Markalar',
  description: 'Batumen Fashion bünyesindeki markalar.',
};

export const revalidate = Number(process.env.CACHE_TTL_STATIC ?? 14400);

export default async function BrandsPage() {
  const brands = await getCachedBrands();

  return (
    <>
      <section className="bg-gray-900 text-white py-20">
        <Container>
          <p className="text-[10px] tracking-[0.35em] text-gray-600 mb-4">KOLEKSİYON</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">MARKALAR</h1>
        </Container>
      </section>

      <section className="py-16 bg-[#F8F7F5]">
        <Container>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-[#D4D4CF]">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="group bg-[#F8F7F5] p-10 flex flex-col items-center justify-center gap-4 hover:bg-gray-900 transition-colors duration-300 aspect-square"
              >
                {brand.logo ? (
                  <div className="relative w-20 h-20">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      className="object-contain filter group-hover:invert transition-all duration-300"
                      sizes="80px"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <span className="font-display text-xl font-bold text-white">
                      {brand.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <p className="text-[10px] font-bold tracking-widest text-gray-900 group-hover:text-white transition-colors text-center">
                  {brand.name.toUpperCase()}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
