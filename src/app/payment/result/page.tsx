'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { Container } from '@/components/layout/Container';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/useCartStore';
import { useGuestStore } from '@/store/useGuestStore';

function PaymentResult() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const clearCart = useCartStore((s) => s.clearCart);
  const clearGuestInfo = useGuestStore((s) => s.clearGuestInfo);

  const [status, setStatus] = useState<'loading' | 'success' | 'failure'>('loading');
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!paymentId) {
      setStatus('failure');
      setMessage('Geçersiz ödeme bağlantısı.');
      return;
    }

    api.getPaymentStatus(Number(paymentId))
      .then((result) => {
        if (result.status === 'success') {
          clearCart();
          clearGuestInfo();
          setOrderNumber(result.order_number);
          setStatus('success');
        } else {
          setMessage(result.message ?? 'Ödeme başarısız.');
          setStatus('failure');
        }
      })
      .catch(() => {
        setMessage('Ödeme doğrulanırken bir hata oluştu.');
        setStatus('failure');
      });
  }, [paymentId, clearCart, clearGuestInfo]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="spinner" style={{ borderTopColor: '#F8F7F5' }} />
        <p className="text-sm text-gray-500">Ödemeniz doğrulanıyor...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center py-24">
        <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-6" />
        <p className="text-[10px] tracking-widest text-gray-600 mb-3">SİPARİŞİNİZ ALINDI</p>
        <h1 className="font-display text-5xl font-bold text-white mb-3">TEŞEKKÜRLER!</h1>
        <p className="text-sm text-gray-500 mb-2">
          Sipariş No: <strong className="text-white">{orderNumber}</strong>
        </p>
        <p className="text-xs text-gray-600 mb-10">Onay e-postası gönderildi.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/account/orders/${orderNumber}`}
            className="bg-[#F8F7F5] text-gray-900 px-10 py-4 text-xs font-bold tracking-widest hover:bg-gray-200 transition-colors"
          >
            SİPARİŞİ GÖRÜNTÜLE
          </Link>
          <Link
            href="/products"
            className="border border-gray-200 text-white px-10 py-4 text-xs font-bold tracking-widest hover:bg-gray-50 transition-colors"
          >
            ALIŞVERİŞE DEVAM ET
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-24">
      <XCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-6" />
      <h1 className="font-display text-4xl font-bold text-white mb-3">ÖDEME BAŞARISIZ</h1>
      <p className="text-sm text-gray-500 mb-10">{message}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/checkout"
          className="bg-[#E8001A] hover:bg-[#C40017] text-white px-10 py-4 text-xs font-bold tracking-widest transition-colors"
        >
          TEKRAR DENE
        </Link>
        <Link
          href="/cart"
          className="border border-gray-200 text-white px-10 py-4 text-xs font-bold tracking-widest hover:bg-gray-50 transition-colors"
        >
          SEPETİ GÖRÜNTÜLE
        </Link>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <div className="bg-gray-900 min-h-screen">
      <Container>
        <Suspense fallback={
          <div className="flex items-center justify-center py-32">
            <div className="spinner" style={{ borderTopColor: '#F8F7F5' }} />
          </div>
        }>
          <PaymentResult />
        </Suspense>
      </Container>
    </div>
  );
}
