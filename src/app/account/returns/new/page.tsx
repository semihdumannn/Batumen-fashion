'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Container } from '@/components/layout/Container';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/useToastStore';
import type { Order, OrderItem } from '@/types';

const schema = z.object({
  order_number: z.string().min(1, 'Sipariş seçin'),
  reason: z.string().min(1, 'Sebep seçin'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const REASONS = [
  'Beden Uyumsuzluğu',
  'Hasar / Kusurlu Ürün',
  'Yanlış Ürün Gönderildi',
  'Ürünü Beğenmedim',
  'Kalite Beklentimi Karşılamadı',
  'Diğer',
];

export default function NewReturnPage() {
  const router = useRouter();
  const toast = useToastStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const selectedOrderNumber = watch('order_number');

  useEffect(() => {
    api.getOrders().then((res) => setOrders(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedOrderNumber) return;
    const order = orders.find((o) => o.order_number === selectedOrderNumber);
    setSelectedOrderItems(order?.items ?? []);
    setSelectedItems([]);
  }, [selectedOrderNumber, orders]);

  const toggleItem = (itemId: number) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const onSubmit = async (data: FormData) => {
    if (selectedItems.length === 0) {
      toast.error('Lütfen en az bir ürün seçin');
      return;
    }
    const items = selectedOrderItems
      .filter((item) => selectedItems.includes(item.id))
      .map((item) => ({ order_item_id: item.id, quantity: item.quantity }));

    try {
      await api.createReturnRequest(data.order_number, { items, reason: data.reason, description: data.description });
      toast.success('İade talebiniz oluşturuldu');
      router.push('/account/returns');
    } catch {
      toast.error('İade talebi oluşturulamadı');
    }
  };

  return (
    <Container>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/account/returns" className="text-xs text-gray-500 hover:text-black underline underline-offset-4">
          ← Geri
        </Link>
        <h1 className="text-xl font-bold tracking-tight">YENİ İADE TALEBİ</h1>
      </div>

      <div className="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Sipariş seçimi */}
          <div>
            <label className="block text-xs font-semibold tracking-widest text-black mb-2">
              SİPARİŞ
            </label>
            <select
              {...register('order_number')}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors bg-white"
            >
              <option value="">Sipariş seçin...</option>
              {orders
                .filter((o) => ['delivered', 'shipped'].includes(o.status))
                .map((order) => (
                  <option key={order.order_number} value={order.order_number}>
                    #{order.order_number} — {new Date(order.created_at).toLocaleDateString('tr-TR')}
                  </option>
                ))}
            </select>
            {errors.order_number && (
              <p className="text-xs text-red-500 mt-1">{errors.order_number.message}</p>
            )}
          </div>

          {/* Ürün seçimi */}
          {selectedOrderItems.length > 0 && (
            <div>
              <label className="block text-xs font-semibold tracking-widest text-black mb-2">
                İADE EDİLECEK ÜRÜNLER
              </label>
              <div className="space-y-2">
                {selectedOrderItems.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                      selectedItems.includes(item.id)
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItem(item.id)}
                      className="accent-black"
                    />
                    <div className="text-xs flex-1">
                      <p className="font-medium text-black">{item.product_name}</p>
                      <p className="text-gray-500">SKU: {item.sku} · ×{item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-black">{item.total_price.toFixed(2)} ₺</p>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Sebep */}
          <div>
            <label className="block text-xs font-semibold tracking-widest text-black mb-2">
              İADE SEBEBİ
            </label>
            <select
              {...register('reason')}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors bg-white"
            >
              <option value="">Sebep seçin...</option>
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {errors.reason && (
              <p className="text-xs text-red-500 mt-1">{errors.reason.message}</p>
            )}
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-xs font-semibold tracking-widest text-black mb-2">
              AÇIKLAMA (İSTEĞE BAĞLI)
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Ek bilgi..."
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-4 text-xs font-bold tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'GÖNDERİLİYOR...' : 'İADE TALEBİ OLUŞTUR'}
          </button>
        </form>
      </div>
    </Container>
  );
}
