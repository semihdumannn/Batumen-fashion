'use client';

import { useEffect } from 'react';
import { Container } from '@/components/layout/Container';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-24 text-center">
      <h2 className="text-2xl font-bold text-black mb-4">Bir Hata Oluştu</h2>
      <p className="text-gray-500 mb-8">Üzgünüz, bir şeyler yanlış gitti.</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={reset}
          className="bg-black text-white px-10 py-4 text-sm font-semibold hover:bg-gray-900 transition-colors"
        >
          TEKRAR DENE
        </button>
        <a
          href="/"
          className="border border-black px-10 py-4 text-sm font-semibold hover:bg-black hover:text-white transition-colors"
        >
          ANA SAYFAYA DÖN
        </a>
      </div>
    </Container>
  );
}
