'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExclamationTriangleIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

export function EmailVerificationBanner() {
  const user = useAuthStore((s) => s.user);
  const [dismissed, setDismissed] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Doğrulanmışsa veya user yoksa banner gösterme
  if (!user || user.email_verified_at || dismissed) return null;

  const handleResend = async () => {
    setResendStatus('sending');
    try {
      await api.resendVerificationEmail();
      setResendStatus('sent');
    } catch {
      setResendStatus('idle');
    }
  };

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <span className="font-medium">E-posta adresiniz henüz doğrulanmadı.</span>{' '}
              <span className="text-yellow-700">
                {user.email} adresine bir doğrulama e-postası gönderdik.
              </span>
              <div className="flex items-center gap-3 mt-1.5">
                <Link href="/verify-email" className="underline hover:no-underline font-medium">
                  Doğrulama sayfasına git
                </Link>
                {resendStatus === 'sent' ? (
                  <span className="flex items-center gap-1 text-green-700 font-medium">
                    <CheckCircleIcon className="w-4 h-4" />
                    Gönderildi!
                  </span>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resendStatus === 'sending'}
                    className="flex items-center gap-1 underline hover:no-underline disabled:opacity-50"
                  >
                    <ArrowPathIcon className={`w-3.5 h-3.5 ${resendStatus === 'sending' ? 'animate-spin' : ''}`} />
                    Tekrar gönder
                  </button>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-yellow-600 hover:text-yellow-800 shrink-0 p-0.5"
            aria-label="Kapat"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
