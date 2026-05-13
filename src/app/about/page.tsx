import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description: 'Batumen Fashion hakkında — kim olduğumuz ve ne için durduğumuz.',
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-gray-900 text-white py-20">
        <Container>
          <p className="text-[10px] tracking-[0.35em] text-gray-600 mb-4">HAKKIMIZDA</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight max-w-2xl leading-tight">
            TARZIN ARKASINDAKI HİKAYE.
          </h1>
        </Container>
      </section>

      <section className="py-20 bg-[#F8F7F5]">
        <Container>
          <div className="max-w-2xl space-y-8">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 mb-4">Kim Olduğumuz</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Batumen Fashion, 2020 yılında İstanbul&apos;da kuruldu. Modern erkek giyimde kalite ve estetiği bir araya getirerek yaratılan bu marka, her koleksiyonla yeni bir bakış açısı sunmayı hedefliyor.
              </p>
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 mb-4">Misyonumuz</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Her gün giyilen kıyafetlerin sadece bir örtü değil, bir ifade biçimi olduğuna inanıyoruz. Bu yüzden her parçayı, giyen kişinin kimliğini güçlendirecek şekilde tasarlıyoruz.
              </p>
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 mb-4">Sürdürülebilirlik</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Doğa dostu materyaller ve etik üretim süreçleri, temel değerlerimizin ayrılmaz bir parçasıdır. Gelecek nesillere daha iyi bir dünya bırakmak için çalışıyoruz.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
