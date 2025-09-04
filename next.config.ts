import type { NextConfig } from 'next'

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  // Production-grade build ID with deployment tracking
  generateBuildId: async () => {
    // Use environment-specific build IDs for better cache control
    const timestamp = Date.now()
    const gitCommit = process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 
                     process.env.GITHUB_SHA?.substring(0, 7) || 
                     Math.random().toString(36).substring(7)
    const buildId = `${timestamp}-${gitCommit}`
    console.log(`🏗️  Build ID: ${buildId}`)
    return buildId
  },

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
    const isDev = process.env.NODE_ENV === 'development'
    const isProd = process.env.NODE_ENV === 'production'
    const buildId = process.env.BUILD_ID || Date.now().toString()
    
    return [
      // Static assets - aggressive caching with build ID
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, immutable', // 30 days
          },
          {
            key: 'X-Build-ID',
            value: buildId,
          },
        ],
      },
      
      // API routes - smart caching with immediate invalidation
      {
        source: '/api/leaderboard/stats',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, s-maxage=30, max-age=0, must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: isProd ? 'public, s-maxage=30' : 'no-cache',
          },
          {
            key: 'X-Build-ID',
            value: buildId,
          },
        ],
      },
      {
        source: '/api/leaderboard/user/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, s-maxage=15, max-age=0, must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: isProd ? 'public, s-maxage=15' : 'no-cache',
          },
          {
            key: 'X-Build-ID',
            value: buildId,
          },
        ],
      },
      
      // Dynamic content - no client cache, short CDN cache
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, s-maxage=10, max-age=0, must-revalidate',
          },
          {
            key: 'X-Build-ID',
            value: buildId,
          },
        ],
      },
      
      // Pages - immediate updates with smart CDN caching
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, s-maxage=60, max-age=0, must-revalidate',
          },
          {
            key: 'X-Build-ID',
            value: buildId,
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self' https:; font-src 'self' https:; object-src 'none'; media-src 'self'; frame-src 'none';" },
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