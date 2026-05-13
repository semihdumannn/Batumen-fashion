'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Container } from '@/components/layout/Container';
import { api } from '@/lib/api';
import type { ReturnRequest } from '@/types';

const statusLabels: Record<ReturnRequest['status'], string> = {
  pending: 'Beklemede',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
  completed: 'Tamamlandı',
};

const statusColors: Record<ReturnRequest['status'], string> = {
  pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  approved: 'text-blue-600 bg-blue-50 border-blue-200',
  rejected: 'text-red-600 bg-red-50 border-red-200',
  completed: 'text-green-600 bg-green-50 border-green-200',
};

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getReturns()
      .then((res) => setReturns(res.data))
      .catch(() => setReturns([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold tracking-tight">İADE TALEPLERİM</h1>
        <Link
          href="/account/returns/new"
          className="bg-black text-white px-5 py-2.5 text-xs font-semibold tracking-widest hover:bg-gray-800 transition-colors"
        >
          YENİ İADE TALEBİ
        </Link>
      </div>

      {returns.length === 0 ? (
        <div className="text-center py-16 bg-gray-50">
          <p className="text-sm text-gray-500 mb-4">Henüz iade talebiniz bulunmuyor.</p>
          <Link href="/account/orders" className="text-xs underline underline-offset-4 text-black">
            Siparişlerime git
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {returns.map((item) => (
            <div key={item.id} className="border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-black">
                    Sipariş #{item.order_number}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{item.reason}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.created_at).toLocaleDateString('tr-TR')}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.items.map((i, idx) => (
                      <span key={idx} className="text-[10px] bg-gray-100 px-2 py-0.5 text-gray-600">
                        {i.product_name} ×{i.quantity}
                      </span>
                    ))}
                  </div>
                </div>
                <span className={`text-[10px] font-semibold tracking-wider px-2 py-1 border shrink-0 ${statusColors[item.status]}`}>
                  {statusLabels[item.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
