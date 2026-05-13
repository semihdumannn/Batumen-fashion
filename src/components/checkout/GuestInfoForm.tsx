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
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
        <p className="text-xs text-gray-400">
          Hesabınız var mı?{' '}
          <Link href="/login?redirect=/checkout" className="text-white underline underline-offset-4 hover:no-underline">
            Giriş yapın
          </Link>{' '}
          ve adreslerinizi kolayca seçin.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] tracking-widest text-gray-700 mb-2">AD</label>
            <input
              {...register('first_name')}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
            />
            {errors.first_name && <p className="text-xs text-red-400 mt-1">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className="block text-[10px] tracking-widest text-gray-700 mb-2">SOYAD</label>
            <input
              {...register('last_name')}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
            />
            {errors.last_name && <p className="text-xs text-red-400 mt-1">{errors.last_name.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-[10px] tracking-widest text-gray-700 mb-2">E-POSTA</label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
            placeholder="siparis@email.com"
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-[10px] tracking-widest text-gray-700 mb-2">TELEFON</label>
          <input
            {...register('phone')}
            type="tel"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
            placeholder="05XX XXX XX XX"
          />
          {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-[#F8F7F5] text-gray-900 py-4 text-xs font-bold tracking-widest hover:bg-gray-200 transition-colors"
        >
          DEVAM ET — TESLİMAT ADRESİ
        </button>
      </form>
    </div>
  );
}
