'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/useToastStore';
import type { Ticket } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  closed: 'bg-gray-100 text-gray-600',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Açık',
  in_progress: 'İşlemde',
  closed: 'Kapalı',
};

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketNumber: string }>;
}) {
  const { ticketNumber } = use(params);
  const toast = useToastStore();
  const [replyBody, setReplyBody] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const { data: ticket, mutate, isLoading } = useSWR<Ticket>(
    `ticket:${ticketNumber}`,
    () => api.getTicket(ticketNumber),
    { revalidateOnFocus: false }
  );

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setIsReplying(true);
    try {
      await api.replyToTicket(ticketNumber, replyBody.trim());
      setReplyBody('');
      toast.success('Yanıtınız gönderildi');
      mutate();
    } catch {
      toast.error('Yanıt gönderilemedi');
    } finally {
      setIsReplying(false);
    }
  };

  const handleClose = async () => {
    if (!confirm('Bu talebi kapatmak istediğinizden emin misiniz?')) return;
    try {
      await api.closeTicket(ticketNumber);
      toast.success('Talep kapatıldı');
      mutate();
    } catch {
      toast.error('Talep kapatılamadı');
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="h-8 w-48 skeleton mb-4" />
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 skeleton" />)}</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div>
        <p className="text-sm text-gray-500">Talep bulunamadı.</p>
        <Link href="/account/support" className="text-sm underline mt-2 inline-block">← Geri</Link>
      </div>
    );
  }

  const isClosed = ticket.status === 'closed';

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/account/support" className="text-xs text-gray-500 hover:text-black underline underline-offset-4">
          ← Geri
        </Link>
        <h1 className="text-xl font-bold tracking-tight">TALEP #{ticket.ticket_number}</h1>
      </div>

      {/* Ticket header */}
      <div className="border border-gray-100 p-4 mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-gray-900">{ticket.subject}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(ticket.created_at).toLocaleString('tr-TR')}
              {ticket.order_number && ` · Sipariş #${ticket.order_number}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 font-medium ${STATUS_COLORS[ticket.status]}`}>
              {STATUS_LABELS[ticket.status] ?? ticket.status}
            </span>
            {!isClosed && (
              <button
                onClick={handleClose}
                className="text-xs text-gray-400 hover:text-black underline underline-offset-4"
              >
                Kapat
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3 whitespace-pre-line">{ticket.body}</p>
      </div>

      {/* Replies */}
      {ticket.replies.length > 0 && (
        <div className="space-y-3 mb-6">
          {ticket.replies.map((reply) => (
            <div
              key={reply.id}
              className={`p-4 border ${reply.is_admin ? 'border-blue-100 bg-blue-50/30' : 'border-gray-100'}`}
            >
              <p className="text-xs font-semibold text-gray-500 mb-2">
                {reply.is_admin ? 'Batumen Destek' : 'Siz'} ·{' '}
                {new Date(reply.created_at).toLocaleString('tr-TR')}
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{reply.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply form */}
      {!isClosed && (
        <form onSubmit={handleReply} className="space-y-3">
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            rows={4}
            placeholder="Yanıtınızı yazın..."
            className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"
          />
          <button
            type="submit"
            disabled={isReplying || !replyBody.trim()}
            className="bg-black text-white px-6 py-3 text-xs font-bold tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isReplying ? 'GÖNDERİLİYOR...' : 'YANITLA'}
          </button>
        </form>
      )}

      {isClosed && (
        <p className="text-sm text-gray-400 text-center py-4 border border-gray-100">
          Bu talep kapatılmıştır.
        </p>
      )}
    </div>
  );
}
