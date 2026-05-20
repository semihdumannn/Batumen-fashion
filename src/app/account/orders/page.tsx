'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBagIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
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
  pending:    'bg-amber-50 text-amber-700 border border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border border-blue-200',
  shipped:    'bg-purple-50 text-purple-700 border border-purple-200',
  delivered:  'bg-green-50 text-green-700 border border-green-200',
  cancelled:  'bg-red-50 text-red-600 border border-red-200',
  refunded:   'bg-gray-100 text-gray-600 border border-gray-200',
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
        <h1 className="text-xl font-bold text-gray-900 mb-6">Siparişlerim</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Siparişlerim</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBagIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm mb-2">Henüz siparişiniz bulunmuyor.</p>
          <p className="text-gray-400 text-xs mb-6">İlk siparişinizi vermek için ürünlere göz atın.</p>
          <Link
            href="/products"
            className="inline-block bg-gray-900 text-white px-8 py-3 text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.order_number}`}
              className="flex items-center justify-between p-5 border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-gray-200 transition-colors">
                  <ShoppingBagIcon className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">#{order.order_number}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('tr-TR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                    {' · '}
                    {order.items?.length ?? 0} ürün
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                  {statusLabels[order.status] ?? order.status}
                </span>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{Number(order.total).toFixed(2)} ₺</p>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
