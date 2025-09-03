import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email format');
export const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

export const idSchema = z.string().uuid('Invalid ID format');
export const numericIdSchema = z.string().regex(/^\d+$/, 'Must be a numeric ID');

// Sanitization functions
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .substring(0, 1000); // Limit length
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizeUsername(username: string): string {
  return username.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, '');
}

// Rate limiting utilities
export class RateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number }>();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    attempt.count++;
    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// CSRF protection
export function generateCSRFToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for Node.js environments without crypto.randomUUID
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function validateCSRFToken(token: string, expectedToken: string): boolean {
  return token === expectedToken;
}

// SQL injection prevention
export function isSQLInjectionSafe(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
    /(--|\/\*|\*\/|;)/,
    /(\b(WAITFOR|DELAY|SLEEP)\b)/i,
  ];

  return !sqlPatterns.some(pattern => pattern.test(input));
}

// XSS prevention
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Input validation middleware
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation failed' };
    }
    return { success: false, error: 'Invalid input' };
  }
}

// Common API validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const searchSchema = z.object({
  search: z.string().max(100).optional(),
  sort: z.enum(['asc', 'desc']).default('desc'),
  filter: z.string().max(50).optional(),
});

export const userProfileSchema = z.object({
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  username: usernameSchema,
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  skills: z.array(z.string()).max(10).optional(),
});

export const internshipApplicationSchema = z.object({
  internship_id: z.string().min(1),
  domain: z.string().min(1).max(50),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  cover_note: z.string().max(1000).optional(),
  duration_weeks: z.coerce.number().min(1).max(52).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

// Export rate limiter instance
export const apiRateLimiter = new RateLimiter(10, 60 * 1000); // 10 requests per minute
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
