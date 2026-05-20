'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBagIcon,
  UserIcon,
  MapPinIcon,
  HeartIcon,
  StarIcon,
  ArrowUturnLeftIcon,
  BellIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowRightOnRectangleIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/useAuthStore';

const navItems = [
  { href: '/account/orders',        label: 'Siparişlerim',       icon: ShoppingBagIcon },
  { href: '/account/profile',       label: 'Profilim',           icon: UserIcon },
  { href: '/account/addresses',     label: 'Adreslerim',         icon: MapPinIcon },
  { href: '/account/profile#password', label: 'Şifre Değiştir', icon: LockClosedIcon },
  { href: '/account/loyalty-points',label: 'Puan Programı',      icon: StarIcon },
  { href: '/account/wishlist',      label: 'Favorilerim',        icon: HeartIcon },
  { href: '/account/returns',       label: 'İade Taleplerim',    icon: ArrowUturnLeftIcon },
  { href: '/account/notifications', label: 'Bildirimler',        icon: BellIcon },
  { href: '/account/support',       label: 'Destek',             icon: ChatBubbleLeftEllipsisIcon },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

export function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const initials = user?.name ? getInitials(user.name) : '?';

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* ── Sidebar ── */}
      <aside className="w-full lg:w-64 shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* User Card */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Merhaba,</p>
                <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-5 py-3.5 text-sm border-b border-gray-50 transition-colors ${
                    isActive
                      ? 'bg-gray-50 text-gray-900 font-semibold border-l-2 border-l-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-gray-900' : 'text-gray-400'}`} />
                  {item.label}
                </Link>
              );
            })}

            {/* Logout */}
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 shrink-0 text-red-400" />
              Çıkış Yap
            </button>
          </nav>
        </div>
      </aside>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
