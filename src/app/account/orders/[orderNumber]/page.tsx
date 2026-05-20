'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { TruckIcon, XCircleIcon, DocumentArrowDownIcon, ArrowPathIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/useCartStore';
import { useToastStore } from '@/store/useToastStore';
import { useUIStore } from '@/store/useUIStore';
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

// Sipariş iptali yalnızca pending/processing aşamasında mümkün
const CANCELLABLE_STATUSES = ['pending', 'processing'];

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'] as const;

const CARGO_TRACKING_URLS: Record<string, string> = {
  aras:     'https://kargotakip.araskargo.com.tr/MainPage.aspx?TrackingNo={no}',
  mng:      'https://www.mngkargo.com.tr/go.aspx?ref={no}',
  ptt:      'https://gonderitakip.ptt.gov.tr/Track?q={no}',
  yurtici:  'https://www.yurticikargo.com/tr/online-islemler/gonderi-sorgula?code={no}',
  surat:    'https://www.suratkargo.com.tr/KargoTakip/?TakipNo={no}',
  ups:      'https://www.ups.com/track?tracknum={no}',
  dhl:      'https://www.dhl.com/tr-tr/home/tracking.html?tracking-id={no}',
};

function getCargoTrackingUrl(carrier: string, trackingNumber: string): string | null {
  const key = carrier.toLowerCase().replace(/\s+kargo$/i, '').replace(/\s/g, '');
  const template = CARGO_TRACKING_URLS[key];
  return template ? template.replace('{no}', encodeURIComponent(trackingNumber)) : null;
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [isReordering, setIsReordering] = useState(false);
  const toast = useToastStore();

  useEffect(() => {
    api
      .getOrder(orderNumber)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setIsLoading(false));
  }, [orderNumber]);

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

  const handleReorder = async () => {
    if (!order) return;
    setIsReordering(true);
    let added = 0;
    for (const item of order.items) {
      try {
        await useCartStore.getState().addItem(
          item.product_id ?? 0,
          item.quantity,
          item.variant_id
        );
        added++;
      } catch {
        // silently skip failed items
      }
    }
    setIsReordering(false);
    if (added > 0) {
      toast.success(`${added} ürün sepete eklendi`);
      useUIStore.getState().openCart();
    } else {
      toast.error('Ürünler sepete eklenemedi');
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
  const isPaid = order.payment_status === 'paid';

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
          {(order.status === 'shipped' || order.status === 'delivered') && order.tracking_number && (
            (() => {
              const url = getCargoTrackingUrl(order.carrier_code ?? order.carrier_name ?? '', order.tracking_number);
              return url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1 hover:border-black hover:text-black transition-colors"
                >
                  <TruckIcon className="w-3.5 h-3.5" />
                  Kargo Takip
                  <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                </a>
              ) : (
                <span className="flex items-center gap-1 text-xs text-gray-500 border border-gray-100 px-3 py-1">
                  <TruckIcon className="w-3.5 h-3.5" />
                  {order.carrier_name ?? 'Kargo'}: {order.tracking_number}
                </span>
              );
            })()
          )}
          {isPaid && (
            <a
              href={api.getOrderInvoiceUrl(order.order_number)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1 hover:border-black hover:text-black transition-colors"
            >
              <DocumentArrowDownIcon className="w-3.5 h-3.5" />
              Fatura
            </a>
          )}
          <button
            onClick={handleReorder}
            disabled={isReordering}
            className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1 hover:border-black hover:text-black transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            {isReordering ? 'Ekleniyor...' : 'Tekrar Sipariş Ver'}
          </button>
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
