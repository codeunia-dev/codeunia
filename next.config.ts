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

  // Minimal webpack config to avoid build issues
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
    
    return config
  },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-progress',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
    ],
    // Performance optimizations
    optimizeServerReact: true,
  },
  // Move serverComponentsExternalPackages to top level
  serverExternalPackages: ['three', '@react-three/fiber', '@react-three/drei'],
  // Move turbo to turbopack
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },



  // Optimize image handling
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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

  async redirects() {
    return [
      { source: '/projects', destination: '/zenith-hall', permanent: true },
      { source: '/projects/:path*', destination: '/zenith-hall', permanent: true },
    ];
  },

  async headers() {
    const isDev = process.env.NODE_ENV === 'development'
    const isProd = process.env.NODE_ENV === 'production'
    const buildId = process.env.BUILD_ID || Date.now().toString()
    
    return [
      // STATIC IMMUTABLE: Static assets (build files, immutable resources)
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=31536000, immutable', // 1 year immutable
          },
          {
            key: 'CDN-Cache-Control',
            value: isProd ? 'public, max-age=31536000, immutable' : 'no-cache',
          },
          {
            key: 'X-Build-ID',
            value: buildId,
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
          {
            key: 'Cache-Tag',
            value: 'static',
          },
        ],
      },
      
      // STATIC IMMUTABLE: Images and media files
      {
        source: '/(images|media|assets)/:path*.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=2592000, immutable', // 30 days immutable
          },
          {
            key: 'CDN-Cache-Control',
            value: isProd ? 'public, max-age=2592000, immutable' : 'no-cache',
          },
          {
            key: 'Cache-Tag',
            value: 'media',
          },
        ],
      },
      
      // DYNAMIC CONTENT: Dynamic pages (events, hackathons, etc.)
      {
        source: '/(hackathons|events|leaderboard|opportunities)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=60, stale-while-revalidate=300', // 1min cache, 5min SWR
          },
          {
            key: 'CDN-Cache-Control',
            value: isProd ? 'public, max-age=60, stale-while-revalidate=300' : 'no-cache',
          },
          {
            key: 'X-Build-ID',
            value: buildId,
          },
          {
            key: 'Cache-Tag',
            value: 'content',
          },
        ],
      },
      
      // DATABASE QUERIES: API routes that query database
      {
        source: '/api/(hackathons|leaderboard|tests|verify-certificate)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=300, stale-while-revalidate=600', // 5min cache, 10min SWR
          },
          {
            key: 'CDN-Cache-Control',
            value: isProd ? 'public, max-age=300, stale-while-revalidate=600' : 'no-cache',
          },
          {
            key: 'Cache-Tag',
            value: 'api',
          },
          {
            key: 'X-Build-ID',
            value: buildId,
          },
        ],
      },
      
      // USER PRIVATE: Auth and user-specific routes
      {
        source: '/(protected|admin|profile|dashboard|auth)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-cache',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
        ],
      },
      
      // API STANDARD: General API routes and public pages
      {
        source: '/((?!_next|protected|admin|profile|dashboard|auth).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=120, stale-while-revalidate=300', // 2min cache, 5min SWR
          },
          {
            key: 'CDN-Cache-Control',
            value: isProd ? 'public, max-age=120, stale-while-revalidate=300' : 'no-cache',
          },
          {
            key: 'Cache-Tag',
            value: 'pages',
          },
          {
            key: 'X-Build-ID',
            value: buildId,
          },
          // Security headers
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ]
  },

  reactStrictMode: false,
  
  // Optimize for production builds
  // swcMinify is now default in Next.js 15
  
  // Enable static optimization
  trailingSlash: false,
  
  // Optimize for faster builds
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },
}

export default withBundleAnalyzer(nextConfig)