'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/useAuthStore';

const schema = z.object({
  email: z.string().email('Geçerli e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [apiError, setApiError] = useState('');
  const [redirect, setRedirect] = useState('/account/profile');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('redirect');
    if (r) setRedirect(r);
  }, []);

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace(redirect);
    }
  }, [hasHydrated, isAuthenticated, redirect, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      await login(data.email, data.password);
      router.push(redirect);
    } catch {
      setApiError('E-posta veya şifre hatalı.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-black mb-1">E-posta</label>
        <input
          {...register('email')}
          type="email"
          className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black"
        />
        {errors.email && (
          <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-black">Şifre</label>
          <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-black underline underline-offset-2 transition-colors">
            Şifremi unuttum
          </Link>
        </div>
        <input
          {...register('password')}
          type="password"
          className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black"
        />
        {errors.password && (
          <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      {apiError && <p className="text-sm text-red-500 text-center">{apiError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black text-white py-4 text-sm font-semibold hover:bg-gray-900 transition-colors disabled:bg-gray-300 tracking-wide"
      >
        {isSubmitting ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}
      </button>
    </form>
  );
}
