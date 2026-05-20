'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Container } from '@/components/layout/Container';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/useToastStore';
import { useSiteSettings } from '@/components/layout/SiteSettingsProvider';

const schema = z.object({
  name:     z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
  email:    z.string().email('Geçerli bir e-posta girin'),
  subject:  z.string().min(3, 'Konu en az 3 karakter olmalıdır'),
  category: z.enum(['order', 'product', 'shipping', 'payment', 'return', 'other']).refine(Boolean, {
    message: 'Lütfen bir kategori seçin',
  }),
  message:  z.string().min(10, 'Mesaj en az 10 karakter olmalıdır'),
});

type FormData = z.infer<typeof schema>;

const categoryOptions = [
  { value: 'order',    label: 'Sipariş Hakkında' },
  { value: 'product',  label: 'Ürün Hakkında' },
  { value: 'shipping', label: 'Kargo & Teslimat' },
  { value: 'payment',  label: 'Ödeme' },
  { value: 'return',   label: 'İade / Değişim' },
  { value: 'other',    label: 'Diğer' },
];

export default function ContactPage() {
  const toast = useToastStore();
  const settings = useSiteSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await api.sendContactForm(data);
      toast.success('Mesajınız iletildi, en kısa sürede geri döneceğiz.');
      reset();
      setSent(true);
    } catch {
      toast.error('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors';

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-12">
        <Container>
          <p className="text-xs text-gray-400 tracking-widest mb-2 uppercase">Müşteri Hizmetleri</p>
          <h1 className="text-3xl font-bold text-gray-900">İletişim</h1>
        </Container>
      </div>

      <Container className="py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sol — İletişim Bilgileri */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-bold text-gray-900 mb-5">Bize Ulaşın</h2>
              <div className="space-y-4">
                {settings.contact_email && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">E-POSTA</p>
                    <a href={`mailto:${settings.contact_email}`}
                       className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                      {settings.contact_email}
                    </a>
                  </div>
                )}
                {settings.contact_phone && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">TELEFON</p>
                    <a href={`tel:${settings.contact_phone}`}
                       className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                      {settings.contact_phone}
                    </a>
                  </div>
                )}
                {settings.contact_address && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">ADRES</p>
                    <p className="text-sm text-gray-700">{settings.contact_address}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-1">ÇALIŞMA SAATLERİ</p>
                  <p className="text-sm text-gray-700">Pzt–Cum: 09:00–18:00</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <p className="text-sm font-semibold text-blue-900 mb-1">En geç 1 iş günü</p>
              <p className="text-xs text-blue-700">içinde yanıt veriyoruz.</p>
            </div>
          </div>

          {/* Sağ — Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Mesajınız İletildi!</h3>
                  <p className="text-sm text-gray-500 mb-6">En kısa sürede e-posta ile geri döneceğiz.</p>
                  <button
                    onClick={() => setSent(false)}
                    className="text-sm text-gray-600 underline hover:text-gray-900"
                  >
                    Yeni mesaj gönder
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Mesaj Gönder</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Ad Soyad</label>
                      <input {...register('name')} type="text" placeholder="Adınız Soyadınız" className={inputClass} />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">E-posta</label>
                      <input {...register('email')} type="email" placeholder="email@ornek.com" className={inputClass} />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Kategori</label>
                      <select {...register('category')} className={inputClass}>
                        <option value="">Seçin...</option>
                        {categoryOptions.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Konu</label>
                      <input {...register('subject')} type="text" placeholder="Konunuzu kısaca yazın" className={inputClass} />
                      {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Mesajınız</label>
                    <textarea
                      {...register('message')}
                      rows={6}
                      placeholder="Mesajınızı buraya yazın..."
                      className={`${inputClass} resize-none`}
                    />
                    {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gray-900 text-white py-4 text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Harita */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-xs text-gray-400 tracking-widest uppercase mb-0.5">Mağazamız</p>
            <h2 className="text-sm font-bold text-gray-900">THE BATU MEN FASHION</h2>
          </div>
          <iframe
            src="https://maps.google.com/maps?q=39.6528349,27.884467&hl=tr&z=17&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="420"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mağaza Konumu"
          />
        </div>

      </Container>
    </div>
  );
}
