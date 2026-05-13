'use client';

import useSWR from 'swr';

// Stok verisini cache'leme — SWR ile 30 saniyde bir yenile.
// Neden: Ürün sayfası 5 dakika cache'li gelir (fiyat/açıklama için OK),
// ama stok gerçek zamanlı olmalı. Ekleme kalmadı mı göster.

const STOCK_SWR_CONFIG = {
  refreshInterval: 30_000,        // 30 saniyede bir arka planda güncelle
  revalidateOnFocus: true,        // Sekmeye dönünce anında kontrol et
  revalidateOnReconnect: true,    // İnternet bağlanınca kontrol et
  dedupingInterval: 10_000,       // Aynı key için 10sn içinde tekrar istek atma
};

interface StockData {
  stock_quantity: number;
  variants?: Array<{
    id: number;
    stock_quantity: number;
  }>;
}

async function fetchStock(slug: string): Promise<StockData> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/${slug}/stock`,
    { cache: 'no-store' }  // Stok asla cache'lenmesin
  );

  if (!res.ok) {
    // Stok endpoint yoksa ürün endpoint'inden al (fallback)
    const fallback = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`,
      { cache: 'no-store' }
    );
    if (!fallback.ok) throw new Error('Stock fetch failed');
    const data = await fallback.json();
    return {
      stock_quantity: data.data.stock_quantity,
      variants: data.data.variants?.map((v: { id: number; stock_quantity: number }) => ({
        id: v.id,
        stock_quantity: v.stock_quantity,
      })),
    };
  }

  return res.json();
}

export function useProductStock(slug: string, initialStock: number) {
  const { data, error, isLoading } = useSWR<StockData>(
    slug ? `stock:${slug}` : null,
    () => fetchStock(slug),
    {
      ...STOCK_SWR_CONFIG,
      fallbackData: { stock_quantity: initialStock },
    }
  );

  return {
    stockQuantity: data?.stock_quantity ?? initialStock,
    variantStock: data?.variants,
    isOutOfStock: (data?.stock_quantity ?? initialStock) === 0,
    isLoading,
    hasError: !!error,
  };
}
