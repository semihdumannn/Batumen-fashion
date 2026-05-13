import type { Product } from '@/types';

interface Props {
  product: Product;
}

export function ProductJsonLd({ product }: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://batumen-fashion.com';
  const primaryImage = product.images?.find((i) => i.is_primary) ?? product.images?.[0];
  const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL ?? '';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description?.replace(/<[^>]*>/g, '').slice(0, 200),
    sku: product.sku,
    image: primaryImage ? `${storageUrl}/${primaryImage.image_url}` : undefined,
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand.name,
    } : undefined,
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/products/${product.slug}`,
      priceCurrency: 'TRY',
      price: product.base_price.toFixed(2),
      availability: product.stock_quantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    aggregateRating: product.average_rating && product.reviews_count
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.average_rating.toFixed(1),
          reviewCount: product.reviews_count,
        }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
