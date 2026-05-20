import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { fetchStaticPage } from '@/lib/staticPages';

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchStaticPage('iade-degisim-politikasi');
  return {
    title: page?.meta_title ?? page?.title ?? 'İade ve Değişim Politikası',
    description: page?.meta_description ?? undefined,
  };
}

export default async function ReturnsPolicyPage() {
  const page = await fetchStaticPage('iade-degisim-politikasi');

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100 py-12">
        <Container>
          <h1 className="text-3xl font-bold text-gray-900">
            {page?.title ?? 'İade ve Değişim Politikası'}
          </h1>
        </Container>
      </div>
      <Container className="py-12">
        {page ? (
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <p className="text-gray-500">İçerik yüklenemedi.</p>
        )}
      </Container>
    </div>
  );
}
