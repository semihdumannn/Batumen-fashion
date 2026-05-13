'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

const navItems = [
  { href: '/account/profile', label: 'Profilim' },
  { href: '/account/orders', label: 'Siparişlerim' },
  { href: '/account/addresses', label: 'Adreslerim' },
  { href: '/account/wishlist', label: 'Favorilerim' },
  { href: '/account/loyalty-points', label: 'Puan Programı' },
  { href: '/account/returns', label: 'İade Taleplerim' },
  { href: '/account/notifications', label: 'Bildirimler' },
  { href: '/account/support', label: 'Destek Talepleri' },
];

export function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="md:w-56 shrink-0">
        <div className="mb-4 p-4 bg-gray-50">
          <p className="text-sm font-semibold text-black">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-black text-white font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => logout()}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            Çıkış Yap
          </button>
        </nav>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
