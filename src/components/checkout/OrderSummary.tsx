import type { CartItem } from '@/types';

interface Props {
  items: CartItem[];
  total: number;
}

export function OrderSummary({ items, total }: Props) {
  return (
    <div className="bg-gray-50 p-6">
      <h2 className="text-base font-semibold mb-4 tracking-wide">SİPARİŞ ÖZETİ</h2>

      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div className="flex-1 min-w-0 pr-4">
              <span className="text-gray-800 line-clamp-1">{item.product.name}</span>
              <span className="text-gray-500 text-xs"> × {item.quantity}</span>
            </div>
            <span className="font-medium shrink-0">
              {(item.price * item.quantity).toFixed(2)} ₺
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Ara Toplam</span>
          <span>{total.toFixed(2)} ₺</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Kargo</span>
          <span className="text-green-600">Ücretsiz</span>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-base">
        <span>Toplam</span>
        <span>{total.toFixed(2)} ₺</span>
      </div>
    </div>
  );
}
