import { NextRequest } from 'next/server';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// In-memory store for rate limiting (in production, use Redis)
class RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.store.entries()) {
        if (value.resetTime < now) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  get(key: string): { count: number; resetTime: number } | undefined {
    return this.store.get(key);
  }

  set(key: string, value: { count: number; resetTime: number }): void {
    this.store.set(key, value);
  }

  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || existing.resetTime < now) {
      // Create new window
      const newEntry = { count: 1, resetTime: now + windowMs };
      this.store.set(key, newEntry);
      return newEntry;
    } else {
      // Increment existing window
      existing.count++;
      return existing;
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Global rate limit store
const rateLimitStore = new RateLimitStore();

/**
 * Rate limiting middleware
 */
export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request is within rate limit
   */
  check(request: NextRequest): RateLimitResult {
    const key = this.getKey(request);
    const { count, resetTime } = rateLimitStore.increment(key, this.config.windowMs);

    const limit = this.config.maxRequests;
    const remaining = Math.max(0, limit - count);
    const success = count <= limit;

    return {
      success,
      limit,
      remaining,
      resetTime,
      retryAfter: success ? undefined : Math.ceil((resetTime - Date.now()) / 1000)
    };
  }

  /**
   * Get rate limit key for request
   */
  private getKey(request: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(request);
    }

    // Default key generation
    const ip = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    const path = request.nextUrl.pathname;

    return `${ip}:${path}:${this.hashUserAgent(userAgent)}`;
  }

  /**
   * Extract client IP from request
   */
  private getClientIP(request: NextRequest): string {
    // Check various headers for real IP
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');

    if (cfConnectingIP) return cfConnectingIP;
    if (realIP) return realIP;
    if (forwarded) return forwarded.split(',')[0].trim();

    // Fallback to connection IP (NextRequest doesn't have ip property)
    return 'unknown';
  }

  /**
   * Hash user agent for consistent key generation
   */
  private hashUserAgent(userAgent: string): string {
    let hash = 0;
    for (let i = 0; i < userAgent.length; i++) {
      const char = userAgent.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitConfigs = {
  // Strict rate limiting for auth endpoints
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    keyGenerator: (request: NextRequest) => {
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      return `auth:${ip}`;
    }
  },

  // Moderate rate limiting for API endpoints
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    keyGenerator: (request: NextRequest) => {
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      const path = request.nextUrl.pathname;
      return `api:${ip}:${path}`;
    }
  },

  // Lenient rate limiting for public endpoints
  PUBLIC: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000, // 1000 requests per 15 minutes
    keyGenerator: (request: NextRequest) => {
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      return `public:${ip}`;
    }
  },

  // Very strict rate limiting for sensitive operations
  SENSITIVE: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 attempts per hour
    keyGenerator: (request: NextRequest) => {
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      return `sensitive:${ip}`;
    }
  },

  // Rate limiting for file uploads
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 uploads per hour
    keyGenerator: (request: NextRequest) => {
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      return `upload:${ip}`;
    }
  }
};

/**
 * Rate limiting middleware for API routes
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (request: NextRequest) => Promise<Response>
) {
  const rateLimiter = new RateLimiter(config);

  return async (request: NextRequest): Promise<Response> => {
    const result = rateLimiter.check(request);

    // Add rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', result.limit.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

    if (!result.success) {
      headers.set('Retry-After', result.retryAfter?.toString() || '60');
      
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: result.retryAfter
        }),
        {
          status: 429,
          headers: {
            ...Object.fromEntries(headers.entries()),
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Call the actual handler
    const response = await handler(request);

    // Add rate limit headers to successful response
    for (const [key, value] of headers.entries()) {
      response.headers.set(key, value);
    }

    return response;
  };
}

/**
 * Rate limiting for specific endpoints
 */
export const rateLimiters = {
  auth: new RateLimiter(RateLimitConfigs.AUTH),
  api: new RateLimiter(RateLimitConfigs.API),
  public: new RateLimiter(RateLimitConfigs.PUBLIC),
  sensitive: new RateLimiter(RateLimitConfigs.SENSITIVE),
  upload: new RateLimiter(RateLimitConfigs.UPLOAD)
};

/**
 * Check rate limit for a specific request
 */
export function checkRateLimit(
  request: NextRequest,
  type: keyof typeof rateLimiters
): RateLimitResult {
  return rateLimiters[type].check(request);
}

/**
 * Create rate limit response
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

  if (!result.success && result.retryAfter) {
    headers.set('Retry-After', result.retryAfter.toString());
  }

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: result.retryAfter
    }),
    {
      status: 429,
      headers: {
        ...Object.fromEntries(headers.entries()),
        'Content-Type': 'application/json'
      }
    }
  );
}
