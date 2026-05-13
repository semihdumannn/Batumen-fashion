'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { Banner } from '@/types';

export function HeroSlider({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[current];

  return (
    <section className="relative w-full h-[80vh] min-h-[500px] overflow-hidden bg-gray-900">
      <Image
        key={banner.id}
        src={banner.image}
        alt={banner.title}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-80 transition-opacity duration-700"
        unoptimized
      />
      {/* gradient bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Content — bottom left */}
      <div className="absolute bottom-0 left-0 pb-16 px-6 md:px-16 max-w-2xl">
        {banner.subtitle && (
          <p className="text-xs text-gray-300 tracking-[0.25em] uppercase mb-3">{banner.subtitle}</p>
        )}
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-5">
          {banner.title}
        </h1>
        {banner.link && (
          <Link
            href={banner.link}
            className="inline-block border border-white text-white text-xs font-semibold tracking-widest px-8 py-3 hover:bg-white hover:text-black transition-colors"
          >
            {banner.button_text ?? 'KEŞFET'}
          </Link>
        )}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 right-6 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/40 w-2'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
