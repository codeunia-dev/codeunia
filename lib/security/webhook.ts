/**
 * Webhook Security Utilities
 * Provides secure webhook signature verification and validation
 */

import crypto from 'crypto';
import { logger } from '@/lib/logging';

export interface WebhookConfig {
  secret: string;
  algorithm?: string;
  tolerance?: number; // Time tolerance in seconds
}

export interface WebhookVerificationResult {
  isValid: boolean;
  error?: string;
  payload?: any;
}

/**
 * Generic webhook signature verification
 */
export class WebhookVerifier {
  private config: Required<WebhookConfig>;

  constructor(config: WebhookConfig) {
    this.config = {
      algorithm: 'sha256',
      tolerance: 300, // 5 minutes default
      ...config
    };
  }

  /**
   * Verify webhook signature using HMAC
   */
  verifySignature(
    payload: string,
    signature: string,
    timestamp?: string
  ): WebhookVerificationResult {
    try {
      // Check if signature is provided
      if (!signature) {
        return {
          isValid: false,
          error: 'Missing signature header'
        };
      }

      // Verify timestamp if provided (prevents replay attacks)
      if (timestamp) {
        const payloadTimestamp = parseInt(timestamp);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        
        if (Math.abs(currentTimestamp - payloadTimestamp) > this.config.tolerance) {
          return {
            isValid: false,
            error: 'Request timestamp too old'
          };
        }
      }

      // Generate expected signature
      const hmac = crypto.createHmac(this.config.algorithm, this.config.secret);
      hmac.update(payload);
      const expectedSignature = hmac.digest('hex');

      // Compare signatures using timing-safe comparison
      const isValid = this.timingSafeEqual(signature, expectedSignature);

      if (!isValid) {
        logger.security.warn('webhook_signature_invalid', 'Invalid webhook signature', {
          algorithm: this.config.algorithm,
          signatureLength: signature.length,
          expectedLength: expectedSignature.length
        });
      }

      return {
        isValid,
        error: isValid ? undefined : 'Invalid signature'
      };
    } catch (error) {
      logger.security.error('webhook_verification_error', 'Webhook verification failed', {}, error as Error);
      return {
        isValid: false,
        error: 'Verification failed'
      };
    }
  }

  /**
   * Verify GitHub webhook signature
   */
  verifyGitHubSignature(payload: string, signature: string): WebhookVerificationResult {
    try {
      if (!signature) {
        return {
          isValid: false,
          error: 'Missing x-hub-signature-256 header'
        };
      }

      // GitHub uses sha256= prefix
      const hmac = crypto.createHmac('sha256', this.config.secret);
      hmac.update(payload);
      const expectedSignature = `sha256=${hmac.digest('hex')}`;

      // Check buffer lengths before comparison
      if (signature.length !== expectedSignature.length) {
        return {
          isValid: false,
          error: 'Signature length mismatch'
        };
      }

      const isValid = this.timingSafeEqual(signature, expectedSignature);

      return {
        isValid,
        error: isValid ? undefined : 'Invalid GitHub signature'
      };
    } catch (error) {
      logger.security.error('github_webhook_verification_error', 'GitHub webhook verification failed', {}, error as Error);
      return {
        isValid: false,
        error: 'GitHub verification failed'
      };
    }
  }

