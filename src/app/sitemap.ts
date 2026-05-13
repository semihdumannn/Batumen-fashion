import type { MetadataRoute } from 'next';
import { getCachedProducts, getCachedCategories, getCachedBrands, getCachedBlogPosts } from '@/lib/cache';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://batumen-fashion.com';

  const [{ data: products }, categories, brands, { data: posts }] = await Promise.all([
    getCachedProducts({ per_page: 200 }),
    getCachedCategories(),
    getCachedBrands(),
    getCachedBlogPosts({ per_page: 100 }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, priority: 1.0, changeFrequency: 'daily' },
    { url: `${base}/products`, priority: 0.9, changeFrequency: 'hourly' },
    { url: `${base}/sale`, priority: 0.8, changeFrequency: 'daily' },
    { url: `${base}/brands`, priority: 0.6, changeFrequency: 'weekly' },
    { url: `${base}/blog`, priority: 0.6, changeFrequency: 'daily' },
    { url: `${base}/about`, priority: 0.4, changeFrequency: 'monthly' },
    { url: `${base}/contact`, priority: 0.4, changeFrequency: 'monthly' },
    { url: `${base}/faq`, priority: 0.4, changeFrequency: 'monthly' },
    { url: `${base}/returns-policy`, priority: 0.3, changeFrequency: 'monthly' },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    priority: 0.7,
    changeFrequency: 'daily' as const,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/categories/${c.slug}`,
    priority: 0.6,
    changeFrequency: 'daily' as const,
  }));

  const brandRoutes: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${base}/brands/${b.slug}`,
    priority: 0.5,
    changeFrequency: 'weekly' as const,
  }));

  const blogRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    priority: 0.5,
    changeFrequency: 'monthly' as const,
    lastModified: new Date(p.published_at),
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...brandRoutes, ...blogRoutes];
}
