import { ProductCard } from './ProductCard';
import type { Product } from '@/types';

interface Props {
  products: Product[];
  isLoading?: boolean;
}

function SkeletonCard() {
  return (
    <div>
      <div className="aspect-square skeleton" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-16 skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-20 skeleton" />
      </div>
    </div>
  );
}

export function ProductGrid({ products, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-sm">Ürün bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
