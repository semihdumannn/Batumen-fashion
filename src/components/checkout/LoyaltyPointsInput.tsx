'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';

export function LoyaltyPointsInput() {
  const user = useAuthStore((s) => s.user);
  const applyLoyaltyPoints = useCartStore((s) => s.applyLoyaltyPoints);
  const loyaltyDiscount = useCartStore((s) => s.loyaltyDiscount);
  const getTotal = useCartStore((s) => s.getTotal);
  const [pointsInput, setPointsInput] = useState('');
  const [applied, setApplied] = useState(false);

  if (!user?.loyalty_points || user.loyalty_points < 100) return null;

  const availablePoints = user.loyalty_points;
  const maxUsable = Math.min(availablePoints, Math.floor(getTotal()) * 100);

  const handleApply = () => {
    const points = Math.min(Number(pointsInput), maxUsable);
    const validPoints = Math.floor(points / 100) * 100;
    if (validPoints < 100) return;
    applyLoyaltyPoints(validPoints);
    setApplied(true);
  };

  const handleRemove = () => {
    applyLoyaltyPoints(0);
    setApplied(false);
    setPointsInput('');
  };

  if (applied && loyaltyDiscount > 0) {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-[#E8001A]/30">
        <div>
          <p className="text-xs font-bold text-gray-900 tracking-wider">PUAN KULLANILDI</p>
          <p className="text-xs text-[#E8001A] mt-0.5">-{loyaltyDiscount.toFixed(2)} ₺ indirim</p>
        </div>
        <button onClick={handleRemove} className="text-xs text-gray-500 hover:text-white underline underline-offset-4 transition-colors">
          İptal
        </button>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 p-4 bg-gray-50 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold tracking-widest text-gray-900">PUAN KULLAN</p>
        <p className="text-xs text-gray-500">
          {availablePoints.toLocaleString('tr-TR')} puan = {(availablePoints / 100).toFixed(2)} ₺
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          value={pointsInput}
          onChange={(e) => setPointsInput(e.target.value)}
          placeholder={`Max ${maxUsable} puan`}
          min={100}
          max={maxUsable}
          step={100}
          className="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
        />
        <button
          onClick={handleApply}
          disabled={!pointsInput || Number(pointsInput) < 100}
          className="px-4 py-2 bg-[#F8F7F5] text-gray-900 text-xs font-bold tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-40"
        >
          UYGULA
        </button>
      </div>
      <p className="text-[10px] text-gray-600">100 puan = 1 ₺ indirim. 100&#39;ün katları kullanılabilir.</p>
    </div>
  );
}
