'use client';

import { useState } from 'react';
import { GiftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/useToastStore';

interface Props {
  onApplied?: (balanceUsed: number) => void;
}

export function GiftCardInput({ onApplied }: Props) {
  const toast = useToastStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState<{ code: string; balance_used: number } | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const result = await api.applyGiftCard(code.trim().toUpperCase());
      setApplied({ code: code.trim().toUpperCase(), balance_used: result.balance_used });
      toast.success(result.message || 'Hediye kartı uygulandı');
      setCode('');
      onApplied?.(result.balance_used);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Geçersiz hediye kartı');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await api.removeGiftCard();
      setApplied(null);
      toast.info('Hediye kartı kaldırıldı');
    } catch {
      toast.error('Bir hata oluştu');
    }
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between px-3 py-2.5 bg-purple-50 border border-purple-200">
        <div className="flex items-center gap-2">
          <GiftIcon className="w-4 h-4 text-purple-500" />
          <div>
            <p className="text-xs font-bold text-purple-700">{applied.code}</p>
            <p className="text-xs text-purple-600">-{applied.balance_used.toFixed(2)} ₺</p>
          </div>
        </div>
        <button onClick={handleRemove} className="text-purple-400 hover:text-purple-600 transition-colors">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
        <GiftIcon className="w-3.5 h-3.5" />
        Hediye Kartı
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="Kart kodu"
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
    </div>
  );
}
