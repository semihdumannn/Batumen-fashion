import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';
import { Container } from '@/components/layout/Container';
import { ProductImages } from '@/components/products/ProductImages';
import { AddToCartButton } from '@/components/products/AddToCartButton';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductReviews } from '@/components/products/ProductReviews';
import { ProductQuestions } from '@/components/products/ProductQuestions';
import { ProductViewTracker } from '@/components/products/ProductViewTracker';
import { RecentlyViewed } from '@/components/products/RecentlyViewed';
import { ShareButtons } from '@/components/products/ShareButtons';
import { ProductJsonLd } from '@/components/seo/ProductJsonLd';
import { getCachedProduct, getCachedRelatedProducts } from '@/lib/cache';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedProduct(slug);
  if (!product) return { title: 'Ürün Bulunamadı' };
  return {
    title: product.name,
    description: product.description?.replace(/<[^>]+>/g, '').slice(0, 160),
    openGraph: {
      title: product.name,
      images: product.images?.[0]?.image_url ? [product.images[0].image_url] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, relatedProducts] = await Promise.all([
    getCachedProduct(slug),
    getCachedRelatedProducts(slug),
  ]);

  if (!product) return notFound();
  const isOnSale = product.compare_at_price != null && product.compare_at_price > product.base_price;

  return (
    <>
      <ProductJsonLd product={product} />

      <div className="bg-white">
        <Container className="py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
            <Link href="/" className="hover:text-black transition-colors">Ana Sayfa</Link>
            <span>/</span>
            {product.categories?.[0] && (
              <>
                <Link href={`/categories/${product.categories[0].slug}`} className="hover:text-black transition-colors">
                  {product.categories[0].name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-700 line-clamp-1">{product.name}</span>
          </nav>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 xl:gap-16">
            {/* Left — images */}
            <div>
              <ProductImages product={product} productName={product.name} />
            </div>

            {/* Right — sticky info */}
            <div className="lg:sticky lg:top-20 lg:self-start space-y-0">
              {/* Brand */}
              {product.brand && (
                <Link
                  href={`/brands/${product.brand.slug}`}
                  className="text-xs font-semibold tracking-widest text-gray-500 hover:text-black uppercase transition-colors block mb-1.5"
                >
                  {product.brand.name}
                </Link>
              )}

              {/* Product name */}
              <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-3">
                {product.name}
              </h1>

              {/* Rating */}
              {(product.average_rating ?? 0) > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.round(product.average_rating ?? 0) ? 'text-yellow-400' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {product.average_rating?.toFixed(1)} ({product.reviews_count} yorum)
                  </span>
                </div>
              )}

              {/* Sale badge */}
              {isOnSale && (
                <div className="inline-flex items-center gap-2 bg-red-50 text-[#E8001A] text-xs font-semibold px-3 py-1.5 mb-4">
                  İNDİRİMLİ ÜRÜN
                </div>
              )}

              {/* AddToCartButton contains price, variants, wishlist, accordions */}
              <AddToCartButton product={product} />

              {/* Share */}
              <div className="border-t border-gray-200 pt-4 mt-2">
                <ShareButtons title={product.name} />
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Track view */}
      <ProductViewTracker product={product} />

      {/* Reviews + Q&A */}
      <div className="bg-gray-50 py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ProductReviews
              slug={product.slug}
              averageRating={product.average_rating}
              reviewsCount={product.reviews_count}
            />
            <ProductQuestions slug={product.slug} />
          </div>
        </Container>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="py-12 bg-white">
          <Container>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Benzer Ürünler</h2>
            <ProductGrid products={relatedProducts} />
          </Container>
        </div>
      )}

      <div className="bg-white py-8">
        <Container>
          <RecentlyViewed excludeId={product.id} />
        </Container>
      </div>
    </>
  );
}
