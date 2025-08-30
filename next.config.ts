import type { NextConfig } from 'next'

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  // Simplified webpack config for better Vercel compatibility
  webpack: (config, { isServer }) => {
    // Only add essential configurations
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
    ],
  },



  // Optimize image handling
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ocnorlktyfswjqgvzrve.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },

  compress: true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/api/leaderboard/stats',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        source: '/api/leaderboard/user/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=120, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ]
  },

  reactStrictMode: false,

  // ❌ removed swcMinify (now default)
  // swcMinify: true, // not needed anymore

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },
}

export default withBundleAnalyzer(nextConfig)