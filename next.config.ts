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
  output: 'standalone',
  allowedDevOrigins: ['batumen-fashion.test', '*.batumen-fashion.test'],
  images: {
    remotePatterns: buildRemotePatterns(),
  },
  async rewrites() {
    // API_INTERNAL_URL: Docker/server-side (e.g. http://backend:8080)
    // NEXT_PUBLIC_API_URL: fallback for local dev
    const apiBase =
      process.env.API_INTERNAL_URL ??
      process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ??
      '';
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
