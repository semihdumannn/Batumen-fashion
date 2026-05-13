import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://batumen-fashion.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/account/', '/checkout/', '/cart', '/payment/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
