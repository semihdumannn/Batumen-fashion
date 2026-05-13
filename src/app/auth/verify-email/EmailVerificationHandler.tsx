'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

type Status = 'loading' | 'success' | 'already_verified' | 'error' | 'no_url';

export function EmailVerificationHandler() {
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyUrl = params.get('verify_url');

    if (!verifyUrl) {
      setStatus('no_url');
      return;
    }

    api
      .verifyEmailWithUrl(decodeURIComponent(verifyUrl))
      .then((result) => {
        if (result.already_verified) {
          setStatus('already_verified');
        } else {
          setStatus('success');
          fetchUser(); // store'daki user'ı güncelle
        }
      })
      .catch((err: Error) => {
        setErrorMsg(err.message);
        setStatus('error');
      });
  }, [fetchUser]);

  if (status === 'loading') {
    return (
      <div className="max-w-sm mx-auto text-center py-12">
        <div className="spinner mx-auto mb-4" />
        <p className="text-sm text-gray-500">E-postanız doğrulanıyor...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="max-w-sm mx-auto text-center">
        <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-black mb-3 tracking-tight">
          E-POSTA DOĞRULANDI!
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Hesabınız aktif edildi. Artık tüm özelliklere erişebilirsiniz.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/products"
            className="bg-black text-white px-10 py-4 text-sm font-semibold hover:bg-gray-900 transition-colors"
          >
            ALIŞVERİŞE BAŞLA
          </Link>
          <Link
            href="/account/profile"
            className="border border-gray-200 px-10 py-4 text-sm font-medium hover:border-black transition-colors"
          >
            Hesabıma Git
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'already_verified') {
    return (
      <div className="max-w-sm mx-auto text-center">
        <CheckCircleIcon className="w-20 h-20 text-blue-400 mx-auto mb-6" />
        <h1 className="text-xl font-bold text-black mb-3">Zaten Doğrulanmış</h1>
        <p className="text-gray-500 text-sm mb-8">
          E-posta adresiniz daha önce doğrulanmış.
        </p>
        <Link href="/products" className="bg-black text-white px-10 py-4 text-sm font-semibold hover:bg-gray-900 transition-colors">
          Alışverişe Devam Et
        </Link>
      </div>
    );
  }

  if (status === 'no_url') {
    return (
      <div className="max-w-sm mx-auto text-center">
        <XCircleIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h1 className="text-xl font-bold text-black mb-3">Geçersiz Link</h1>
        <p className="text-gray-500 text-sm mb-8">
          Bu sayfa e-postanızdaki link üzerinden açılmalıdır.
        </p>
        <Link href="/verify-email" className="text-sm text-black underline">
          Doğrulama e-postası gönder
        </Link>
      </div>
    );
  }

  // error
  return (
    <div className="max-w-sm mx-auto text-center">
      <XCircleIcon className="w-20 h-20 text-red-400 mx-auto mb-6" />
      <h1 className="text-xl font-bold text-black mb-3">Doğrulama Başarısız</h1>
      <p className="text-gray-500 text-sm mb-2">
        {errorMsg || 'Link geçersiz ya da süresi dolmuş olabilir.'}
      </p>
      <p className="text-xs text-gray-400 mb-8">
        Doğrulama linkleri 60 dakika geçerlidir.
      </p>
      <div className="flex flex-col gap-3">
        <Link
          href="/verify-email"
          className="bg-black text-white px-10 py-4 text-sm font-semibold hover:bg-gray-900 transition-colors"
        >
          Yeni Link İste
        </Link>
        <Link href="/login" className="text-sm text-gray-500 hover:text-black">
          Giriş Yap
        </Link>
      </div>
    </div>
  );
}
