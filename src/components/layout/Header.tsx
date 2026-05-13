'use client';

import Link from 'next/link';
import {
  ShoppingBagIcon,
  HeartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Container } from './Container';
import { NotificationBell } from './NotificationBell';
import { useSiteSettings } from './SiteSettingsProvider';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';

const megaCategories = [
  { label: 'Tişörtler', href: '/categories/tisortler' },
  { label: 'Gömlekler', href: '/categories/gomlekler' },
  { label: 'Sweatshirt', href: '/categories/sweatshirtler' },
  { label: 'Ceketler', href: '/categories/ceketler' },
  { label: 'Pantolonlar', href: '/categories/pantolonlar' },
  { label: 'Şortlar', href: '/categories/sortlar' },
];

const megaAksesuar = [
  { label: 'Şapkalar', href: '/categories/sapkalar' },
  { label: 'Çantalar', href: '/categories/cantalar' },
  { label: 'Kemerler', href: '/categories/kemerler' },
  { label: 'Saatler', href: '/categories/saatler' },
];

export function Header() {
  const { site_name } = useSiteSettings();
  const brandName = site_name ?? 'BATUMEN';
  const itemCount = useCartStore((s) => s.getItemCount());
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isMobileMenuOpen = useUIStore((s) => s.isMobileMenuOpen);
  const openMobileMenu = useUIStore((s) => s.openMobileMenu);
  const closeMobileMenu = useUIStore((s) => s.closeMobileMenu);
  const openCart = useUIStore((s) => s.openCart);
  const openSearch = useUIStore((s) => s.openSearch);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold tracking-widest text-gray-900"
          >
            {brandName.toUpperCase()}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/products?filter=is_new"
              className="text-sm font-medium text-gray-800 hover:text-black transition-colors tracking-wide"
            >
              YENİ
            </Link>

            {/* GİYİM mega menu */}
            <div className="group relative">
              <Link
                href="/categories/giyim"
                className="text-sm font-medium text-gray-800 hover:text-black transition-colors tracking-wide py-5 flex items-center"
              >
                GİYİM
              </Link>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-52 bg-white border border-gray-200 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 py-3 z-50">
                {megaCategories.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="block px-5 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                  >
                    {cat.label}
                  </Link>
                ))}
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <Link
                    href="/categories/giyim"
                    className="block px-5 py-2 text-sm font-semibold text-[#E8001A] hover:opacity-70 transition-opacity"
                  >
                    Tümünü Gör →
                  </Link>
                </div>
              </div>
            </div>

            {/* AKSESUAR mega menu */}
            <div className="group relative">
              <Link
                href="/categories/aksesuar"
                className="text-sm font-medium text-gray-800 hover:text-black transition-colors tracking-wide py-5 flex items-center"
              >
                AKSESUAR
              </Link>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 bg-white border border-gray-200 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 py-3 z-50">
                {megaAksesuar.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="block px-5 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                  >
                    {cat.label}
                  </Link>
                ))}
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <Link
                    href="/categories/aksesuar"
                    className="block px-5 py-2 text-sm font-semibold text-[#E8001A] hover:opacity-70 transition-opacity"
                  >
                    Tümünü Gör →
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="/sale"
              className="text-sm font-medium text-[#E8001A] hover:opacity-70 transition-opacity tracking-wide"
            >
              İNDİRİM
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={openSearch}
              className="p-2 text-gray-600 hover:text-black transition-colors"
              aria-label="Arama"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

            <Link
              href="/account/wishlist"
              className="p-2 text-gray-600 hover:text-black transition-colors"
              aria-label="Favoriler"
            >
              <HeartIcon className="w-5 h-5" />
            </Link>

            <Link
              href={isAuthenticated ? '/account/profile' : '/login'}
              className="p-2 text-gray-600 hover:text-black transition-colors hidden sm:flex"
              aria-label="Hesabım"
            >
              <UserIcon className="w-5 h-5" />
            </Link>

            <NotificationBell />

            <button
              onClick={openCart}
              className="p-2 text-gray-600 hover:text-black transition-colors relative"
              aria-label="Sepet"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#E8001A] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            <button
              className="md:hidden p-2 text-gray-600 hover:text-black transition-colors"
              onClick={isMobileMenuOpen ? closeMobileMenu : openMobileMenu}
              aria-label="Menü"
            >
              {isMobileMenuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <Container>
            <nav className="py-4 flex flex-col divide-y divide-gray-100">
              {[
                { href: '/products?filter=is_new', label: 'YENİ' },
                { href: '/categories/giyim', label: 'GİYİM' },
                { href: '/categories/aksesuar', label: 'AKSESUAR' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-700 tracking-wide py-3 hover:text-black transition-colors"
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/sale"
                className="text-sm font-medium text-[#E8001A] tracking-wide py-3"
                onClick={closeMobileMenu}
              >
                İNDİRİM
              </Link>
              <Link
                href={isAuthenticated ? '/account/profile' : '/login'}
                className="flex items-center gap-2 text-sm text-gray-600 py-3 mt-1"
                onClick={closeMobileMenu}
              >
                <UserIcon className="w-4 h-4" />
                {isAuthenticated ? 'Hesabım' : 'Giriş Yap'}
              </Link>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
