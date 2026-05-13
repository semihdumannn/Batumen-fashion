'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Order } from '@/types';

const statusLabels: Record<string, string> = {
  pending: 'Beklemede',
  processing: 'Hazırlanıyor',
  shipped: 'Kargoda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi',
  refunded: 'İade Edildi',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .getOrders()
      .then((data) => setOrders(data.data ?? []))
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6 tracking-tight">SİPARİŞLERİM</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6 tracking-tight">SİPARİŞLERİM</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm mb-4">Henüz siparişiniz yok.</p>
          <Link
            href="/products"
            className="inline-block bg-black text-white px-8 py-3 text-sm font-semibold hover:bg-gray-900 transition-colors"
          >
            ALIŞVERİŞE BAŞLA
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.order_number}`}
              className="block border border-gray-100 p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-black">#{order.order_number}</span>
                <span
                  className={`text-xs px-2 py-0.5 font-medium ${statusColors[order.status] ?? 'bg-gray-100 text-gray-800'}`}
                >
                  {statusLabels[order.status] ?? order.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(order.created_at).toLocaleDateString('tr-TR')}</span>
                <span className="font-semibold text-black">{order.total.toFixed(2)} ₺</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
