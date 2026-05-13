import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Accordion } from '@/components/ui/Accordion';

export const metadata: Metadata = {
  title: 'Sık Sorulan Sorular',
  description: 'Siparişler, iade, kargo ve ödeme hakkında sık sorulan sorular.',
};

const faqItems = [
  {
    question: 'Siparişim ne zaman kargoya verilir?',
    answer: 'Siparişleriniz ödeme onayından itibaren 1-2 iş günü içinde kargoya verilmektedir. Hafta sonu ve resmi tatil günlerinde kargo işlemi yapılmamaktadır.',
  },
  {
    question: 'Ücretsiz kargo ne zaman geçerli?',
    answer: '500 ₺ ve üzeri tüm siparişlerde kargo ücretsizdir. Bu tutarın altındaki siparişlerde standart kargo ücreti alınmaktadır.',
  },
  {
    question: 'İade ve değişim koşulları nelerdir?',
    answer: 'Ürünleri teslim aldığınız tarihten itibaren 14 gün içinde, kullanılmamış ve orijinal ambalajında iade edebilirsiniz. Beden değişimi için müşteri hizmetlerimizle iletişime geçebilirsiniz.',
  },
  {
    question: 'Ödeme yöntemleri nelerdir?',
    answer: 'Kredi kartı (Visa, Mastercard), banka kartı ve iyzico güvencesiyle güvenli ödeme yapabilirsiniz. Taksit seçenekleri bankaya ve kart tipine göre değişmektedir.',
  },
  {
    question: 'Beden rehberini nasıl kullanabilirim?',
    answer: 'Her ürün sayfasında "Beden Rehberi" butonuna tıklayarak ölçülerinizle en uygun bedeni seçebilirsiniz. Genel olarak normal bedeninizi seçmenizi öneririz.',
  },
  {
    question: 'Siparişimi nasıl takip edebilirim?',
    answer: 'Kargoya verilen siparişleriniz için size kargo takip numarası e-posta ile gönderilir. Aynı zamanda hesabınızın "Siparişlerim" bölümünden de takip edebilirsiniz.',
  },
  {
    question: 'Hesap oluşturmak zorunlu mu?',
    answer: 'Hayır, misafir olarak da alışveriş yapabilirsiniz. Ancak hesap oluşturarak siparişlerinizi takip edebilir, adreslerinizi kaydedebilir ve puan programından yararlanabilirsiniz.',
  },
];

export default function FaqPage() {
  return (
    <>
      <section className="bg-gray-900 text-white py-20">
        <Container>
          <p className="text-[10px] tracking-[0.35em] text-gray-600 mb-4">YARDIM</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">SSS</h1>
        </Container>
      </section>

      <section className="py-16 bg-[#F8F7F5]">
        <Container>
          <div className="max-w-2xl">
            <Accordion items={faqItems} />
          </div>
        </Container>
      </section>
    </>
  );
}