  /**
   * Verify Razorpay webhook signature
   */
  verifyRazorpaySignature(payload: string, signature: string): WebhookVerificationResult {
    try {
      if (!signature) {
        return {
          isValid: false,
          error: 'Missing x-razorpay-signature header'
        };
      }

      const hmac = crypto.createHmac('sha256', this.config.secret);
      hmac.update(payload);
      const expectedSignature = hmac.digest('hex');

      // Check buffer lengths before comparison
      if (signature.length !== expectedSignature.length) {
        return {
          isValid: false,
          error: 'Signature length mismatch'
        };
      }

      const isValid = this.timingSafeEqual(signature, expectedSignature);

      return {
        isValid,
        error: isValid ? undefined : 'Invalid Razorpay signature'
      };
    } catch (error) {
      logger.security.error('razorpay_webhook_verification_error', 'Razorpay webhook verification failed', {}, error as Error);
      return {
        isValid: false,
        error: 'Razorpay verification failed'
      };
    }
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyStripeSignature(
    payload: string,
    signature: string,
    timestamp: string
  ): WebhookVerificationResult {
    try {
      if (!signature) {
        return {
          isValid: false,
          error: 'Missing stripe-signature header'
        };
      }

      // Parse Stripe signature
      const elements = signature.split(',');
      const signatureElements: Record<string, string> = {};
      
      elements.forEach(element => {
        const [key, value] = element.split('=');
        signatureElements[key] = value;
      });

      const receivedTimestamp = signatureElements.t;
      const receivedSignature = signatureElements.v1;

      if (!receivedTimestamp || !receivedSignature) {
        return {
          isValid: false,
          error: 'Invalid signature format'
        };
      }

      // Verify timestamp
      const payloadTimestamp = parseInt(receivedTimestamp);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      
      if (Math.abs(currentTimestamp - payloadTimestamp) > this.config.tolerance) {
        return {
          isValid: false,
          error: 'Request timestamp too old'
        };
      }

      // Generate expected signature
      const signedPayload = `${receivedTimestamp}.${payload}`;
      const hmac = crypto.createHmac('sha256', this.config.secret);
      hmac.update(signedPayload);
      const expectedSignature = hmac.digest('hex');

      const isValid = this.timingSafeEqual(receivedSignature, expectedSignature);

      return {
        isValid,
        error: isValid ? undefined : 'Invalid Stripe signature'
      };
    } catch (error) {
      logger.security.error('stripe_webhook_verification_error', 'Stripe webhook verification failed', {}, error as Error);
      return {
        isValid: false,
        error: 'Stripe verification failed'
      };
    }
  }

  /**
   * Timing-safe string comparison to prevent timing attacks
   */
  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    try {
      return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    } catch (error) {
      // Fallback to simple comparison if timingSafeEqual fails
      return a === b;
    }
  }
}

/**
 * Pre-configured webhook verifiers for common services
 */
export const webhookVerifiers = {
  github: new WebhookVerifier({
    secret: process.env.GITHUB_WEBHOOK_SECRET || '',
    algorithm: 'sha256'
  }),
  
  razorpay: new WebhookVerifier({
    secret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    algorithm: 'sha256'
  }),
  
  stripe: new WebhookVerifier({
    secret: process.env.STRIPE_WEBHOOK_SECRET || '',
    algorithm: 'sha256',
    tolerance: 300
  })
};

/**
 * Middleware for webhook verification
 */
export function withWebhookVerification(
  verifier: WebhookVerifier,
  signatureHeader: string,
  timestampHeader?: string
) {
  return function(handler: (request: Request, payload: any) => Promise<Response>) {
    return async function(request: Request): Promise<Response> {
      try {
        const signature = request.headers.get(signatureHeader);
        const timestamp = timestampHeader ? request.headers.get(timestampHeader) : undefined;
        const payload = await request.text();

        const verification = verifier.verifySignature(payload, signature || '', timestamp || '');
        
        if (!verification.isValid) {
          logger.security.warn('webhook_verification_failed', 'Webhook verification failed', {
            signatureHeader,
            timestampHeader,
            error: verification.error
          });
          
          return new Response(
            JSON.stringify({ error: verification.error }),
            { 
              status: 401, 
              headers: { 'Content-Type': 'application/json' } 
            }
          );
        }

        // Parse payload and call handler
        const parsedPayload = JSON.parse(payload);
        return await handler(request, parsedPayload);
      } catch (error) {
        logger.security.error('webhook_middleware_error', 'Webhook middleware error', {}, error as Error);
        return new Response(
          JSON.stringify({ error: 'Internal server error' }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
    };
  };
}

/**
 * Utility function to validate webhook payload structure
 */
export function validateWebhookPayload(payload: any, requiredFields: string[]): boolean {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  return requiredFields.every(field => {
    return payload.hasOwnProperty(field) && payload[field] !== null && payload[field] !== undefined;
  });
}
