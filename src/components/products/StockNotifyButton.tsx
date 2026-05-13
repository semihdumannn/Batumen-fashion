'use client';

import { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';

interface Props {
  slug: string;
  variantId?: number;
}

export function StockNotifyButton({ slug, variantId }: Props) {
  const user = useAuthStore((s) => s.user);
  const toast = useToastStore();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState(user?.email ?? '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await api.subscribeStockNotification(slug, email, variantId);
      setIsSubscribed(true);
      setShowForm(false);
      toast.success('Stok geldiğinde e-posta ile bilgilendirileceksiniz.');
    } catch {
      toast.error('Bildirim kaydı yapılamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
        <BellSolidIcon className="w-4 h-4 text-gray-400" />
        <span>Bildirim ayarlandı</span>
      </div>
    );
  }

  if (showForm) {
    return (
      <form onSubmit={handleSubscribe} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresiniz"
          required
          className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-gray-900 text-white px-4 py-2 text-xs font-semibold hover:bg-black transition-colors disabled:opacity-50"
        >
          {isLoading ? '...' : 'BİLDİR'}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="text-xs text-gray-500 hover:text-black transition-colors px-2"
        >
          İptal
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="w-full py-3 border border-gray-300 text-sm font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
    >
      <BellIcon className="w-4 h-4" />
      Stok Gelince Bildir
    </button>
  );
}
