import Image from 'next/image';
import Link from 'next/link';
import type { Banner } from '@/types';

interface Props {
  banner: Banner;
  direction?: 'left' | 'right';
}

export function CollectionBanner({ banner, direction = 'left' }: Props) {
  const imageCol = (
    <div className="relative aspect-[3/4] md:aspect-auto md:h-[600px] overflow-hidden">
      <Image
        src={banner.image}
        alt={banner.title}
        fill
        sizes="(max-width: 768px) 100vw, 60vw"
        className="object-cover hover:scale-105 transition-transform duration-700"
        unoptimized
      />
    </div>
  );

  const textCol = (
    <div className="flex flex-col items-center justify-center text-center px-10 py-16 bg-[#F8F7F5]">
      {banner.subtitle && (
        <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-4">{banner.subtitle}</p>
      )}
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
        {banner.title}
      </h2>
      {banner.link && (
        <Link
          href={banner.link}
          className="text-xs tracking-widest underline underline-offset-4 text-gray-900 hover:opacity-60 transition-opacity"
        >
          {banner.button_text ?? 'ŞİMDİ KEŞFET'}
        </Link>
      )}
    </div>
  );

  if (direction === 'right') {
    return (
      <section className="grid grid-cols-1 md:grid-cols-[2fr_3fr]">
        {textCol}
        {imageCol}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-[3fr_2fr]">
      {imageCol}
      {textCol}
    </section>
  );
}
