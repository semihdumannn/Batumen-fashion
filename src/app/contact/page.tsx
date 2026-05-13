'use client';

import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';

// Client component olduğu için metadata export etmek yerine head'e ekleyebiliriz
// ama Next.js'te metadata server component'te olmalı — formu ayrı bir component'e çıkarıyoruz

export default function ContactPage() {
  return (
    <>
      <section className="bg-gray-900 text-white py-20">
        <Container>
          <p className="text-[10px] tracking-[0.35em] text-gray-600 mb-4">MÜŞTERİ HİZMETLERİ</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">İLETİŞİM</h1>
        </Container>
      </section>

      <section className="py-16 bg-[#F8F7F5]">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Contact info */}
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 mb-4">
                  BİZE ULAŞIN
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Sorularınız veya önerileriniz için aşağıdaki kanallardan bize ulaşabilirsiniz. En geç 1 iş günü içinde geri dönüş sağlıyoruz.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'E-POSTA', value: 'destek@batumen.com.tr' },
                  { label: 'TELEFON', value: '+90 212 000 00 00' },
                  { label: 'ADRES', value: 'Levent, İstanbul, Türkiye' },
                  { label: 'ÇALIŞMA SAATLERİ', value: 'Pzt–Cum: 09:00–18:00' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] tracking-widest text-gray-400 mb-1">{label}</p>
                    <p className="text-sm text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact form */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-widest text-gray-900 mb-2">AD</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 text-sm bg-transparent focus:outline-none focus:border-[#0A0A0A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest text-gray-900 mb-2">SOYAD</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 text-sm bg-transparent focus:outline-none focus:border-[#0A0A0A] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] tracking-widest text-gray-900 mb-2">E-POSTA</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-200 text-sm bg-transparent focus:outline-none focus:border-[#0A0A0A] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-widest text-gray-900 mb-2">KONU</label>
                <select className="w-full px-4 py-3 border border-gray-200 text-sm bg-[#F8F7F5] focus:outline-none focus:border-[#0A0A0A] transition-colors">
                  <option value="">Seçin...</option>
                  <option value="order">Sipariş Hakkında</option>
                  <option value="return">İade / Değişim</option>
                  <option value="product">Ürün Hakkında</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] tracking-widest text-gray-900 mb-2">MESAJ</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 text-sm bg-transparent focus:outline-none focus:border-[#0A0A0A] transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gray-900 text-white py-4 text-xs font-bold tracking-widest hover:bg-gray-800 transition-colors"
              >
                GÖNDER
              </button>
            </form>
          </div>
        </Container>
      </section>
    </>
  );
}
