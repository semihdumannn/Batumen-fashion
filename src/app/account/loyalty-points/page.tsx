'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { LoyaltyBalance, LoyaltyTier, LoyaltyTransaction, PaginatedResponse } from '@/types';

const TIER_COLORS: Record<string, string> = {
  Bronze: 'bg-amber-100 text-amber-800 border-amber-200',
  Silver: 'bg-gray-100 text-gray-700 border-gray-200',
  Gold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Platinum: 'bg-purple-100 text-purple-800 border-purple-200',
};

const TX_TYPE_LABELS: Record<string, string> = {
  earn: 'Kazanım',
  spend: 'Harcama',
  expire: 'Sona Erdi',
  adjust: 'Düzeltme',
};

const TX_TYPE_COLORS: Record<string, string> = {
  earn: 'text-green-600',
  spend: 'text-red-600',
  expire: 'text-gray-400',
  adjust: 'text-blue-600',
};

export default function LoyaltyPointsPage() {
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);

  const { data: balance } = useSWR<LoyaltyBalance>(
    'loyalty-balance',
    () => api.getLoyaltyBalance(),
    { revalidateOnFocus: false }
  );

  const { data: historyData } = useSWR<PaginatedResponse<LoyaltyTransaction>>(
    'loyalty-history',
    () => api.getLoyaltyHistory(20),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    api.getLoyaltyTiers().then(setTiers).catch(() => {});
  }, []);

  const points = balance?.points ?? 0;
  const tier = balance?.tier;
  const nextTier = balance?.next_tier;
  const pointsToNext = balance?.points_to_next_tier;

  const progressPercent = tier && nextTier && pointsToNext
    ? Math.round(((points - tier.min_points) / (nextTier.min_points - tier.min_points)) * 100)
    : 100;

  return (
    <div>
      <h1 className="text-xl font-bold mb-6 tracking-tight">PUAN PROGRAMI</h1>

      {/* Balance card */}
      <div className="bg-black text-white p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Mevcut Puanlarınız</p>
            <p className="text-5xl font-bold">{points.toLocaleString('tr-TR')}</p>
            <p className="text-sm text-gray-400 mt-2">1 puan = 0,01 ₺ değerinde</p>
          </div>
          {tier && (
            <span className={`text-xs font-bold px-3 py-1 border ${TIER_COLORS[tier.name] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
              {tier.name.toUpperCase()}
            </span>
          )}
        </div>

        {/* Progress to next tier */}
        {nextTier && pointsToNext !== undefined && (
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{tier?.name}</span>
              <span>{nextTier.name}: {pointsToNext.toLocaleString('tr-TR')} puan kaldı</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tier Benefits */}
      {tiers.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold tracking-widest mb-4">SEVİYE AVANTAJLARI</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tiers.map((t) => (
              <div
                key={t.id}
                className={`p-4 border ${tier?.id === t.id ? 'border-black bg-gray-50' : 'border-gray-100'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">{t.name}</span>
                  <span className="text-xs text-gray-500">%{t.discount_percent} indirim</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{t.min_points.toLocaleString('tr-TR')} puan{t.max_points ? ` — ${t.max_points.toLocaleString('tr-TR')} puan` : '+'}</p>
                {t.benefits.length > 0 && (
                  <ul className="text-xs text-gray-600 space-y-0.5">
                    {t.benefits.map((b, i) => <li key={i}>• {b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div>
        <h2 className="text-sm font-bold tracking-widest mb-4">PUAN GEÇMİŞİ</h2>
        {historyData?.data && historyData.data.length > 0 ? (
          <div className="border border-gray-100 divide-y divide-gray-100">
            {historyData.data.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {TX_TYPE_LABELS[tx.type] ?? tx.type} · {new Date(tx.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <span className={`text-sm font-bold ${TX_TYPE_COLORS[tx.type] ?? 'text-gray-700'}`}>
                  {tx.type === 'earn' || tx.type === 'adjust' ? '+' : '-'}{Math.abs(tx.points).toLocaleString('tr-TR')} P
                </span>
              </div>
            ))}
          </div>
        ) : historyData !== undefined ? (
          <p className="text-sm text-gray-400 text-center py-8">Henüz puan işlemi bulunmuyor.</p>
        ) : (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 skeleton" />)}
          </div>
        )}
      </div>
    </div>
  );
}
