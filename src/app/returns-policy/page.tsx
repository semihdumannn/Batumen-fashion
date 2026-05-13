import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'İade ve Değişim Politikası',
};

export default function ReturnsPolicyPage() {
  return (
    <>
      <section className="bg-gray-900 text-white py-20">
        <Container>
          <p className="text-[10px] tracking-[0.35em] text-gray-600 mb-4">POLİTİKA</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
            İADE & DEĞİŞİM
          </h1>
        </Container>
      </section>

      <section className="py-16 bg-[#F8F7F5]">
        <Container>
          <div className="max-w-2xl space-y-10 text-sm text-gray-600 leading-relaxed">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 mb-4">İade Koşulları</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>Ürünler teslim tarihinden itibaren 14 gün içinde iade edilebilir.</li>
                <li>Ürünlerin kullanılmamış, yıkanmamış ve orijinal ambalajında olması gerekmektedir.</li>
                <li>Üzerindeki etiketler sökülmüş ürünler iade kabul edilmez.</li>
                <li>İç çamaşırı ve mayo kategorisindeki ürünler hijyen nedeniyle iade alınmaz.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 mb-4">İade Süreci</h2>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Hesabınızdan &ldquo;Siparişlerim&rdquo; bölümüne giderek iade talep edin.</li>
                <li>İade onayı e-posta ile size iletilir.</li>
                <li>Ürünü orijinal ambalajında paketleyip belirtilen adrese gönderin.</li>
                <li>Ürün tarafımıza ulaştıktan sonra 3-5 iş günü içinde iade tutarı hesabınıza aktarılır.</li>
              </ol>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 mb-4">Değişim</h2>
              <p>
                Beden değişimi için müşteri hizmetlerimizle iletişime geçin. Stok durumuna göre aynı ürünün farklı bedenini gönderebiliriz. Renk değişimi talepleri yeni sipariş olarak işlenir.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 mb-4">Hasarlı veya Hatalı Ürün</h2>
              <p>
                Hasarlı veya hatalı ürün teslim aldıysanız lütfen teslim tarihinden itibaren 3 gün içinde müşteri hizmetlerimizle iletişime geçin. Ürünün fotoğrafını göndererek hızlı çözüm alabilirsiniz.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
