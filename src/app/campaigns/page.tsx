import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { getCachedCampaigns } from '@/lib/cache';

export const metadata: Metadata = {
  title: 'Kampanyalar | Batumen Fashion',
  description: 'Batumen Fashion aktif kampanyaları ve indirim fırsatları.',
};

export const revalidate = 600;

export default async function CampaignsPage() {
  const campaigns = await getCachedCampaigns();

  return (
    <>
      <section className="bg-[#E8001A] text-white py-16">
        <Container>
          <p className="text-[10px] tracking-[0.35em] text-red-200 mb-4">FIRSATLAR</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">KAMPANYALAR</h1>
        </Container>
      </section>

      <section className="py-16 bg-[#F8F7F5]">
        <Container>
          {campaigns.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-sm">Şu anda aktif kampanya bulunmuyor.</p>
              <Link href="/sale" className="text-sm text-black underline underline-offset-4 mt-4 inline-block">
                İndirimli Ürünler →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white border border-gray-100 p-6 flex flex-col">
                  <div className="flex-1">
                    <span className="inline-block text-[10px] font-bold tracking-widest bg-[#E8001A] text-white px-3 py-1 mb-4">
                      {campaign.discount_type === 'percent'
                        ? `%${campaign.discount_value} İNDİRİM`
                        : `${campaign.discount_value} ₺ İNDİRİM`}
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">{campaign.title}</h2>
                    {campaign.description && (
                      <p className="text-sm text-gray-500 mb-4">{campaign.description}</p>
                    )}
                  </div>
                  <div className="border-t border-gray-100 pt-4 mt-2 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {new Date(campaign.starts_at).toLocaleDateString('tr-TR')} —{' '}
                      {new Date(campaign.ends_at).toLocaleDateString('tr-TR')}
                    </p>
                    <Link
                      href="/sale"
                      className="text-xs font-semibold text-black hover:text-[#E8001A] transition-colors"
                    >
                      Ürünleri Gör →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
