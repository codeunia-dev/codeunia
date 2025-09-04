/**
 * UNIFIED NEXT.JS CACHE CONFIGURATION
 * 
 * This replaces the existing complex header configuration with 
 * a simplified, consistent approach that aligns with our 
 * unified cache system.
 */

import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';
const buildId = process.env.BUILD_ID || process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || Date.now().toString();

const nextConfig: NextConfig = {
  // ... existing config ...
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@headlessui/react', '@heroicons/react'],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  /**
   * UNIFIED CACHE HEADERS
   * 
   * Simplified to match our unified cache strategies:
   * - Static assets: 1 year cache with immutable
   * - Dynamic content: 1-2 min CDN + SWR for fast updates  
   * - API responses: 30-60s CDN + SWR
   * - User-specific: no cache
   */
  async headers() {
    return [
      // === STATIC ASSETS ===
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=31536000, immutable', // 1 year
          },
          {
            key: 'CDN-Cache-Control',
            value: isProd ? 'public, max-age=31536000, immutable' : 'no-cache',
          },
          {
            key: 'Cache-Tag',
            value: 'static',
          },
        ],
      },

      // === STATIC ASSETS (PUBLIC FOLDER) ===
      {
        source: '/(images|media|assets)/:path*.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=2592000, immutable', // 30 days (safe for manually managed assets)
          },
          {
            key: 'CDN-Cache-Control',
            value: isProd ? 'public, max-age=2592000' : 'no-cache',
          },
          {
            key: 'Cache-Tag',
            value: 'static',
          },
        ],
      },

      // === DYNAMIC CONTENT PAGES ===
      {
        source: '/(hackathons|events|blog|leaderboard|tests)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=0, s-maxage=60, stale-while-revalidate=300', // 1min CDN, 5min SWR
          },
          {
            key: 'CDN-Cache-Control',
            value: isProd ? 'public, max-age=60, stale-while-revalidate=300' : 'no-cache',
          },
          {
            key: 'Cache-Tag',
            value: 'pages,content',
          },
          {
            key: 'X-Build-ID',
            value: buildId,
          },
        ],
      },

      // === API ROUTES (STANDARD) ===
      {
        source: '/api/(hackathons|events|leaderboard|tests)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=0, s-maxage=30, stale-while-revalidate=120', // 30s CDN, 2min SWR
          },
          {
            key: 'CDN-Cache-Control',
            value: isProd ? 'public, max-age=30, stale-while-revalidate=120' : 'no-cache',
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

      // === REAL-TIME API ROUTES ===
      {
        source: '/api/(ai|chat)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=0, s-maxage=5, stale-while-revalidate=60', // 5s CDN, 1min SWR
          },
          {
            key: 'CDN-Cache-Control',
            value: isProd ? 'public, max-age=5, stale-while-revalidate=60' : 'no-cache',
          },
          {
            key: 'Cache-Tag',
            value: 'realtime',
          },
        ],
      },

      // === USER-SPECIFIC/AUTHENTICATED ROUTES ===
      {
        source: '/(protected|admin|profile|dashboard)/:path*',
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
            key: 'Cache-Tag',
            value: 'private',
          },
        ],
      },

      // === USER-SPECIFIC API ROUTES ===
      {
        source: '/api/(auth|user|admin|premium|internships)/:path*',
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
            key: 'Cache-Tag',
            value: 'private',
          },
        ],
      },

      // === WEBHOOKS (NO CACHE) ===
      {
        source: '/api/webhooks/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-cache',
          },
        ],
      },

      // === DEFAULT PUBLIC PAGES ===
      {
        source: '/((?!api|_next|protected|admin|profile|dashboard).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=0, s-maxage=120, stale-while-revalidate=600', // 2min CDN, 10min SWR
          },
          {
            key: 'CDN-Cache-Control',
            value: isProd ? 'public, max-age=120, stale-while-revalidate=600' : 'no-cache',
          },
          {
            key: 'Cache-Tag',
            value: 'pages',
          },
          {
            key: 'X-Build-ID',
            value: buildId,
          },
        ],
      },
    ];
  },

  // ... rest of existing config ...
};

export default nextConfig;
