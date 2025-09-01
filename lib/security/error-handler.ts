import { NextResponse } from 'next/server';

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  DATABASE = 'DATABASE',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  INTERNAL = 'INTERNAL',
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export class AppErrorHandler {
  private static isProduction = process.env.NODE_ENV === 'production';

  static createError(
    type: ErrorType,
    message: string,
    code?: string,
    details?: Record<string, unknown>
  ): AppError {
    return {
      type,
      message: this.isProduction ? this.getSafeMessage(type) : message,
      code,
      details: this.isProduction ? undefined : details,
    };
  }

  private static getSafeMessage(type: ErrorType): string {
    const safeMessages = {
      [ErrorType.VALIDATION]: 'Invalid input provided',
      [ErrorType.AUTHENTICATION]: 'Authentication required',
      [ErrorType.AUTHORIZATION]: 'Access denied',
      [ErrorType.NOT_FOUND]: 'Resource not found',
      [ErrorType.RATE_LIMIT]: 'Too many requests',
      [ErrorType.DATABASE]: 'Database operation failed',
      [ErrorType.EXTERNAL_SERVICE]: 'External service unavailable',
      [ErrorType.INTERNAL]: 'Internal server error',
    };
    return safeMessages[type];
  }

  static handleError(error: unknown): AppError {
    if (error instanceof Error) {
      // Handle known error types
      if (error.message.includes('validation')) {
        return this.createError(ErrorType.VALIDATION, error.message);
      }
      if (error.message.includes('auth') || error.message.includes('unauthorized')) {
        return this.createError(ErrorType.AUTHENTICATION, error.message);
      }
      if (error.message.includes('forbidden') || error.message.includes('permission')) {
        return this.createError(ErrorType.AUTHORIZATION, error.message);
      }
      if (error.message.includes('not found')) {
        return this.createError(ErrorType.NOT_FOUND, error.message);
      }
      if (error.message.includes('rate limit')) {
        return this.createError(ErrorType.RATE_LIMIT, error.message);
      }
      if (error.message.includes('database') || error.message.includes('supabase')) {
        return this.createError(ErrorType.DATABASE, error.message);
      }
    }

    // Default to internal error
    return this.createError(
      ErrorType.INTERNAL,
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }

  static createErrorResponse(error: AppError): NextResponse {
    const statusCode = this.getStatusCode(error.type);
    
    return NextResponse.json(
      {
        error: error.message,
        type: error.type,
        ...(error.code && { code: error.code }),
        ...(error.details && { details: error.details }),
      },
      { status: statusCode }
    );
  }

  private static getStatusCode(type: ErrorType): number {
    const statusCodes = {
      [ErrorType.VALIDATION]: 400,
      [ErrorType.AUTHENTICATION]: 401,
      [ErrorType.AUTHORIZATION]: 403,
      [ErrorType.NOT_FOUND]: 404,
      [ErrorType.RATE_LIMIT]: 429,
      [ErrorType.DATABASE]: 500,
      [ErrorType.EXTERNAL_SERVICE]: 503,
      [ErrorType.INTERNAL]: 500,
    };
    return statusCodes[type];
  }

  static logError(error: AppError, context?: string): void {
    if (!this.isProduction) {
      console.error(`[${context || 'API'}] Error:`, {
        type: error.type,
        message: error.message,
        code: error.code,
        details: error.details,
        timestamp: new Date().toISOString(),
      });
    } else {
      // In production, log to external service (e.g., Sentry)
      console.error(`[${error.type}] ${error.message}`, {
        code: error.code,
        context,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Convenience functions
export function handleValidationError(message: string): NextResponse {
  const error = AppErrorHandler.createError(ErrorType.VALIDATION, message);
  return AppErrorHandler.createErrorResponse(error);
}

export function handleAuthError(message: string = 'Authentication required'): NextResponse {
  const error = AppErrorHandler.createError(ErrorType.AUTHENTICATION, message);
  return AppErrorHandler.createErrorResponse(error);
}

export function handleAuthzError(message: string = 'Access denied'): NextResponse {
  const error = AppErrorHandler.createError(ErrorType.AUTHORIZATION, message);
  return AppErrorHandler.createErrorResponse(error);
}

export function handleNotFoundError(message: string = 'Resource not found'): NextResponse {
  const error = AppErrorHandler.createError(ErrorType.NOT_FOUND, message);
  return AppErrorHandler.createErrorResponse(error);
}

export function handleRateLimitError(message: string = 'Too many requests'): NextResponse {
  const error = AppErrorHandler.createError(ErrorType.RATE_LIMIT, message);
  return AppErrorHandler.createErrorResponse(error);
}

export function handleDatabaseError(error: unknown): NextResponse {
  const appError = AppErrorHandler.handleError(error);
  AppErrorHandler.logError(appError, 'Database');
  return AppErrorHandler.createErrorResponse(appError);
}

export function handleInternalError(error: unknown): NextResponse {
  const appError = AppErrorHandler.handleError(error);
  AppErrorHandler.logError(appError, 'Internal');
  return AppErrorHandler.createErrorResponse(appError);
}
