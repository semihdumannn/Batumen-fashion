import Image from 'next/image';
import Link from 'next/link';
import type { Category, Banner } from '@/types';

const CATEGORY_GRADIENTS = [
  'from-gray-800 to-gray-600',
  'from-stone-700 to-stone-500',
  'from-zinc-800 to-zinc-600',
  'from-neutral-700 to-neutral-500',
];

type Item =
  | { kind: 'banner'; id: number; image: string | null; title: string; href: string; index: number }
  | { kind: 'category'; id: number; image: string | null; title: string; href: string; index: number };

export function CategoryGrid({
  categories,
  categoryBanners = [],
}: {
  categories: Category[];
  categoryBanners?: Banner[];
}) {
  // Eğer home_category bannerleri varsa onları göster, yoksa kategorilere dön
  const items: Item[] = categoryBanners.length > 0
    ? categoryBanners.slice(0, 8).map((b, i) => ({
        kind: 'banner',
        id: b.id,
        image: b.image ?? null,
        title: b.title,
        href: b.link ?? '#',
        index: i,
      }))
    : categories.slice(0, 8).map((c, i) => ({
        kind: 'category',
        id: c.id,
        image: c.image ?? null,
        title: c.name,
        href: `/categories/${c.slug}`,
        index: i,
      }));

  if (items.length === 0) return null;

  return (
    <section className="py-14 bg-[#F8F7F5]">
      <div className="px-4 md:px-8 lg:px-16">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-gray-900 uppercase mb-6">KATEGORİLER</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group relative aspect-[3/4] overflow-hidden bg-gray-200"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-b ${CATEGORY_GRADIENTS[item.index % CATEGORY_GRADIENTS.length]}`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-semibold text-sm tracking-wide">{item.title}</p>
                <p className="text-white/60 text-xs mt-0.5 group-hover:text-white transition-colors">Keşfet →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
