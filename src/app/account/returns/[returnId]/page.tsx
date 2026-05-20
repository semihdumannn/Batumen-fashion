'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ReturnRequest } from '@/types';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Beklemede',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
  completed: 'Tamamlandı',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-700',
};

export default function ReturnDetailPage({
  params,
}: {
  params: Promise<{ returnId: string }>;
}) {
  const { returnId } = use(params);
  const [returnReq, setReturnReq] = useState<ReturnRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .getReturn(Number(returnId))
      .then(setReturnReq)
      .catch(() => setReturnReq(null))
      .finally(() => setIsLoading(false));
  }, [returnId]);

  if (isLoading) {
    return (
      <div>
        <div className="h-8 w-48 skeleton mb-4" />
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-20 skeleton" />)}</div>
      </div>
    );
  }

  if (!returnReq) {
    return (
      <div>
        <p className="text-sm text-gray-500">İade talebi bulunamadı.</p>
        <Link href="/account/returns" className="text-sm underline mt-2 inline-block">← İade Taleplerim</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/account/returns" className="text-xs text-gray-500 hover:text-black underline underline-offset-4">
          ← Geri
        </Link>
        <h1 className="text-xl font-bold tracking-tight">İADE TALEBİ #{returnReq.id}</h1>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span className={`text-xs px-3 py-1 font-medium ${STATUS_COLORS[returnReq.status] ?? 'bg-gray-100 text-gray-800'}`}>
          {STATUS_LABELS[returnReq.status] ?? returnReq.status}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(returnReq.created_at).toLocaleDateString('tr-TR')}
        </span>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-100 p-4">
          <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-2">SİPARİŞ</h3>
          <Link href={`/account/orders/${returnReq.order_number}`} className="text-sm text-black hover:underline">
            #{returnReq.order_number}
          </Link>
        </div>

        <div className="border border-gray-100 p-4">
          <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-2">İADE SEBEBİ</h3>
          <p className="text-sm text-gray-700">{returnReq.reason}</p>
          {returnReq.description && (
            <p className="text-sm text-gray-500 mt-2">{returnReq.description}</p>
          )}
        </div>

        {returnReq.items.length > 0 && (
          <div className="border border-gray-100 p-4">
            <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-3">İADE EDİLEN ÜRÜNLER</h3>
            <div className="space-y-2">
              {returnReq.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.product_name ?? `Ürün #${item.order_item_id}`}</span>
                  <span className="text-gray-500">×{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
