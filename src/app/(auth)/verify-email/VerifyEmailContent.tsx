'use client';

import { useState } from 'react';
import { EnvelopeIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

export function VerifyEmailContent() {
  const user = useAuthStore((s) => s.user);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResendStatus('sending');
    try {
      await api.resendVerificationEmail();
      setResendStatus('sent');
      // 60 saniye cooldown — spam önleme
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setResendStatus('error');
    }
  };

  return (
    <div className="max-w-md mx-auto text-center">
      {/* İkon */}
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <EnvelopeIcon className="w-10 h-10 text-gray-400" />
      </div>

      <h1 className="text-2xl font-bold text-black mb-3 tracking-tight">
        E-POSTANIZI DOĞRULAYIN
      </h1>

      <p className="text-gray-500 text-sm leading-relaxed mb-2">
        <strong className="text-black">{user?.email ?? 'e-posta adresinize'}</strong> bir doğrulama
        linki gönderdik.
      </p>
      <p className="text-gray-400 text-sm mb-8">
        Gelen kutunuzu (ve spam klasörünüzü) kontrol edin, linke tıklayarak hesabınızı aktif edin.
      </p>

      {/* Adımlar */}
      <div className="text-left bg-gray-50 p-5 mb-8 space-y-3">
        {[
          'Gelen kutunuzu açın',
          '"Batumen Fashion" göndereninden e-postayı bulun',
          '"E-postamı Doğrula" butonuna tıklayın',
          'Hesabınız aktif olur, alışverişe başlayabilirsiniz',
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 bg-black text-white text-xs flex items-center justify-center rounded-full shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="text-sm text-gray-600">{step}</span>
          </div>
        ))}
      </div>

      {/* Yeniden gönder */}
      <div className="space-y-3">
        {resendStatus === 'sent' ? (
          <div className="flex items-center justify-center gap-2 text-green-600 text-sm py-3">
            <CheckCircleIcon className="w-5 h-5" />
            E-posta tekrar gönderildi!
            {cooldown > 0 && <span className="text-gray-400">({cooldown}s)</span>}
          </div>
        ) : (
          <button
            onClick={handleResend}
            disabled={resendStatus === 'sending' || cooldown > 0}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:border-black hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`w-4 h-4 ${resendStatus === 'sending' ? 'animate-spin' : ''}`} />
            {resendStatus === 'sending'
              ? 'Gönderiliyor...'
              : cooldown > 0
              ? `Tekrar gönder (${cooldown}s)`
              : 'Doğrulama E-postasını Tekrar Gönder'}
          </button>
        )}

        {resendStatus === 'error' && (
          <p className="text-xs text-red-500">Gönderilemedi. Lütfen tekrar deneyin.</p>
        )}

        <a
          href="/account/profile"
          className="block text-sm text-gray-400 hover:text-black transition-colors"
        >
          Daha sonra doğrula →
        </a>
      </div>
    </div>
  );
}
