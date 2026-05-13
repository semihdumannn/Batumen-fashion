'use client';

import { useProductStock } from '@/hooks/useProductStock';

interface Props {
  slug: string;
  initialStock: number;
}

export function ProductStockStatus({ slug, initialStock }: Props) {
  const { stockQuantity, isOutOfStock } = useProductStock(slug, initialStock);

  if (isOutOfStock) {
    return (
      <div className="mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
        <span className="text-sm font-medium text-red-500">Stokta Yok</span>
      </div>
    );
  }

  if (stockQuantity <= 5) {
    return (
      <div className="mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
        <span className="text-sm font-medium text-yellow-600">
          Son {stockQuantity} ürün kaldı!
        </span>
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
      <span className="text-sm text-green-600">Stokta Var</span>
    </div>
  );
}
