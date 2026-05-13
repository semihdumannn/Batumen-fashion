import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';

export const metadata: Metadata = {
  title: '404 - Sayfa Bulunamadı',
};

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <h1 className="text-8xl font-bold text-gray-100 mb-6">404</h1>
      <h2 className="text-2xl font-bold text-black mb-4">Sayfa Bulunamadı</h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya hiç var olmamış olabilir.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/"
          className="bg-black text-white px-10 py-4 text-sm font-semibold hover:bg-gray-900 transition-colors"
        >
          ANA SAYFAYA DÖN
        </Link>
        <Link
          href="/products"
          className="border border-black px-10 py-4 text-sm font-semibold hover:bg-black hover:text-white transition-colors"
        >
          ÜRÜNLERİ KEŞFET
        </Link>
      </div>
    </Container>
  );
}
