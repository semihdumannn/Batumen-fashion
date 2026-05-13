'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Suspense } from 'react';
import { Container } from '@/components/layout/Container';
import { api } from '@/lib/api';

const schema = z
  .object({
    password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Şifreler eşleşmiyor',
    path: ['password_confirmation'],
  });

type FormData = z.infer<typeof schema>;

function ResetPasswordForm() {
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await api.resetPassword({ token, email, ...data });
      router.push('/login?reset=success');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Bir hata oluştu. Bağlantı süresi dolmuş olabilir.');
    }
  };

  if (!token || !email) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500 mb-4">Geçersiz veya süresi dolmuş bağlantı.</p>
        <Link href="/forgot-password" className="text-xs tracking-widest underline underline-offset-4">
          YENİ BAĞLANTI İSTE
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold tracking-widest text-gray-900 mb-2">
          YENİ ŞİFRE
        </label>
        <input
          type="password"
          autoComplete="new-password"
          {...register('password')}
          className="w-full px-4 py-3 border border-gray-200 text-sm bg-[#F8F7F5] text-gray-900 focus:outline-none focus:border-[#0A0A0A] transition-colors"
        />
        {errors.password && (
          <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold tracking-widest text-gray-900 mb-2">
          ŞİFRE TEKRAR
        </label>
        <input
          type="password"
          autoComplete="new-password"
          {...register('password_confirmation')}
          className="w-full px-4 py-3 border border-gray-200 text-sm bg-[#F8F7F5] text-gray-900 focus:outline-none focus:border-[#0A0A0A] transition-colors"
        />
        {errors.password_confirmation && (
          <p className="text-xs text-red-500 mt-1">{errors.password_confirmation.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gray-900 text-white py-4 text-xs font-bold tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'KAYDEDİLİYOR...' : 'ŞİFREYİ GÜNCELLE'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Container>
      <div className="max-w-md mx-auto py-24">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Şifre Sıfırla</h1>
        <p className="text-sm text-gray-500 mb-8">Yeni şifreni belirle.</p>
        <Suspense fallback={<div className="spinner mx-auto" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </Container>
  );
}
