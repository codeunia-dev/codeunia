/**
 * Resume Builder Error Handling System
 * Defines error types, codes, and error handling utilities
 */

export enum ResumeErrorCode {
  LOAD_FAILED = 'LOAD_FAILED',
  SAVE_FAILED = 'SAVE_FAILED',
  EXPORT_FAILED = 'EXPORT_FAILED',
  IMPORT_FAILED = 'IMPORT_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class ResumeError extends Error {
  public readonly code: ResumeErrorCode;
  public readonly details?: unknown;
  public readonly timestamp: Date;
  public readonly recoverable: boolean;

  constructor(
    message: string,
    code: ResumeErrorCode,
    details?: unknown,
    recoverable = true
  ) {
    super(message);
    this.name = 'ResumeError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
    this.recoverable = recoverable;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ResumeError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      recoverable: this.recoverable,
      stack: this.stack,
    };
  }
}

/**
 * Error logger utility
 */
export class ErrorLogger {
  private static logs: Array<{
    error: ResumeError;
    context?: Record<string, unknown>;
  }> = [];

  static log(error: ResumeError, context?: Record<string, unknown>) {
    this.logs.push({ error, context });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ResumeError]', {
        message: error.message,
        code: error.code,
        details: error.details,
        context,
        stack: error.stack,
      });
    }

    // In production, you might want to send to an error tracking service
    // e.g., Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: context });
    }
  }

  static getLogs() {
    return this.logs;
  }

  static clearLogs() {
    this.logs = [];
  }
}

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES: Record<ResumeErrorCode, string> = {
  [ResumeErrorCode.LOAD_FAILED]: 'Failed to load resume. Please try again.',
  [ResumeErrorCode.SAVE_FAILED]: 'Failed to save resume. Your changes may not be saved.',
  [ResumeErrorCode.EXPORT_FAILED]: 'Failed to export resume. Please try again.',
  [ResumeErrorCode.IMPORT_FAILED]: 'Failed to import resume data. Please check the file format.',
  [ResumeErrorCode.VALIDATION_FAILED]: 'Some fields contain invalid data. Please check and try again.',
  [ResumeErrorCode.NETWORK_ERROR]: 'Network connection lost. Please check your internet connection.',
  [ResumeErrorCode.UNAUTHORIZED]: 'You are not authorized to perform this action.',
  [ResumeErrorCode.NOT_FOUND]: 'Resume not found.',
  [ResumeErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait a moment and try again.',
  [ResumeErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
};

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ResumeError) {
    return ERROR_MESSAGES[error.code] || error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return ERROR_MESSAGES[ResumeErrorCode.UNKNOWN_ERROR];
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof ResumeError) {
    return error.recoverable;
  }
  return true; // Assume recoverable by default
}

/**
 * Create error from unknown error
 */
export function createResumeError(
  error: unknown,
  defaultCode: ResumeErrorCode = ResumeErrorCode.UNKNOWN_ERROR
): ResumeError {
  if (error instanceof ResumeError) {
    return error;
  }

  if (error instanceof Error) {
    return new ResumeError(error.message, defaultCode, { originalError: error });
  }

  return new ResumeError(
    'An unexpected error occurred',
    defaultCode,
    { originalError: error }
  );
}
