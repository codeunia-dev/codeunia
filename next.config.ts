import type { NextConfig } from 'next'

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  // Optimize webpack cache performance
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: require('path').resolve(__dirname, '.next/cache'),
        compression: 'gzip',
        maxAge: 172800000, // 2 days
        store: 'pack',
        version: '1.0.0',
      }

      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, './'),
      }

      config.infrastructureLogging = {
        level: 'error',
        debug: false,
      }
    }

    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      }

      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }

    return config
  },

  experimental: {
    optimizeCss: true,
    cpus: 1,
    optimizePackageImports: [
      '@/lib',
      '@/components',
      '@/hooks',
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-progress',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
    ],
    optimizeServerReact: true,
  },

  // ✅ renamed (was experimental.serverComponentsExternalPackages)
  serverExternalPackages: ['@supabase/supabase-js'],

  // ✅ turbopack moved out of experimental
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Optimize bundle size
  bundlePagesRouterDependencies: true,

  // Optimize image handling
  images: {
    domains: ['ocnorlktyfswjqgvzrve.supabase.co'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
  },

  compress: true,
  generateEtags: false,

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
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