/**
 * Centralized Structured Logging System
 * Provides consistent JSON logging across the application
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  event: string;
  message?: string;
  data?: Record<string, unknown>;
  environment: string;
  buildId?: string;
  userId?: string;
  requestId?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  service: string;
  enableConsole: boolean;
  enableExternal: boolean;
  externalEndpoint?: string;
}

class StructuredLogger {
  private config: LoggerConfig;
  private isProduction: boolean;

  constructor(config: LoggerConfig) {
    this.config = config;
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Log a message with structured data
   */
  log(
    level: LogLevel,
    event: string,
    message?: string,
    data?: Record<string, unknown>,
    error?: Error
  ): void {
    // Check if we should log this level
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.config.service,
      event,
      message,
      data,
      environment: process.env.NODE_ENV || 'development',
      buildId: process.env.NEXT_PUBLIC_BUILD_ID,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: this.isProduction ? undefined : error.stack
        }
      })
    };

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // External logging (async, don't block)
    if (this.config.enableExternal && this.config.externalEndpoint) {
      this.logToExternal(logEntry).catch(err => {
        console.error('Failed to send log to external service:', err);
      });
    }
  }

  /**
   * Debug level logging
   */
  debug(event: string, message?: string, data?: Record<string, unknown>): void {
    this.log('debug', event, message, data);
  }

  /**
   * Info level logging
   */
  info(event: string, message?: string, data?: Record<string, unknown>): void {
    this.log('info', event, message, data);
  }

  /**
   * Warning level logging
   */
  warn(event: string, message?: string, data?: Record<string, unknown>): void {
    this.log('warn', event, message, data);
  }

  /**
   * Error level logging
   */
  error(event: string, message?: string, data?: Record<string, unknown>, error?: Error): void {
    this.log('error', event, message, data, error);
  }

  /**
   * Fatal level logging
   */
  fatal(event: string, message?: string, data?: Record<string, unknown>, error?: Error): void {
    this.log('fatal', event, message, data, error);
  }

  /**
   * Check if we should log at this level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
    const configLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= configLevelIndex;
  }

  /**
   * Log to console with appropriate formatting
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.service.toUpperCase()}] ${entry.level.toUpperCase()}`;
    
    if (this.isProduction) {
      // In production, always use JSON format
      console.log(JSON.stringify(entry));
    } else {
      // In development, use readable format
      const logMethod = this.getConsoleMethod(entry.level);
      const message = entry.message ? ` - ${entry.message}` : '';
      
      logMethod(`${prefix}${message}:`, {
        event: entry.event,
        timestamp: entry.timestamp,
        ...entry.data,
        ...(entry.error && { error: entry.error })
      });
    }
  }

  /**
   * Get appropriate console method for log level
   */
  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case 'debug':
        return console.debug;
      case 'info':
        return console.info;
      case 'warn':
        return console.warn;
      case 'error':
      case 'fatal':
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Send log to external service (async)
   */
  private async logToExternal(entry: LogEntry): Promise<void> {
    if (!this.config.externalEndpoint) {
      return;
    }

    try {
      await fetch(this.config.externalEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CodeUnia-Logger/1.0'
        },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      // Don't throw, just log to console
      console.error('Failed to send log to external service:', error);
    }
  }
}

// Create logger instances for different services
export const createLogger = (service: string, config?: Partial<LoggerConfig>): StructuredLogger => {
  const defaultConfig: LoggerConfig = {
    level: (process.env.LOG_LEVEL as LogLevel) || 'info',
    service,
    enableConsole: true,
    enableExternal: process.env.MONITORING_ENABLED === 'true',
    externalEndpoint: process.env.MONITORING_ENDPOINT
  };

  return new StructuredLogger({ ...defaultConfig, ...config });
};

// Pre-configured loggers for common services
export const logger = {
  api: createLogger('api'),
  auth: createLogger('auth'),
  cache: createLogger('cache'),
  database: createLogger('database'),
  performance: createLogger('performance'),
  security: createLogger('security'),
  monitoring: createLogger('monitoring')
};

// Utility function for request-scoped logging
export const createRequestLogger = (requestId: string, userId?: string) => {
  return {
    api: createLogger('api', { 
      enableConsole: true,
      enableExternal: process.env.MONITORING_ENABLED === 'true'
    }),
    withContext: (service: string) => {
      const serviceLogger = createLogger(service);
      return {
        ...serviceLogger,
        log: (level: LogLevel, event: string, message?: string, data?: Record<string, unknown>, error?: Error) => {
          serviceLogger.log(level, event, message, { ...data, requestId, userId }, error);
        }
      };
    }
  };
};

// Performance monitoring helper
export const logPerformance = (event: string, duration: number, data?: Record<string, unknown>) => {
  logger.performance.info(event, `Operation completed in ${duration}ms`, {
    duration,
    ...data
  });
};

// Error logging helper
export const logError = (event: string, error: Error, context?: Record<string, unknown>) => {
  logger.api.error(event, error.message, context, error);
};

// Security event logging
export const logSecurityEvent = (event: string, data?: Record<string, unknown>) => {
  logger.security.warn(event, 'Security event detected', data);
};
