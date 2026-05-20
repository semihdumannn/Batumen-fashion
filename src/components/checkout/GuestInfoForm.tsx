'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGuestStore } from '@/store/useGuestStore';
import type { GuestInfo } from '@/types';

const schema = z.object({
  first_name: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  last_name: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta girin'),
  phone: z.string().min(10, 'Telefon en az 10 karakter olmalıdır'),
});

interface Props {
  onNext: () => void;
}

export function GuestInfoForm({ onNext }: Props) {
  const setGuestInfo = useGuestStore((s) => s.setGuestInfo);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestInfo>({ resolver: zodResolver(schema) });

  const onSubmit = (data: GuestInfo) => {
    setGuestInfo(data);
    onNext();
  };

  return (
    <div>
      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-sm text-gray-600">
          Hesabınız var mı?{' '}
          <Link href="/login?redirect=/checkout" className="text-blue-600 font-semibold underline underline-offset-4 hover:text-blue-700 hover:no-underline">
            Giriş yapın
          </Link>{' '}
          ve adreslerinizi kolayca seçin.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Ad</label>
            <input
              {...register('first_name')}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
              placeholder="Adınız"
            />
            {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Soyad</label>
            <input
              {...register('last_name')}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
              placeholder="Soyadınız"
            />
            {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">E-posta</label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
            placeholder="siparis@email.com"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Telefon</label>
          <input
            {...register('phone')}
            type="tel"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
            placeholder="05XX XXX XX XX"
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 text-white py-4 text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
        >
          Devam Et — Teslimat Adresi
        </button>
      </form>
    </div>
  );
}
