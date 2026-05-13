'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/useCartStore';
import { useToastStore } from '@/store/useToastStore';

export function CouponInput() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const couponCode = useCartStore((s) => s.couponCode);
  const couponDiscount = useCartStore((s) => s.couponDiscount);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const toast = useToastStore();

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const message = await applyCoupon(code.trim().toUpperCase());
      toast.success(message || 'Kupon uygulandı');
      setCode('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Geçersiz kupon kodu');
    } finally {
      setLoading(false);
    }
  };

  if (couponCode) {
    return (
      <div className="flex items-center justify-between px-3 py-2.5 bg-green-50 border border-green-200">
        <div>
          <p className="text-xs font-bold text-green-700">{couponCode}</p>
          <p className="text-xs text-green-600">-{couponDiscount.toFixed(2)} ₺ indirim</p>
        </div>
        <button onClick={async () => { await removeCoupon(); toast.info('Kupon kaldırıldı'); }} className="text-green-400 hover:text-green-600 transition-colors">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
        placeholder="Kupon kodu"
        className="flex-1 px-3 py-2 border border-gray-300 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
      />
      <button
        onClick={handleApply}
        disabled={loading || !code.trim()}
        className="px-4 py-2 border border-gray-300 text-sm text-gray-600 hover:border-black hover:text-black transition-colors disabled:opacity-40"
      >
        {loading ? '...' : 'Uygula'}
      </button>
    </div>
  );
}
