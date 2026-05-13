'use client';

import Link from 'next/link';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Container } from '@/components/layout/Container';
import { useCompareStore } from '@/store/useCompareStore';
import { useCartStore } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';
import { useToastStore } from '@/store/useToastStore';

export default function ComparePage() {
  const products = useCompareStore((s) => s.products);
  const removeProduct = useCompareStore((s) => s.removeProduct);
  const clearAll = useCompareStore((s) => s.clearAll);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);
  const toast = useToastStore();

  const handleAddToCart = async (productId: number) => {
    try {
      await addItem(productId, 1);
      openCart();
      toast.success('Ürün sepete eklendi');
    } catch {
      toast.error('Ürün eklenemedi');
    }
  };

  if (products.length === 0) {
    return (
      <div className="bg-[#F8F7F5] min-h-screen">
        <Container className="py-20 text-center">
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">KARŞILAŞTIRMA</h1>
          <p className="text-sm text-gray-500 mb-8">Karşılaştırma listeniz boş.</p>
          <Link href="/products" className="text-xs tracking-widest underline underline-offset-4 text-gray-900">
            ÜRÜNLERE GİT
          </Link>
        </Container>
      </div>
    );
  }

  const attributes = [
    { label: 'FİYAT', render: (p: (typeof products)[0]) => (
      <span className={`font-bold ${p.compare_at_price ? 'text-[#E8001A]' : 'text-gray-900'}`}>
        {p.base_price.toFixed(2)} ₺
      </span>
    )},
    { label: 'MARKA', render: (p: (typeof products)[0]) => p.brand?.name ?? '—' },
    { label: 'STOK', render: (p: (typeof products)[0]) => (
      <span className={p.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}>
        {p.stock_quantity > 0 ? 'Stokta Var' : 'Tükendi'}
      </span>
    )},
    { label: 'BEDENLER', render: (p: (typeof products)[0]) => (
      p.variants && p.variants.length > 0
        ? p.variants.map((v) => { const opts = typeof v.options === 'string' ? JSON.parse(v.options) : v.options; return opts['Beden'] ?? opts['size']; }).filter(Boolean).join(', ')
        : '—'
    )},
    { label: 'PUAN', render: (p: (typeof products)[0]) => (
      p.average_rating
        ? (
          <div className="flex items-center gap-1">
            <StarIcon className="w-3.5 h-3.5 text-[#E8001A]" />
            <span>{p.average_rating.toFixed(1)}</span>
          </div>
        )
        : '—'
    )},
  ];

  return (
    <div className="bg-[#F8F7F5] min-h-screen">
      <section className="bg-gray-900 text-white py-12">
        <Container>
          <div className="flex items-center justify-between">
            <h1 className="font-display text-4xl font-bold tracking-tight">KARŞILAŞTIRMA</h1>
            <button
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-white underline underline-offset-4 transition-colors"
            >
              Listeyi Temizle
            </button>
          </div>
        </Container>
      </section>

      <Container className="py-12">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* Product headers */}
            <thead>
              <tr>
                <th className="text-left py-4 pr-6 text-[10px] tracking-widest text-gray-400 w-32">
                  ÖZELLİK
                </th>
                {products.map((product) => {
                  const img = product.images?.find((i) => i.is_primary) ?? product.images?.[0];
                  return (
                    <th key={product.id} className="py-4 px-4 text-left align-top">
                      <div className="relative">
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="absolute -top-1 right-0 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                        <Link href={`/products/${product.slug}`}>
                          <div className="relative aspect-[3/4] w-32 bg-gray-50 overflow-hidden mb-3 hover:opacity-90 transition-opacity">
                            {img && (
                              <Image
                                src={img.thumbnail_url ?? img.image_url}
                                alt={product.name}
                                fill
                                sizes="128px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <p className="text-xs font-semibold text-gray-900 hover:underline underline-offset-2 line-clamp-2">
                            {product.name}
                          </p>
                        </Link>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Attributes */}
            <tbody>
              {attributes.map(({ label, render }) => (
                <tr key={label} className="border-t border-gray-100">
                  <td className="py-4 pr-6 text-[10px] tracking-widest text-gray-400 align-middle">
                    {label}
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="py-4 px-4 text-xs text-gray-900 align-middle">
                      {render(product)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Add to cart row */}
              <tr className="border-t border-gray-200">
                <td className="py-6 pr-6" />
                {products.map((product) => (
                  <td key={product.id} className="py-6 px-4">
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock_quantity === 0}
                      className="w-full bg-gray-900 text-white py-3 text-[10px] font-bold tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-40"
                    >
                      SEPETE EKLE
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  );
}
