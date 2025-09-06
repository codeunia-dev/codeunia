import { NextRequest } from 'next/server';
import { randomBytes, createHmac, timingSafeEqual } from 'crypto';

export interface CSRFConfig {
  secret: string;
  tokenLength?: number;
  cookieName?: string;
  headerName?: string;
  cookieOptions?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    maxAge?: number;
  };
}

export interface CSRFToken {
  token: string;
  expires: number;
}

/**
 * CSRF Protection System
 */
export class CSRFProtection {
  private config: Required<CSRFConfig>;

  constructor(config: CSRFConfig) {
    this.config = {
      tokenLength: 32,
      cookieName: 'csrf-token',
      headerName: 'x-csrf-token',
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 // 24 hours
      },
      ...config
    };
  }

  /**
   * Generate a new CSRF token
   */
  generateToken(): CSRFToken {
    const token = randomBytes(this.config.tokenLength).toString('hex');
    const expires = Date.now() + ((this.config.cookieOptions?.maxAge || 3600) * 1000);
    
    return { token, expires };
  }

  /**
   * Create a signed CSRF token
   */
  createSignedToken(token: string): string {
    const hmac = createHmac('sha256', this.config.secret);
    hmac.update(token);
    const signature = hmac.digest('hex');
    
    return `${token}.${signature}`;
  }

  /**
   * Verify a signed CSRF token
   */
  verifySignedToken(signedToken: string): boolean {
    try {
      const [token, signature] = signedToken.split('.');
      
      if (!token || !signature) {
        return false;
      }

      const hmac = createHmac('sha256', this.config.secret);
      hmac.update(token);
      const expectedSignature = hmac.digest('hex');

      // Use timing-safe comparison to prevent timing attacks
      return timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch {
      return false;
    }
  }

  /**
   * Get CSRF token from request
   */
  async getTokenFromRequest(request: NextRequest): Promise<string | null> {
    // First, try to get from header
    const headerToken = request.headers.get(this.config.headerName);
    if (headerToken) {
      return headerToken;
    }

    // Then, try to get from form data
    const formData = await request.formData?.();
    if (formData) {
      const token = formData.get('_csrf') as string;
      if (token) {
        return token;
      }
    }

    // Finally, try to get from query parameters (less secure)
    const urlToken = request.nextUrl.searchParams.get('_csrf');
    if (urlToken) {
      return urlToken;
    }

    return null;
  }

  /**
   * Get CSRF token from cookies
   */
  getTokenFromCookies(request: NextRequest): string | null {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return null;
    }

    const cookies = this.parseCookies(cookieHeader);
    return cookies[this.config.cookieName] || null;
  }

  /**
   * Parse cookies from cookie header
   */
  private parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });

    return cookies;
  }

  /**
   * Validate CSRF token
   */
  async validateToken(request: NextRequest): Promise<boolean> {
    const providedToken = await this.getTokenFromRequest(request);
    const cookieToken = this.getTokenFromCookies(request);

    if (!providedToken || !cookieToken) {
      return false;
    }

    // Verify the provided token
    if (!this.verifySignedToken(providedToken)) {
      return false;
    }

    // Verify the cookie token
    if (!this.verifySignedToken(cookieToken)) {
      return false;
    }

    // Extract tokens from signed tokens
    const [providedTokenValue] = providedToken.split('.');
    const [cookieTokenValue] = cookieToken.split('.');

    // Tokens must match
    return providedTokenValue === cookieTokenValue;
  }

  /**
   * Create CSRF token cookie
   */
  createTokenCookie(token: string): string {
    const signedToken = this.createSignedToken(token);
    const options = this.config.cookieOptions;
    
    let cookieString = `${this.config.cookieName}=${encodeURIComponent(signedToken)}`;
    
    if (options.maxAge) {
      cookieString += `; Max-Age=${options.maxAge}`;
    }
    
    if ((options as unknown as { path?: string }).path) {
      cookieString += `; Path=${(options as unknown as { path: string }).path}`;
    }
    
    if ((options as unknown as { domain?: string }).domain) {
      cookieString += `; Domain=${(options as unknown as { domain: string }).domain}`;
    }
    
    if (options.secure) {
      cookieString += '; Secure';
    }
    
    if (options.httpOnly) {
      cookieString += '; HttpOnly';
    }
    
    if (options.sameSite) {
      cookieString += `; SameSite=${options.sameSite}`;
    }

    return cookieString;
  }

  /**
   * Create CSRF token response headers
   */
  createTokenHeaders(token: string): Record<string, string> {
    return {
      'Set-Cookie': this.createTokenCookie(token),
      'X-CSRF-Token': this.createSignedToken(token)
    };
  }
}

// Global CSRF protection instance
const csrfProtection = new CSRFProtection({
  secret: process.env.CSRF_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-key'
});

/**
 * CSRF middleware for API routes
 */
export function withCSRF(
  handler: (request: NextRequest) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    // Skip CSRF validation for GET, HEAD, and OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return handler(request);
    }

    // Skip CSRF validation for public API endpoints
    const publicEndpoints = [
      '/api/auth',
      '/api/webhooks',
      '/api/health'
    ];

    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      request.nextUrl.pathname.startsWith(endpoint)
    );

    if (isPublicEndpoint) {
      return handler(request);
    }

    // Validate CSRF token
    if (!csrfProtection.validateToken(request)) {
      return new Response(
        JSON.stringify({
          error: 'CSRF token validation failed',
          message: 'Invalid or missing CSRF token'
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return handler(request);
  };
}

/**
 * Generate CSRF token for forms
 */
export function generateCSRFToken(): string {
  const { token } = csrfProtection.generateToken();
  return csrfProtection.createSignedToken(token);
}

/**
 * Create CSRF token response
 */
export function createCSRFTokenResponse(): Response {
  const { token } = csrfProtection.generateToken();
  const headers = csrfProtection.createTokenHeaders(token);

  return new Response(
    JSON.stringify({ csrfToken: csrfProtection.createSignedToken(token) }),
    {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Validate CSRF token manually
 */
export async function validateCSRFToken(request: NextRequest): Promise<boolean> {
  return await csrfProtection.validateToken(request);
}

/**
 * Get CSRF token from request
 */
export async function getCSRFToken(request: NextRequest): Promise<string | null> {
  return await csrfProtection.getTokenFromRequest(request);
}

/**
 * CSRF token endpoint handler
 */
export async function handleCSRFTokenRequest(): Promise<Response> {
  return createCSRFTokenResponse();
}

/**
 * CSRF protection for form submissions
 */
export function withFormCSRF(
  handler: (request: NextRequest, formData: FormData) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    // Skip CSRF validation for GET requests
    if (request.method === 'GET') {
      return handler(request, new FormData());
    }

    try {
      const formData = await request.formData();
      
      // Validate CSRF token
      if (!csrfProtection.validateToken(request)) {
        return new Response(
          JSON.stringify({
            error: 'CSRF token validation failed',
            message: 'Invalid or missing CSRF token'
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      return handler(request, formData);
    } catch {
      return new Response(
        JSON.stringify({
          error: 'Invalid form data',
          message: 'Failed to parse form data'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  };
}

export default csrfProtection;
