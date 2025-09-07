/**
 * API Route Wrapper for Security
 * Provides consistent error handling and security measures
 */

import { NextRequest, NextResponse } from 'next/server';
import { ErrorSanitizer } from './error-sanitizer';
import { getCSPConfig } from './csp-config';

export interface APIHandler {
  (request: NextRequest): Promise<Response>;
}

/**
 * Wrap API routes with security measures
 */
export function withSecurity(handler: APIHandler) {
  return async (request: NextRequest): Promise<Response> => {
    const requestId = crypto.randomUUID();
    
    try {
      // Add request ID to headers for tracking
      const response = await handler(request);
      
      // Add security headers
      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      
      // Add CSP header
      const cspConfig = getCSPConfig(request);
      response.headers.set('Content-Security-Policy', cspConfig.policy);
      
      return response;
    } catch (error) {
      return ErrorSanitizer.createErrorResponse(
        error,
        500,
        'api-wrapper-catch',
        requestId
      );
    }
  };
}

/**
 * Wrap API routes with authentication
 */
export function withAuth(handler: APIHandler) {
  return withSecurity(async (request: NextRequest) => {
    // Authentication logic would go here
    // For now, just pass through to the handler
    return handler(request);
  });
}

/**
 * Wrap API routes with rate limiting
 */
export function withRateLimit(handler: APIHandler) {
  return withSecurity(async (request: NextRequest) => {
    // Rate limiting logic would go here
    // For now, just pass through to the handler
    return handler(request);
  });
}

/**
 * Create secure error response
 */
export function createSecureErrorResponse(
  error: Error | unknown,
  statusCode: number = 500,
  context?: string,
  requestId?: string
): Response {
  return ErrorSanitizer.createErrorResponse(error, statusCode, context, requestId);
}

/**
 * Create secure success response
 */
export function createSecureSuccessResponse(
  data: unknown,
  statusCode: number = 200,
  requestId?: string
): Response {
  const response = NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...(requestId && { requestId })
  }, { status: statusCode });
  
  // Add security headers
  response.headers.set('X-Request-ID', requestId || crypto.randomUUID());
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}
