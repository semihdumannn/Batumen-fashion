'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { TrashIcon, BellSlashIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/useToastStore';
import type { PaginatedResponse, Notification } from '@/types';

export default function NotificationsPage() {
  const toast = useToastStore();
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const { data, mutate, isLoading } = useSWR<PaginatedResponse<Notification>>(
    'notifications',
    () => api.getNotifications({ per_page: 50 }),
    { revalidateOnFocus: true }
  );

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await api.markAllNotificationsRead();
      mutate();
    } catch {
      toast.error('İşlem başarısız');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteNotification(id);
      mutate((prev) => prev ? {
        ...prev,
        data: prev.data.filter((n) => n.id !== id),
      } : prev, false);
    } catch {
      toast.error('Silinemedi');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold tracking-tight">BİLDİRİMLER</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="text-xs text-gray-500 hover:text-black underline underline-offset-4 transition-colors disabled:opacity-50"
          >
            Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 skeleton" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <BellSlashIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Bildirim bulunmuyor.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between gap-3 py-4 ${!n.read_at ? 'bg-blue-50/30' : ''}`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {!n.read_at && (
                  <div className="w-2 h-2 rounded-full bg-[#E8001A] mt-2 shrink-0" />
                )}
                <div className={!n.read_at ? '' : 'ml-5'}>
                  <p className="text-sm font-medium text-gray-800">{n.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(n.id)}
                className="p-1.5 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                aria-label="Sil"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
