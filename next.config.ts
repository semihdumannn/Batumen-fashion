import type { NextConfig } from 'next';

function buildRemotePatterns() {
  const origins = (process.env.IMAGE_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return origins.map((origin) => {
    try {
      const url = new URL(origin);
      return {
        protocol: url.protocol.replace(/:$/, '') as 'http' | 'https',
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
      };
    } catch {
      return null;
    }
  }).filter(Boolean) as { protocol: 'http' | 'https'; hostname: string; port?: string }[];
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ['batumen-fashion.test', '*.batumen-fashion.test'],
  images: {
    remotePatterns: buildRemotePatterns(),
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? '';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
