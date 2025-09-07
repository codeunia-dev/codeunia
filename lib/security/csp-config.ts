/**
 * Content Security Policy Configuration
 * Enhanced CSP with nonce support for better security
 */

import { NextRequest } from 'next/server';
import crypto from 'crypto';

export interface CSPConfig {
  nonce: string;
  policy: string;
}

/**
 * Generate a secure nonce for CSP
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Get CSP configuration for the current request
 */
export function getCSPConfig(request: NextRequest): CSPConfig {
  const nonce = generateNonce();
  
  // Enhanced CSP policy without unsafe directives
  const policy = [
    "default-src 'self'",
    "script-src 'self' 'nonce-" + nonce + "' https://vercel.live https://va.vercel-scripts.com",
    "style-src 'self' 'nonce-" + nonce + "' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://*.vercel.app wss://*.supabase.co",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  // Log CSP generation for security monitoring
  console.log(`CSP generated for ${request.url} with nonce: ${nonce.substring(0, 8)}...`);

  return {
    nonce,
    policy
  };
}

/**
 * Apply CSP headers to response
 */
export function applyCSPHeaders(response: Response, cspConfig: CSPConfig): Response {
  response.headers.set('Content-Security-Policy', cspConfig.policy);
  return response;
}

/**
 * Development CSP (more permissive for development)
 */
export function getDevelopmentCSP(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://*.vercel.app wss://*.supabase.co",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ');
}
