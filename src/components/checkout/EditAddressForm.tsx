'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import type { Address } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Adres başlığı gerekli'),
  contact_name: z.string().min(2, 'Ad soyad gerekli'),
  contact_phone: z.string().min(10, 'Geçerli telefon numarası girin'),
  street_address: z.string().min(5, 'Adres gerekli'),
  district: z.string().min(1, 'İlçe gerekli'),
  city: z.string().min(1, 'Şehir gerekli'),
  postal_code: z.string().optional(),
  address_type: z.enum(['billing', 'shipping', 'both']),
  is_default: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  address: Address;
  onSuccess: (address: Address) => void;
  onCancel: () => void;
}

export function EditAddressForm({ address, onSuccess, onCancel }: Props) {
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: address.title,
      contact_name: address.contact_name,
      contact_phone: address.contact_phone,
      street_address: address.street_address,
      district: address.district,
      city: address.city,
      postal_code: address.postal_code ?? '',
      address_type: address.address_type,
      is_default: address.is_default,
    },
  });

  const selectedCity = watch('city');

  useEffect(() => {
    api.getCities().then(setCities).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCity) return;
    api.getDistricts(selectedCity).then(setDistricts).catch(() => setDistricts([]));
  }, [selectedCity, setValue]);

  const onSubmit = async (data: FormData) => {
    const updated = await api.updateAddress(address.id, {
      ...data,
      is_default: data.is_default ?? false,
    });
    onSuccess(updated);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-black mb-1">Adres Başlığı *</label>
        <input
          {...register('title')}
          className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1">Ad Soyad *</label>
        <input
          {...register('contact_name')}
          className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
        {errors.contact_name && <p className="text-xs text-red-500 mt-1">{errors.contact_name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1">Telefon *</label>
        <input
          {...register('contact_phone')}
          type="tel"
          className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
        {errors.contact_phone && <p className="text-xs text-red-500 mt-1">{errors.contact_phone.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1">Açık Adres *</label>
        <textarea
          {...register('street_address')}
          rows={2}
          className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
        {errors.street_address && <p className="text-xs text-red-500 mt-1">{errors.street_address.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1">Şehir *</label>
          {cities.length > 0 ? (
            <select
              {...register('city')}
              className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black bg-white"
            >
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          ) : (
            <input
              {...register('city')}
              className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          )}
          {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">İlçe *</label>
          {districts.length > 0 ? (
            <select
              {...register('district')}
              className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black bg-white"
            >
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          ) : (
            <input
              {...register('district')}
              className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          )}
          {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1">Adres Tipi *</label>
        <select
          {...register('address_type')}
          className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black bg-white"
        >
          <option value="both">Teslimat ve Fatura</option>
          <option value="shipping">Sadece Teslimat</option>
          <option value="billing">Sadece Fatura</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" {...register('is_default')} className="w-4 h-4" />
          Varsayılan adres olarak ayarla
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-black text-white py-3 text-sm font-semibold hover:bg-gray-900 transition-colors disabled:bg-gray-300"
        >
          {isSubmitting ? 'KAYDEDİLİYOR...' : 'GÜNCELLE'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-200 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          İPTAL
        </button>
      </div>
    </form>
  );
}
