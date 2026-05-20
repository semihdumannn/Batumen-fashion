'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useAuthStore } from '@/store/useAuthStore';

export default function AccountRootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login?redirect=/account/profile');
    }
  }, [isAuthenticated, hasHydrated, router]);

  if (!hasHydrated || !isAuthenticated) {
    return (
      <Container className="py-16 text-center">
        <div className="spinner mx-auto" />
      </Container>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Container className="py-8">
        <AccountLayout>{children}</AccountLayout>
      </Container>
    </div>
  );
}
