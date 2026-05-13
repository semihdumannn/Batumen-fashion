'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

// ─── Profil Güncelleme ────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  email: z.string().email('Geçerli e-posta girin'),
  phone: z.string().optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

// ─── Şifre Değiştirme ─────────────────────────────────────────────────────────

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Mevcut şifre gerekli'),
    password: z.string().min(8, 'Yeni şifre en az 8 karakter olmalı'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Şifreler eşleşmiyor',
    path: ['password_confirmation'],
  });

type PasswordData = z.infer<typeof passwordSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.fetchUser);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  });

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileData) => {
    setProfileError('');
    setProfileSuccess(false);
    try {
      await api.updateProfile(data);
      await setUser(); // store'u güncelle
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch {
      setProfileError('Güncelleme başarısız. Lütfen tekrar deneyin.');
    }
  };

  const onPasswordSubmit = async (data: PasswordData) => {
    setPasswordError('');
    setPasswordSuccess(false);
    try {
      await api.changePassword(data);
      setPasswordSuccess(true);
      passwordForm.reset();
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch {
      setPasswordError('Mevcut şifre hatalı veya bir sorun oluştu.');
    }
  };

  return (
    <div className="space-y-10 max-w-lg">
      {/* ── Profil Bilgileri ── */}
      <section>
        <h1 className="text-xl font-bold mb-6 tracking-tight">PROFİL BİLGİLERİM</h1>

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Ad Soyad</label>
            <input
              {...profileForm.register('name')}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
            {profileForm.formState.errors.name && (
              <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">E-posta</label>
            <input
              {...profileForm.register('email')}
              type="email"
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
            {profileForm.formState.errors.email && (
              <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Telefon <span className="text-gray-400 font-normal">(isteğe bağlı)</span>
            </label>
            <input
              {...profileForm.register('phone')}
              type="tel"
              placeholder="05XX XXX XX XX"
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Üyelik Tarihi</label>
            <p className="text-sm text-gray-600">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('tr-TR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })
                : '—'}
            </p>
          </div>

          {profileError && <p className="text-sm text-red-500">{profileError}</p>}

          {profileSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircleIcon className="w-4 h-4" />
              Bilgileriniz güncellendi.
            </div>
          )}

          <button
            type="submit"
            disabled={profileForm.formState.isSubmitting}
            className="bg-black text-white px-8 py-3 text-sm font-semibold hover:bg-gray-900 transition-colors disabled:bg-gray-300"
          >
            {profileForm.formState.isSubmitting ? 'KAYDEDİLİYOR...' : 'BİLGİLERİ GÜNCELLE'}
          </button>
        </form>
      </section>

      <hr className="border-gray-100" />

      {/* ── Şifre Değiştir ── */}
      <section>
        <h2 className="text-base font-semibold mb-4 tracking-tight">ŞİFRE DEĞİŞTİR</h2>

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Mevcut Şifre</label>
            <input
              {...passwordForm.register('current_password')}
              type="password"
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
            {passwordForm.formState.errors.current_password && (
              <p className="text-xs text-red-500 mt-1">
                {passwordForm.formState.errors.current_password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Yeni Şifre</label>
            <input
              {...passwordForm.register('password')}
              type="password"
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
            {passwordForm.formState.errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {passwordForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Yeni Şifre Tekrar</label>
            <input
              {...passwordForm.register('password_confirmation')}
              type="password"
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
            {passwordForm.formState.errors.password_confirmation && (
              <p className="text-xs text-red-500 mt-1">
                {passwordForm.formState.errors.password_confirmation.message}
              </p>
            )}
          </div>

          {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}

          {passwordSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircleIcon className="w-4 h-4" />
              Şifreniz başarıyla değiştirildi.
            </div>
          )}

          <button
            type="submit"
            disabled={passwordForm.formState.isSubmitting}
            className="border border-black text-black px-8 py-3 text-sm font-semibold hover:bg-black hover:text-white transition-colors disabled:border-gray-300 disabled:text-gray-300"
          >
            {passwordForm.formState.isSubmitting ? 'DEĞİŞTİRİLİYOR...' : 'ŞİFREYİ DEĞİŞTİR'}
          </button>
        </form>
      </section>
    </div>
  );
}
