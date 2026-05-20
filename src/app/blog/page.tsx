import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { BlogCard } from '@/components/blog/BlogCard';
import { getCachedBlogPosts, getCachedBlogCategories, getCachedBlogTags } from '@/lib/cache';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Batumen Fashion blog — moda trendleri, stil rehberleri ve koleksiyon hikayeleri.',
};

export const revalidate = 600;

interface Props {
  searchParams: Promise<{ page?: string; tag?: string; category?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const tag = params.tag;
  const category = params.category;

  const [{ data: posts, meta }, categories, tags] = await Promise.all([
    getCachedBlogPosts({ page, per_page: 9, tag, category }),
    getCachedBlogCategories(),
    getCachedBlogTags(),
  ]);

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { page: String(page), tag, category, ...overrides };
    Object.entries(merged).forEach(([k, v]) => { if (v && v !== '1') p.set(k, v); });
    const qs = p.toString();
    return `/blog${qs ? `?${qs}` : ''}`;
  };

  return (
    <>
      <section className="bg-gray-900 text-white py-20">
        <Container>
          <p className="text-[10px] tracking-[0.35em] text-gray-600 mb-4">BATUMEN JOURNAL</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">BLOG</h1>
        </Container>
      </section>

      <section className="py-16 bg-[#F8F7F5]">
        <Container>
          {/* Filters */}
          {(categories.length > 0 || tags.length > 0) && (
            <div className="mb-10 space-y-4">
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <a
                    href={buildUrl({ category: undefined, page: '1' })}
                    className={`text-[10px] tracking-widest px-4 py-2 border transition-colors ${!category ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-700 hover:border-gray-900'}`}
                  >
                    TÜM KATEGORİLER
                  </a>
                  {categories.map((cat: { id: number; slug: string; name: string }) => (
                    <a
                      key={cat.id}
                      href={buildUrl({ category: cat.slug, page: '1' })}
                      className={`text-[10px] tracking-widest px-4 py-2 border transition-colors ${category === cat.slug ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-700 hover:border-gray-900'}`}
                    >
                      {cat.name.toUpperCase()}
                    </a>
                  ))}
                </div>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] text-gray-400 tracking-widest self-center">ETİKET:</span>
                  {tags.map((t: { id: number; slug: string; name: string }) => (
                    <a
                      key={t.id}
                      href={buildUrl({ tag: tag === t.slug ? undefined : t.slug, page: '1' })}
                      className={`text-[10px] tracking-widest px-3 py-1.5 border transition-colors ${tag === t.slug ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-100 text-gray-500 hover:border-gray-400'}`}
                    >
                      #{t.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {posts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-20">Bu filtre için yazı bulunamadı.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 mt-16">
                  {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={buildUrl({ page: String(p) })}
                      className={`w-10 h-10 flex items-center justify-center text-xs font-medium border transition-colors ${
                        p === page
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'border-gray-200 text-gray-900 hover:border-gray-900'
                      }`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </Container>
      </section>
    </>
  );
}
