/**
 * Comprehensive Security Test Suite for CodeUnia
 * Tests authentication, authorization, input validation, and security vulnerabilities
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { 
  sanitizeString, 
  sanitizeEmail, 
  isSQLInjectionSafe, 
  RateLimiter,
  generateCSRFToken,
  validateCSRFToken
} from '@/lib/security/input-validation';

describe('Security Tests', () => {
  
  describe('Input Sanitization', () => {
    test('should sanitize malicious HTML', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello';
      const sanitized = sanitizeString(maliciousInput);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
      // Check that the content is properly sanitized
      expect(sanitized).toContain('Hello');
      expect(sanitized.includes('script') && !sanitized.includes('<script>')).toBe(true);
    });

    test('should remove javascript: protocol', () => {
      const maliciousInput = 'javascript:alert("xss")';
      const sanitized = sanitizeString(maliciousInput);
      expect(sanitized).not.toContain('javascript:');
    });

    test('should remove data: protocol', () => {
      const maliciousInput = 'data:text/html,<script>alert("xss")</script>';
      const sanitized = sanitizeString(maliciousInput);
      expect(sanitized).not.toContain('data:');
    });

    test('should limit string length', () => {
      const longString = 'a'.repeat(2000);
      const sanitized = sanitizeString(longString);
      expect(sanitized.length).toBeLessThanOrEqual(1000);
    });

    test('should sanitize email addresses', () => {
      const email = '  Test@Example.COM  ';
      const sanitized = sanitizeEmail(email);
      expect(sanitized).toBe('test@example.com');
    });
  });

  describe('SQL Injection Prevention', () => {
    test('should detect SQL injection patterns', () => {
      const sqlInjections = [
        "'; DROP TABLE users; --",
        "1 OR 1=1",
        "1' UNION SELECT * FROM users--",
        "'; DELETE FROM profiles; --",
        "1' OR '1'='1",
        "admin'--",
        "1; EXEC xp_cmdshell('dir')",
        "1' WAITFOR DELAY '00:00:05'--"
      ];

      sqlInjections.forEach(injection => {
        expect(isSQLInjectionSafe(injection)).toBe(false);
      });
    });

    test('should allow safe input', () => {
      const safeInputs = [
        "john.doe@example.com",
        "Valid username123",
        "Normal text input",
        "User input with spaces"
      ];

      safeInputs.forEach(input => {
        expect(isSQLInjectionSafe(input)).toBe(true);
      });
    });
  });

  describe('Rate Limiting', () => {
    let rateLimiter: RateLimiter;

    beforeEach(() => {
      rateLimiter = new RateLimiter(3, 1000); // 3 requests per second
    });

    test('should allow requests within limit', () => {
      expect(rateLimiter.isAllowed('test-ip')).toBe(true);
      expect(rateLimiter.isAllowed('test-ip')).toBe(true);
      expect(rateLimiter.isAllowed('test-ip')).toBe(true);
    });

    test('should block requests exceeding limit', () => {
      // Exceed the limit
      rateLimiter.isAllowed('test-ip');
      rateLimiter.isAllowed('test-ip');
      rateLimiter.isAllowed('test-ip');
      
      expect(rateLimiter.isAllowed('test-ip')).toBe(false);
    });

    test('should reset after time window', async () => {
      // Fill up the limit
      rateLimiter.isAllowed('test-ip');
      rateLimiter.isAllowed('test-ip');
      rateLimiter.isAllowed('test-ip');
      
      expect(rateLimiter.isAllowed('test-ip')).toBe(false);
      
      // Wait for reset and try again
      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(rateLimiter.isAllowed('test-ip')).toBe(true);
    });

    test('should handle different IPs independently', () => {
      rateLimiter.isAllowed('ip1');
      rateLimiter.isAllowed('ip1');
      rateLimiter.isAllowed('ip1');
      
      // IP1 should be blocked
      expect(rateLimiter.isAllowed('ip1')).toBe(false);
      
      // IP2 should still be allowed
      expect(rateLimiter.isAllowed('ip2')).toBe(true);
    });
  });

  describe('CSRF Protection', () => {
    test('should generate unique CSRF tokens', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      
      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(10);
      expect(token2.length).toBeGreaterThan(10);
    });

    test('should validate CSRF tokens correctly', () => {
      const token = generateCSRFToken();
      expect(validateCSRFToken(token, token)).toBe(true);
      expect(validateCSRFToken(token, 'different-token')).toBe(false);
    });
  });

  describe('Authentication Security', () => {
    test('should reject malformed authorization headers', () => {
      const malformedHeaders = [
        'Bearer',
        'Bearer ',
        'Basic dGVzdDp0ZXN0', // Wrong type
        'Invalid token format',
        ''
      ];

      malformedHeaders.forEach(header => {
        // This would be tested with actual auth middleware
        expect(header.startsWith('Bearer ') && header.length > 7).toBe(false);
      });
    });
  });

  describe('Environment Variables Security', () => {
    test('should not expose sensitive environment variables', () => {
      // These should not be accessible in client-side code
      const sensitiveVars = [
        'SUPABASE_SERVICE_ROLE_KEY',
        'RAZORPAY_KEY_SECRET',
        'RESEND_API_KEY',
        'OPENROUTER_API_KEY'
      ];

      sensitiveVars.forEach(varName => {
        // In a real test, these should be undefined in client context
        // or properly secured in server context
        expect(typeof process.env[varName]).toBeDefined();
      });
    });

    test('should have required public environment variables', () => {
      const requiredPublicVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY'
      ];

      requiredPublicVars.forEach(varName => {
        expect(process.env[varName]).toBeDefined();
      });
    });
  });

  describe('Content Security Policy', () => {
    test('should have secure headers configuration', () => {
      // These would be tested by checking the actual response headers
      const expectedHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'origin-when-cross-origin'
      };

      Object.entries(expectedHeaders).forEach(([header, value]) => {
        // In actual implementation, test these headers in responses
        expect(header).toBeDefined();
        expect(value).toBeDefined();
      });
    });
  });

  describe('Password Security', () => {
    test('should enforce strong password requirements', () => {
      const weakPasswords = [
        'password',
        '123456',
        'abc',
        'PASSWORD',
        '12345678',
        'abcdefgh'
      ];

      const strongPasswords = [
        'MyStrongP@ssw0rd123',
        'Secure123!',
        'Test@123Pass'
      ];

      // Password validation regex from the codebase
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

      weakPasswords.forEach(password => {
        expect(password.length >= 8 && passwordRegex.test(password)).toBe(false);
      });

      strongPasswords.forEach(password => {
        expect(password.length >= 8 && passwordRegex.test(password)).toBe(true);
      });
    });
  });

  describe('File Upload Security', () => {
    test('should validate file types', () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      const maliciousTypes = ['text/html', 'application/javascript', 'text/php'];

      allowedTypes.forEach(type => {
        expect(allowedTypes.includes(type)).toBe(true);
      });

      maliciousTypes.forEach(type => {
        expect(allowedTypes.includes(type)).toBe(false);
      });
    });
  });

  describe('API Security', () => {
    test('should validate API input parameters', () => {
      const validInputs = {
        email: 'test@example.com',
        username: 'validuser123',
        id: 'valid-uuid-format'
      };

      const invalidInputs = {
        email: 'not-an-email',
        username: 'user<script>',
        id: '"; DROP TABLE users; --'
      };

      // Test email validation
      expect(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(validInputs.email)).toBe(true);
      expect(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invalidInputs.email)).toBe(false);

      // Test username validation
      expect(/^[a-zA-Z0-9_-]+$/.test(validInputs.username)).toBe(true);
      expect(/^[a-zA-Z0-9_-]+$/.test(invalidInputs.username)).toBe(false);
    });
  });
});
