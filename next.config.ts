import type { NextConfig } from 'next'

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  // Optimize webpack cache performance
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Optimize webpack cache to reduce serialization warnings
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

      // Optimize for better performance
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, './'),
      }

      // Reduce string serialization by optimizing module resolution
      config.infrastructureLogging = {
        level: 'error',
        debug: false,
      }
    }

    // Production optimizations for better performance
    if (!dev && !isServer) {
      // Enable tree shaking for better bundle optimization
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      }

      // Split chunks for better caching
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

  // Optimize build performance
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
    // Fix for React 19 hydration issues
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    // Performance optimizations
    optimizeServerReact: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Optimize bundle size
  bundlePagesRouterDependencies: true,

  // Optimize image handling
  images: {
    domains: [
      'ocnorlktyfswjqgvzrve.supabase.co',
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Performance optimizations
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Reduce bundle size
  compress: true,
  
  // Optimize static generation
  generateEtags: false,
  
  // Reduce memory usage
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Performance optimizations
  poweredByHeader: false,
  
  // Enable HTTP/2 Server Push
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Fix for React 19 hydration issues
  reactStrictMode: false,
  
  // Optimize for better performance
  swcMinify: true,
  
  // Fix for params error
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
}

export default withBundleAnalyzer(nextConfig)
