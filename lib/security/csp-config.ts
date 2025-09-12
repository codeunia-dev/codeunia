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
  // Prefer Web Crypto (Edge/Browser)
  const webCrypto = (globalThis as { crypto?: { getRandomValues?: (arr: Uint8Array) => void } }).crypto;
  if (webCrypto?.getRandomValues) {
    const arr = new Uint8Array(16);
    webCrypto.getRandomValues(arr);
    // Base64 encode without Buffer dependency
    let binary = '';
    for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
    // btoa is available in Edge/Browser
    return typeof (globalThis as { btoa?: (str: string) => string }).btoa === 'function' 
      ? (globalThis as { btoa: (str: string) => string }).btoa(binary) 
      : Buffer.from(arr).toString('base64');
  }
  // Node.js fallback
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Get CSP configuration for the current request
 */
export function getCSPConfig(request: NextRequest): CSPConfig {
  const nonce = generateNonce();
  
  // Enhanced CSP policy with Cloudflare Insights support
  const policy = [
    "default-src 'self'",
    "script-src 'self' 'nonce-" + nonce + "' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com https://static.cloudflareinsights.com https://checkout.razorpay.com",
    "style-src 'self' 'nonce-" + nonce + "' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://*.vercel.app wss://*.supabase.co https://api.razorpay.com",
    "frame-src 'self' https://checkout.razorpay.com",
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
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com https://static.cloudflareinsights.com https://checkout.razorpay.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://*.vercel.app wss://*.supabase.co https://api.razorpay.com",
    "frame-src 'self' https://checkout.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ');
}
