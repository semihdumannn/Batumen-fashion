'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Container } from '@/components/layout/Container';
import { api } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      await api.forgotPassword(data.email);
      setSent(true);
    } catch {
      setApiError('Bu e-posta adresi sistemde kayıtlı değil veya bir hata oluştu.');
    }
  };

  if (sent) {
    return (
      <Container>
        <div className="max-w-md mx-auto py-24 text-center">
          <div className="w-16 h-16 bg-gray-900 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-3">E-posta gönderildi</h1>
          <p className="text-sm text-gray-500 mb-2">
            <strong>{getValues('email')}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
          </p>
          <p className="text-xs text-gray-400 mb-8">
            E-posta birkaç dakika içinde gelecektir. Spam klasörünü de kontrol etmeyi unutmayın.
          </p>
          <Link href="/login" className="text-xs tracking-widest underline underline-offset-4 text-gray-900 hover:opacity-70 transition-opacity">
            GİRİŞ SAYFASINA DÖN
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="max-w-md mx-auto py-24">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Şifremi Unuttum</h1>
        <p className="text-sm text-gray-500 mb-8">
          E-posta adresini gir, sana şifre sıfırlama bağlantısı gönderelim.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold tracking-widest text-gray-900 mb-2">
              E-POSTA
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="w-full px-4 py-3 border border-gray-200 text-sm bg-[#F8F7F5] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0A0A0A] transition-colors"
              placeholder="ornek@email.com"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          {apiError && (
            <p className="text-xs text-red-500">{apiError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-900 text-white py-4 text-xs font-bold tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'GÖNDERİLİYOR...' : 'BAĞLANTI GÖNDER'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/login" className="text-gray-900 underline underline-offset-4 hover:opacity-70 transition-opacity">
            Giriş sayfasına dön
          </Link>
        </p>
      </div>
    </Container>
  );
}
