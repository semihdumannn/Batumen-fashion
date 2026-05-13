'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { PlusIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import type { PaginatedResponse, Ticket } from '@/types';

const STATUS_LABELS: Record<string, string> = {
  open: 'Açık',
  in_progress: 'İşlemde',
  closed: 'Kapalı',
};

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  closed: 'bg-gray-100 text-gray-600',
};

const CATEGORY_LABELS: Record<string, string> = {
  order: 'Sipariş',
  payment: 'Ödeme',
  shipping: 'Kargo',
  return: 'İade',
  product: 'Ürün',
  other: 'Diğer',
};

export default function SupportPage() {
  const { data, isLoading } = useSWR<PaginatedResponse<Ticket>>(
    'tickets',
    () => api.getTickets(),
    { revalidateOnFocus: false }
  );

  const tickets = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold tracking-tight">DESTEK TALEPLERİM</h1>
        <Link
          href="/account/support/new"
          className="flex items-center gap-1 text-sm text-black border border-black px-3 py-2 hover:bg-black hover:text-white transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Yeni Talep
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 skeleton" />)}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-gray-500 mb-4">Henüz destek talebiniz bulunmuyor.</p>
          <Link
            href="/account/support/new"
            className="text-sm text-black underline underline-offset-4"
          >
            İlk talebinizi oluşturun →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/account/support/${ticket.ticket_number}`}
              className="block border border-gray-100 p-4 hover:border-gray-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400 font-mono">#{ticket.ticket_number}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">{CATEGORY_LABELS[ticket.category] ?? ticket.category}</span>
                    {ticket.order_number && (
                      <>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-500">Sipariş #{ticket.order_number}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{ticket.subject}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(ticket.updated_at).toLocaleDateString('tr-TR')} · {ticket.replies.length} yanıt
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 font-medium shrink-0 ${STATUS_COLORS[ticket.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABELS[ticket.status] ?? ticket.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
