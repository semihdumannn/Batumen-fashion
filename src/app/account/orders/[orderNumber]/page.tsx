'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TruckIcon, XCircleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import type { Order, ShipmentTracking } from '@/types';

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

// Sipariş iptali yalnızca pending/processing aşamasında mümkün
const CANCELLABLE_STATUSES = ['pending', 'processing'];

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'] as const;

export default function OrderDetailPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<ShipmentTracking | null>(null);
  const [showTracking, setShowTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    api
      .getOrder(params.orderNumber)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setIsLoading(false));
  }, [params.orderNumber]);

  const loadTracking = async () => {
    if (tracking) { setShowTracking(!showTracking); return; }
    try {
      const data = await api.getOrderTracking(params.orderNumber);
      setTracking(data);
      setShowTracking(true);
    } catch {
      // No tracking info yet
    }
  };

  const handleCancel = async () => {
    if (!order || !confirm('Siparişinizi iptal etmek istediğinizden emin misiniz?')) return;
    setIsCancelling(true);
    setCancelError('');
    try {
      const updated = await api.cancelOrder(order.order_number);
      setOrder(updated);
    } catch {
      setCancelError('Sipariş iptal edilemedi. Lütfen müşteri hizmetleri ile iletişime geçin.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="h-8 w-48 skeleton mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 skeleton" />)}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <p className="text-gray-500 text-sm">Sipariş bulunamadı.</p>
        <Link href="/account/orders" className="text-sm text-black underline mt-2 inline-block">
          Siparişlerime Dön
        </Link>
      </div>
    );
  }

  const isCancellable = CANCELLABLE_STATUSES.includes(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';
  const currentStepIndex = STATUS_STEPS.indexOf(order.status as typeof STATUS_STEPS[number]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/account/orders" className="text-sm text-gray-500 hover:text-black">
          ← Siparişlerim
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Sipariş #{order.order_number}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(order.created_at).toLocaleDateString('tr-TR', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-3 py-1 font-medium ${statusColors[order.status] ?? 'bg-gray-100 text-gray-800'}`}>
            {statusLabels[order.status] ?? order.status}
          </span>
          {order.status === 'shipped' && (
            <button
              onClick={loadTracking}
              className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1 hover:border-black hover:text-black transition-colors"
            >
              <TruckIcon className="w-3.5 h-3.5" />
              Kargo Takip
            </button>
          )}
          <a
            href={api.getOrderInvoiceUrl(order.order_number)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1 hover:border-black hover:text-black transition-colors"
          >
            <DocumentArrowDownIcon className="w-3.5 h-3.5" />
            Fatura
          </a>
          {isCancellable && (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-3 py-1 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <XCircleIcon className="w-3.5 h-3.5" />
              {isCancelling ? 'İptal ediliyor...' : 'Siparişi İptal Et'}
            </button>
          )}
        </div>
      </div>

      {cancelError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-sm text-red-600">
          {cancelError}
        </div>
      )}

      {/* Shipment Tracking */}
      {showTracking && tracking && (
        <div className="mb-6 border border-gray-100 p-4">
          <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-3">KARGO TAKİP</h3>
          <p className="text-sm font-medium mb-1">{tracking.carrier} · {tracking.tracking_number}</p>
          <p className="text-xs text-gray-500 mb-4">{tracking.status}</p>
          {tracking.events.length > 0 && (
            <div className="space-y-3">
              {tracking.events.map((event, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="shrink-0">
                    <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5" />
                  </div>
                  <div>
                    <p className="text-gray-700">{event.description}</p>
                    <p className="text-xs text-gray-400">{event.location} · {new Date(event.date).toLocaleString('tr-TR')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Kargo Takip Adımları */}
      {!isCancelled && (
        <div className="mb-8 p-4 bg-gray-50">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200" />
            <div
              className="absolute left-0 top-4 h-0.5 bg-black transition-all"
              style={{
                width: currentStepIndex >= 0
                  ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`
                  : '0%',
              }}
            />
            {STATUS_STEPS.map((step, i) => {
              const isCompleted = currentStepIndex >= i;
              const isCurrent = currentStepIndex === i;
              return (
                <div key={step} className="relative flex flex-col items-center z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                      isCompleted
                        ? 'bg-black border-black text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    } ${isCurrent ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                  >
                    {isCompleted ? (
                      step === 'shipped' ? <TruckIcon className="w-3.5 h-3.5" /> : '✓'
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className={`mt-2 text-xs text-center w-16 ${isCompleted ? 'text-black font-medium' : 'text-gray-400'}`}>
                    {statusLabels[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ürünler */}
      <div className="border border-gray-100 divide-y divide-gray-100 mb-6">
        {order.items.map((item) => (
          <div key={item.id} className="p-4 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-black">{item.product_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                SKU: {item.sku} · Adet: {item.quantity}
              </p>
              {item.variant_options && Object.keys(item.variant_options).length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {Object.entries(item.variant_options).map(([k, v]) => `${k}: ${v}`).join(' / ')}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-black">
                {item.total_price.toFixed(2)} ₺
              </p>
              <p className="text-xs text-gray-400">{item.unit_price.toFixed(2)} ₺ × {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Özet */}
      <div className="bg-gray-50 p-4 space-y-2 text-sm mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Ara Toplam</span>
          <span>{order.subtotal.toFixed(2)} ₺</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>İndirim</span>
            <span>-{order.discount.toFixed(2)} ₺</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">Kargo</span>
          <span className={order.shipping_cost === 0 ? 'text-green-600' : ''}>
            {order.shipping_cost === 0 ? 'Ücretsiz' : `${order.shipping_cost.toFixed(2)} ₺`}
          </span>
        </div>
        <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
          <span>Toplam</span>
          <span>{order.total.toFixed(2)} ₺</span>
        </div>
      </div>

      {/* Teslimat Adresi */}
      {order.shipping_address && (
        <div className="border border-gray-100 p-4">
          <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-2">TESLİMAT ADRESİ</h3>
          <p className="text-sm font-medium text-black">{order.shipping_address.contact_name}</p>
          <p className="text-sm text-gray-600 mt-0.5">{order.shipping_address.street_address}</p>
          <p className="text-sm text-gray-600">
            {order.shipping_address.district} / {order.shipping_address.city}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">{order.shipping_address.contact_phone}</p>
        </div>
      )}
    </div>
  );
}
