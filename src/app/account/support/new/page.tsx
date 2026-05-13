'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/useToastStore';
import type { Order } from '@/types';

const schema = z.object({
  subject: z.string().min(5, 'Konu en az 5 karakter olmalı').max(255),
  body: z.string().min(20, 'Açıklama en az 20 karakter olmalı'),
  category: z.enum(['order', 'payment', 'shipping', 'return', 'product', 'other']),
  order_number: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
});

type FormData = z.infer<typeof schema>;

const CATEGORY_OPTIONS = [
  { value: 'order', label: 'Sipariş' },
  { value: 'payment', label: 'Ödeme' },
  { value: 'shipping', label: 'Kargo' },
  { value: 'return', label: 'İade' },
  { value: 'product', label: 'Ürün' },
  { value: 'other', label: 'Diğer' },
];

export default function NewTicketPage() {
  const router = useRouter();
  const toast = useToastStore();
  const [orders, setOrders] = useState<Order[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'other', priority: 'normal' },
  });

  const category = watch('category');
  const needsOrder = ['order', 'payment', 'shipping', 'return'].includes(category);

  useEffect(() => {
    api.getOrders().then((res) => setOrders(res.data)).catch(() => {});
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const ticket = await api.createTicket({
        subject: data.subject,
        body: data.body,
        category: data.category,
        order_number: data.order_number || undefined,
        priority: data.priority,
      });
      toast.success('Destek talebiniz oluşturuldu');
      router.push(`/account/support/${ticket.ticket_number}`);
    } catch {
      toast.error('Talep oluşturulamadı');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/account/support" className="text-xs text-gray-500 hover:text-black underline underline-offset-4">
          ← Geri
        </Link>
        <h1 className="text-xl font-bold tracking-tight">YENİ DESTEK TALEBİ</h1>
      </div>

      <div className="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold tracking-widest text-black mb-2">KATEGORİ</label>
            <select
              {...register('category')}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black bg-white"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {needsOrder && orders.length > 0 && (
            <div>
              <label className="block text-xs font-semibold tracking-widest text-black mb-2">İLGİLİ SİPARİŞ</label>
              <select
                {...register('order_number')}
                className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black bg-white"
              >
                <option value="">Sipariş seçin (isteğe bağlı)</option>
                {orders.map((o) => (
                  <option key={o.order_number} value={o.order_number}>
                    #{o.order_number} · {new Date(o.created_at).toLocaleDateString('tr-TR')}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold tracking-widest text-black mb-2">KONU</label>
            <input
              {...register('subject')}
              placeholder="Talebinizi kısaca özetleyin"
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black"
            />
            {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest text-black mb-2">AÇIKLAMA</label>
            <textarea
              {...register('body')}
              rows={5}
              placeholder="Sorununuzu detaylıca açıklayın..."
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black resize-none"
            />
            {errors.body && <p className="text-xs text-red-500 mt-1">{errors.body.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest text-black mb-2">ÖNCELİK</label>
            <select
              {...register('priority')}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black bg-white"
            >
              <option value="low">Düşük</option>
              <option value="normal">Normal</option>
              <option value="high">Yüksek</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-4 text-xs font-bold tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'GÖNDERİLİYOR...' : 'TALEP OLUŞTUR'}
          </button>
        </form>
      </div>
    </div>
  );
}
