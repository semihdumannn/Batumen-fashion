import type { Metadata } from 'next';
import { HeroSlider } from '@/components/home/HeroSlider';
import { CollectionBanner } from '@/components/home/CollectionBanner';
import { ProductCarousel } from '@/components/home/ProductCarousel';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { NewsletterForm } from '@/components/ui/NewsletterForm';
import {
  getCachedFeaturedProducts,
  getCachedNewProducts,
  getCachedCategories,
  getCachedHeroBanners,
  getCachedBannersByPlacement,
} from '@/lib/cache';

export const metadata: Metadata = {
  title: 'Batumen Fashion - Erkek Giyim',
  description: 'Modern erkek giyim ve aksesuar. Yeni sezon koleksiyonunu keşfet.',
};

export const revalidate = 900;

export default async function HomePage() {
  const [
    featuredProducts,
    newProducts,
    categories,
    heroBanners,
    collection1Banners,
    collection2Banners,
    categoryBanners,
  ] = await Promise.all([
    getCachedFeaturedProducts(),
    getCachedNewProducts(),
    getCachedCategories(),
    getCachedHeroBanners(),
    getCachedBannersByPlacement('home_collection_1'),
    getCachedBannersByPlacement('home_collection_2'),
    getCachedBannersByPlacement('home_category'),
  ]);

  return (
    <>
      {/* 1. Hero Slider */}
      {heroBanners.length > 0 ? (
        <HeroSlider banners={heroBanners} />
      ) : (
        <section className="relative w-full h-[80vh] min-h-[500px] bg-gray-900 flex items-end">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative pb-16 px-6 md:px-16 max-w-2xl">
            <p className="text-xs text-gray-400 tracking-[0.25em] uppercase mb-3">YENİ SEZON 2026</p>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-6">
              Modern Erkek Giyiminde<br />Yeni Bir Sayfa
            </h1>
            <a
              href="/products"
              className="inline-block border border-white text-white text-xs font-semibold tracking-widest px-8 py-3 hover:bg-white hover:text-black transition-colors"
            >
              KOLEKSİYONU KEŞFET
            </a>
          </div>
        </section>
      )}

      {/* 2. Koleksiyon Bant 1 */}
      {collection1Banners[0] && (
        <CollectionBanner banner={collection1Banners[0]} direction="left" />
      )}

      {/* 3. Öne Çıkan Ürünler Carousel */}
      <ProductCarousel
        title="ÖNE ÇIKAN ÜRÜNLER"
        products={featuredProducts}
        viewAllHref="/products?filter[is_featured]=true"
      />

      {/* 4. Kategori Grid */}
      <CategoryGrid categories={categories} categoryBanners={categoryBanners} />

      {/* 5. Yeni Gelenler Carousel */}
      <ProductCarousel
        title="YENİ GELENLER"
        products={newProducts}
        viewAllHref="/products?filter[is_new]=true"
      />

      {/* 6. Koleksiyon Bant 2 */}
      {collection2Banners[0] && (
        <CollectionBanner banner={collection2Banners[0]} direction="right" />
      )}

      {/* 7. Newsletter */}
      <section className="py-16 bg-[#0A0A0A] text-white">
        <div className="max-w-lg mx-auto text-center px-4">
          <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-3">BÜLTEN</p>
          <h2 className="text-2xl font-bold mb-2 tracking-tight">Abone Ol</h2>
          <p className="text-gray-400 text-sm mb-8">Kampanya ve yenilikleri ilk sen öğren.</p>
          <NewsletterForm dark />
        </div>
      </section>
    </>
  );
}
