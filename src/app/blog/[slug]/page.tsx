import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogComments } from '@/components/blog/BlogComments';
import { getCachedBlogPost, getCachedBlogPosts } from '@/lib/cache';

export const revalidate = Number(process.env.CACHE_TTL_BLOG_POST ?? 1800);

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCachedBlogPost(slug);
  if (!post) return { title: 'Yazı Bulunamadı' };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.published_at,
      images: post.cover_image ? [{ url: post.cover_image }] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, { data: related }] = await Promise.all([
    getCachedBlogPost(slug),
    getCachedBlogPosts({ per_page: 3 }),
  ]);

  if (!post) notFound();

  const relatedPosts = related.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="bg-gray-900 text-white py-16">
        <Container>
          <Link href="/blog" className="text-[10px] tracking-widest text-gray-600 hover:text-gray-400 transition-colors mb-6 block">
            ← BLOG
          </Link>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span key={tag} className="text-[9px] tracking-widest text-gray-500 border border-gray-200 px-2 py-0.5">
                  {tag.toUpperCase()}
                </span>
              ))}
            </div>
          )}
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl mb-6">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {post.author && <span>{post.author.name}</span>}
            <span>
              {new Date(post.published_at).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            {post.reading_time && <span>{post.reading_time} dk okuma</span>}
          </div>
        </Container>
      </section>

      {/* Cover image */}
      {post.cover_image && (
        <div className="relative aspect-[21/9] overflow-hidden bg-gray-50">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

      {/* Content */}
      <section className="py-16 bg-[#F8F7F5]">
        <Container>
          <div className="max-w-2xl mx-auto">
            <div
              className="prose prose-sm max-w-none text-gray-900 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4 [&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:mb-4 [&_a]:text-[#E8001A] [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
            <BlogComments slug={post.slug} />
          </div>
        </Container>
      </section>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-gray-900">
          <Container>
            <h2 className="font-display text-3xl font-bold text-white mb-10">DİĞER YAZILAR</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
