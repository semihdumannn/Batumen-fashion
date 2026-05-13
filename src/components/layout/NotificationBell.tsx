'use client';

import Link from 'next/link';
import { BellIcon } from '@heroicons/react/24/outline';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import type { PaginatedResponse, Notification } from '@/types';

export function NotificationBell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data } = useSWR<PaginatedResponse<Notification>>(
    isAuthenticated ? 'notifications-unread' : null,
    () => api.getNotifications({ unread_only: true, per_page: 1 }),
    { refreshInterval: 60000, revalidateOnFocus: true, shouldRetryOnError: false }
  );

  const unreadCount = data?.meta?.total ?? 0;

  if (!isAuthenticated) return null;

  return (
    <Link
      href="/account/notifications"
      className="p-2 text-gray-600 hover:text-black transition-colors relative"
      aria-label="Bildirimler"
    >
      <BellIcon className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-0.5 right-0.5 bg-[#E8001A] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
