'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Container } from '@/components/layout/Container';
import { useAuthStore } from '@/store/useAuthStore';

const schema = z
  .object({
    name: z.string().min(2, 'Ad en az 2 karakter olmalı'),
    email: z.string().email('Geçerli e-posta girin'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Şifreler eşleşmiyor',
    path: ['password_confirmation'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: authRegister } = useAuthStore();
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      const result = await authRegister(data);
      // Kayıt sonrası e-posta doğrulama sayfasına yönlendir
      if (result && result.is_email_verified === false) {
        router.push('/verify-email');
      } else {
        router.push('/account/profile');
      }
    } catch {
      setApiError('Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <Container className="py-16">
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8 tracking-tight">KAYIT OL</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Ad Soyad</label>
            <input
              {...register('name')}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">E-posta</label>
            <input
              {...register('email')}
              type="email"
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Telefon <span className="text-gray-400">(İsteğe bağlı)</span>
            </label>
            <input
              {...register('phone')}
              type="tel"
              placeholder="05XX XXX XX XX"
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Şifre</label>
            <input
              {...register('password')}
              type="password"
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Şifre Tekrar</label>
            <input
              {...register('password_confirmation')}
              type="password"
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
            {errors.password_confirmation && (
              <p className="text-xs text-red-500 mt-1">{errors.password_confirmation.message}</p>
            )}
          </div>

          {apiError && <p className="text-sm text-red-500 text-center">{apiError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-4 text-sm font-semibold hover:bg-gray-900 transition-colors disabled:bg-gray-300 tracking-wide"
          >
            {isSubmitting ? 'KAYIT YAPILIYOR...' : 'KAYIT OL'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Zaten hesabın var mı?{' '}
          <Link href="/login" className="text-black font-medium hover:underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </Container>
  );
}
