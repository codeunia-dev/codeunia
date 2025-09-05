import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a DOMPurify instance for server-side use
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue?: string;
  error?: string;
}

export interface ValidationOptions {
  maxLength?: number;
  minLength?: number;
  allowHtml?: boolean;
  required?: boolean;
  pattern?: RegExp;
  customValidator?: (value: string) => boolean;
}

/**
 * Comprehensive input validation and sanitization
 */
export class InputValidator {
  /**
   * Validate and sanitize text input
   */
  static validateText(
    input: string,
    options: ValidationOptions = {}
  ): ValidationResult {
    const {
      maxLength = 1000,
      minLength = 0,
      allowHtml = false,
      required = false,
      pattern,
      customValidator
    } = options;

    // Check if required field is empty
    if (required && (!input || input.trim().length === 0)) {
      return {
        isValid: false,
        error: 'This field is required'
      };
    }

    // Skip validation for empty optional fields
    if (!input || input.trim().length === 0) {
      return {
        isValid: true,
        sanitizedValue: ''
      };
    }

    let sanitizedValue = input.trim();

    // Length validation
    if (sanitizedValue.length < minLength) {
      return {
        isValid: false,
        error: `Minimum length is ${minLength} characters`
      };
    }

    if (sanitizedValue.length > maxLength) {
      return {
        isValid: false,
        error: `Maximum length is ${maxLength} characters`
      };
    }

    // Pattern validation
    if (pattern && !pattern.test(sanitizedValue)) {
      return {
        isValid: false,
        error: 'Invalid format'
      };
    }

    // Custom validation
    if (customValidator && !customValidator(sanitizedValue)) {
      return {
        isValid: false,
        error: 'Invalid value'
      };
    }

    // HTML sanitization
    if (!allowHtml) {
      sanitizedValue = purify.sanitize(sanitizedValue, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      });
    } else {
      // Allow safe HTML tags only
      sanitizedValue = purify.sanitize(sanitizedValue, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: []
      });
    }

    return {
      isValid: true,
      sanitizedValue
    };
  }

  /**
   * Validate email address
   */
  static validateEmail(email: string): ValidationResult {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!email || email.trim().length === 0) {
      return {
        isValid: false,
        error: 'Email is required'
      };
    }

    const sanitizedEmail = email.trim().toLowerCase();
    
    if (!emailPattern.test(sanitizedEmail)) {
      return {
        isValid: false,
        error: 'Invalid email format'
      };
    }

    if (sanitizedEmail.length > 254) {
      return {
        isValid: false,
        error: 'Email is too long'
      };
    }

    return {
      isValid: true,
      sanitizedValue: sanitizedEmail
    };
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): ValidationResult {
    if (!password || password.length === 0) {
      return {
        isValid: false,
        error: 'Password is required'
      };
    }

    if (password.length < 8) {
      return {
        isValid: false,
        error: 'Password must be at least 8 characters long'
      };
    }

    if (password.length > 128) {
      return {
        isValid: false,
        error: 'Password is too long'
      };
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one lowercase letter'
      };
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one uppercase letter'
      };
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one number'
      };
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one special character'
      };
    }

    return {
      isValid: true,
      sanitizedValue: password
    };
  }

  /**
   * Validate username
   */
  static validateUsername(username: string): ValidationResult {
    if (!username || username.trim().length === 0) {
      return {
        isValid: false,
        error: 'Username is required'
      };
    }

    const sanitizedUsername = username.trim().toLowerCase();
    
    if (sanitizedUsername.length < 3) {
      return {
        isValid: false,
        error: 'Username must be at least 3 characters long'
      };
    }

    if (sanitizedUsername.length > 30) {
      return {
        isValid: false,
        error: 'Username must be less than 30 characters'
      };
    }

    // Only allow alphanumeric characters, underscores, and hyphens
    const usernamePattern = /^[a-z0-9_-]+$/;
    if (!usernamePattern.test(sanitizedUsername)) {
      return {
        isValid: false,
        error: 'Username can only contain letters, numbers, underscores, and hyphens'
      };
    }

    // Check for reserved usernames
    const reservedUsernames = [
      'admin', 'administrator', 'root', 'api', 'www', 'mail', 'ftp', 'blog',
      'support', 'help', 'about', 'contact', 'terms', 'privacy', 'login',
      'signup', 'register', 'dashboard', 'profile', 'settings', 'account',
      'user', 'users', 'test', 'testing', 'dev', 'development', 'staging',
      'production', 'prod', 'live', 'demo', 'sample', 'example', 'codeunia'
    ];

    if (reservedUsernames.includes(sanitizedUsername)) {
      return {
        isValid: false,
        error: 'This username is reserved'
      };
    }

    return {
      isValid: true,
      sanitizedValue: sanitizedUsername
    };
  }

  /**
   * Validate URL
   */
  static validateUrl(url: string): ValidationResult {
    if (!url || url.trim().length === 0) {
      return {
        isValid: false,
        error: 'URL is required'
      };
    }

    const sanitizedUrl = url.trim();
    
    try {
      const urlObj = new URL(sanitizedUrl);
      
      // Only allow HTTP and HTTPS protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return {
          isValid: false,
          error: 'Only HTTP and HTTPS URLs are allowed'
        };
      }

      return {
        isValid: true,
        sanitizedValue: urlObj.toString()
      };
    } catch {
      return {
        isValid: false,
        error: 'Invalid URL format'
      };
    }
  }

  /**
   * Validate file upload
   */
  static validateFile(
    file: File,
    options: {
      maxSize?: number; // in bytes
      allowedTypes?: string[];
      allowedExtensions?: string[];
    } = {}
  ): ValidationResult {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf']
    } = options;

    if (!file) {
      return {
        isValid: false,
        error: 'File is required'
      };
    }

    // Check file size
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type not allowed'
      };
    }

    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: 'File extension not allowed'
      };
    }

    return {
      isValid: true
    };
  }

  /**
   * Validate JSON input
   */
  static validateJson(jsonString: string): ValidationResult {
    if (!jsonString || jsonString.trim().length === 0) {
      return {
        isValid: false,
        error: 'JSON is required'
      };
    }

    try {
      const parsed = JSON.parse(jsonString);
      return {
        isValid: true,
        sanitizedValue: JSON.stringify(parsed)
      };
    } catch {
      return {
        isValid: false,
        error: 'Invalid JSON format'
      };
    }
  }

  /**
   * Validate SQL injection patterns
   */
  static validateSqlInput(input: string): ValidationResult {
    if (!input) {
      return {
        isValid: true,
        sanitizedValue: ''
      };
    }

    // Common SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(--|\/\*|\*\/)/,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
      /(UNION\s+SELECT)/i,
      /(DROP\s+TABLE)/i,
      /(DELETE\s+FROM)/i,
      /(INSERT\s+INTO)/i,
      /(UPDATE\s+SET)/i
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        return {
          isValid: false,
          error: 'Invalid input detected'
        };
      }
    }

    return {
      isValid: true,
      sanitizedValue: input
    };
  }

  /**
   * Validate XSS patterns
   */
  static validateXssInput(input: string): ValidationResult {
    if (!input) {
      return {
        isValid: true,
        sanitizedValue: ''
      };
    }

    // Common XSS patterns
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /<applet[^>]*>.*?<\/applet>/gi,
      /<meta[^>]*>.*?<\/meta>/gi,
      /<link[^>]*>.*?<\/link>/gi,
      /<style[^>]*>.*?<\/style>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /onmouseover\s*=/gi,
      /onfocus\s*=/gi,
      /onblur\s*=/gi,
      /onchange\s*=/gi,
      /onsubmit\s*=/gi,
      /onreset\s*=/gi,
      /onselect\s*=/gi,
      /onkeydown\s*=/gi,
      /onkeyup\s*=/gi,
      /onkeypress\s*=/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        return {
          isValid: false,
          error: 'Invalid input detected'
        };
      }
    }

    return {
      isValid: true,
      sanitizedValue: input
    };
  }
}

/**
 * Middleware for API route input validation
 */
export function withInputValidation<T extends Record<string, unknown>>(
  schema: Record<keyof T, ValidationOptions>,
  handler: (validatedData: T, request: Request) => Promise<Response>
) {
  return async (request: Request): Promise<Response> => {
    try {
      const body = await request.json();
      const validatedData = {} as T;
      const errors: string[] = [];

      for (const [key, options] of Object.entries(schema)) {
        const value = body[key];
        const result = InputValidator.validateText(value, options);

        if (!result.isValid) {
          errors.push(`${key}: ${result.error}`);
        } else {
          validatedData[key as keyof T] = result.sanitizedValue as T[keyof T];
        }
      }

      if (errors.length > 0) {
        return new Response(
          JSON.stringify({ 
            error: 'Validation failed', 
            details: errors 
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      return handler(validatedData, request);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}