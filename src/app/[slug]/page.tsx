import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { fetchStaticPage } from '@/lib/staticPages';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchStaticPage(slug);
  if (!page) return { title: 'Sayfa Bulunamadı' };
  return {
    title: page.meta_title ?? page.title,
    description: page.meta_description ?? undefined,
  };
}

export default async function StaticPage({ params }: Props) {
  const { slug } = await params;
  const page = await fetchStaticPage(slug);

  if (!page) notFound();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100 py-12">
        <Container>
          <p className="text-xs text-gray-400 tracking-widest mb-2 uppercase">Bilgi</p>
          <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
        </Container>
      </div>
      <Container className="py-12">
        <div
          className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
        <p className="mt-12 text-xs text-gray-400">
          Son güncelleme: {new Date(page.updated_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </Container>
    </div>
  );
}
