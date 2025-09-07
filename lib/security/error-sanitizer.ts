/**
 * Error Sanitization for Production Security
 * Prevents information disclosure through error messages
 */

export interface SanitizedError {
  message: string;
  code?: string;
  timestamp: string;
  requestId?: string;
}

export interface DetailedError {
  message: string;
  code?: string;
  details?: unknown;
  stack?: string;
  timestamp: string;
  requestId?: string;
}

/**
 * Sanitize error messages for production
 */
export class ErrorSanitizer {
  private static readonly isProduction = process.env.NODE_ENV === 'production';
  
  /**
   * Sanitize error for client response
   */
  static sanitizeError(error: Error | unknown, requestId?: string): SanitizedError {
    const timestamp = new Date().toISOString();
    
    // In production, return generic error messages
    if (this.isProduction) {
      return this.getGenericError(error, timestamp, requestId);
    }
    
    // In development, return detailed error information
    const errorObj = error as { message?: string; code?: string };
    
    return {
      message: errorObj?.message || 'An error occurred',
      code: errorObj?.code,
      timestamp,
      requestId
    };
  }
  
  /**
   * Get generic error message for production
   */
  private static getGenericError(error: Error | unknown, timestamp: string, requestId?: string): SanitizedError {
    // Map specific error types to generic messages
    const errorObj = error as { code?: string; message?: string };
    
    if (errorObj?.code === 'PGRST116') {
      return {
        message: 'Resource not found',
        code: 'NOT_FOUND',
        timestamp,
        requestId
      };
    }
    
    if (errorObj?.code === '23505') {
      return {
        message: 'Resource already exists',
        code: 'CONFLICT',
        timestamp,
        requestId
      };
    }
    
    if (errorObj?.code === '23503') {
      return {
        message: 'Invalid reference',
        code: 'INVALID_REFERENCE',
        timestamp,
        requestId
      };
    }
    
    if (errorObj?.message?.includes('JWT')) {
      return {
        message: 'Authentication failed',
        code: 'AUTH_ERROR',
        timestamp,
        requestId
      };
    }
    
    if (errorObj?.message?.includes('permission') || errorObj?.message?.includes('unauthorized')) {
      return {
        message: 'Access denied',
        code: 'FORBIDDEN',
        timestamp,
        requestId
      };
    }
    
    if (errorObj?.message?.includes('validation') || errorObj?.message?.includes('invalid')) {
      return {
        message: 'Invalid input provided',
        code: 'VALIDATION_ERROR',
        timestamp,
        requestId
      };
    }
    
    if (errorObj?.message?.includes('rate limit') || errorObj?.message?.includes('too many')) {
      return {
        message: 'Too many requests',
        code: 'RATE_LIMITED',
        timestamp,
        requestId
      };
    }
    
    // Default generic error
    return {
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      timestamp,
      requestId
    };
  }
  
  /**
   * Log detailed error for debugging (server-side only)
   */
  static logDetailedError(error: Error | unknown, context?: string, requestId?: string): void {
    const errorObj = error as { message?: string; code?: string; details?: unknown; stack?: string };
    
    const detailedError: DetailedError = {
      message: errorObj?.message || 'Unknown error',
      code: errorObj?.code,
      details: errorObj?.details || error,
      stack: errorObj?.stack,
      timestamp: new Date().toISOString(),
      requestId
    };
    
    // Log with context
    console.error(`[${context || 'ERROR'}]`, {
      ...detailedError,
      environment: process.env.NODE_ENV,
      url: process.env.NEXT_PUBLIC_SITE_URL
    });
  }
  
  /**
   * Create standardized error response
   */
  static createErrorResponse(
    error: Error | unknown, 
    statusCode: number = 500, 
    context?: string,
    requestId?: string
  ): Response {
    // Log detailed error for debugging
    this.logDetailedError(error, context, requestId);
    
    // Return sanitized error to client
    const sanitizedError = this.sanitizeError(error, requestId);
    
    return new Response(
      JSON.stringify({
        error: sanitizedError.message,
        code: sanitizedError.code,
        timestamp: sanitizedError.timestamp,
        ...(requestId && { requestId })
      }),
      {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  }
  
  /**
   * Validate and sanitize user input errors
   */
  static sanitizeValidationError(error: Error | unknown, requestId?: string): SanitizedError {
    const timestamp = new Date().toISOString();
    
    if (this.isProduction) {
      return {
        message: 'Please check your input and try again',
        code: 'VALIDATION_ERROR',
        timestamp,
        requestId
      };
    }
    
    const errorObj = error as { message?: string; code?: string };
    
    return {
      message: errorObj?.message || 'Validation failed',
      code: errorObj?.code || 'VALIDATION_ERROR',
      timestamp,
      requestId
    };
  }
  
  /**
   * Sanitize database errors
   */
  static sanitizeDatabaseError(error: Error | unknown, requestId?: string): SanitizedError {
    const timestamp = new Date().toISOString();
    
    if (this.isProduction) {
      // Don't expose database-specific error details
      return {
        message: 'Database operation failed',
        code: 'DATABASE_ERROR',
        timestamp,
        requestId
      };
    }
    
    const errorObj = error as { message?: string; code?: string };
    
    return {
      message: errorObj?.message || 'Database error',
      code: errorObj?.code || 'DATABASE_ERROR',
      timestamp,
      requestId
    };
  }
  
  /**
   * Sanitize authentication errors
   */
  static sanitizeAuthError(error: Error | unknown, requestId?: string): SanitizedError {
    const timestamp = new Date().toISOString();
    
    if (this.isProduction) {
      return {
        message: 'Authentication failed',
        code: 'AUTH_ERROR',
        timestamp,
        requestId
      };
    }
    
    const errorObj = error as { message?: string; code?: string };
    
    return {
      message: errorObj?.message || 'Authentication error',
      code: errorObj?.code || 'AUTH_ERROR',
      timestamp,
      requestId
    };
  }
}
