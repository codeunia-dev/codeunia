import { createClient } from '@/lib/supabase/server';
// import { createServiceClient } from '@/lib/supabase/server';

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  message?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: HealthCheckResult[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    degraded: number;
  };
}

/**
 * Health Check System
 */
export class HealthChecker {
  private startTime = Date.now();
  private version = process.env.npm_package_version || '1.0.0';
  private environment = process.env.NODE_ENV || 'development';

  /**
   * Check database connectivity
   */
  async checkDatabase(): Promise<HealthCheckResult> {
    const start = Date.now();
    
    try {
      const supabase = await createClient();
      
      // Test basic connectivity
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      const responseTime = Date.now() - start;

      if (error) {
        return {
          service: 'database',
          status: 'unhealthy',
          responseTime,
          message: `Database error: ${error.message}`,
          timestamp: new Date().toISOString()
        };
      }

      return {
        service: 'database',
        status: 'healthy',
        responseTime,
        message: 'Database connection successful',
        details: { recordCount: data?.length || 0 },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check Redis connectivity (if configured)
   */
  async checkRedis(): Promise<HealthCheckResult> {
    const start = Date.now();
    
    try {
      // Check if Redis is configured
      if (!process.env.REDIS_URL) {
        return {
          service: 'redis',
          status: 'degraded',
          responseTime: Date.now() - start,
          message: 'Redis not configured, using memory cache',
          timestamp: new Date().toISOString()
        };
      }

      // Import Redis dynamically to avoid errors if not installed
      const Redis = await import('ioredis').then(m => m.default);
      const redis = new Redis(process.env.REDIS_URL, {
        connectTimeout: 5000,
        lazyConnect: true
      });

      // Test Redis connection
      await redis.ping();
      await redis.disconnect();

      return {
        service: 'redis',
        status: 'healthy',
        responseTime: Date.now() - start,
        message: 'Redis connection successful',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        service: 'redis',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        message: `Redis connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check external API dependencies
   */
  async checkExternalAPIs(): Promise<HealthCheckResult> {
    const start = Date.now();
    const checks = [];

    try {
      // Check Supabase Auth service
      const supabase = await createClient();
      const { error: authError } = await supabase.auth.getSession();
      
      checks.push({
        service: 'supabase-auth',
        status: authError ? 'unhealthy' : 'healthy',
        message: authError ? `Auth service error: ${authError.message}` : 'Auth service healthy'
      });

      // Check Supabase Storage (if used)
      const { error: storageError } = await supabase.storage
        .from('public')
        .list('', { limit: 1 });

      checks.push({
        service: 'supabase-storage',
        status: storageError ? 'unhealthy' : 'healthy',
        message: storageError ? `Storage service error: ${storageError.message}` : 'Storage service healthy'
      });

      // Check if any external APIs are configured
      if (process.env.RAZORPAY_KEY_ID) {
        checks.push({
          service: 'razorpay',
          status: 'healthy',
          message: 'Razorpay configured'
        });
      }

      if (process.env.RESEND_API_KEY) {
        checks.push({
          service: 'resend',
          status: 'healthy',
          message: 'Resend email service configured'
        });
      }

      const healthyCount = checks.filter(c => c.status === 'healthy').length;
      const totalCount = checks.length;
      
      let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      if (healthyCount === 0) {
        overallStatus = 'unhealthy';
      } else if (healthyCount < totalCount) {
        overallStatus = 'degraded';
      }

      return {
        service: 'external-apis',
        status: overallStatus,
        responseTime: Date.now() - start,
        message: `${healthyCount}/${totalCount} external services healthy`,
        details: { checks },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        service: 'external-apis',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        message: `External API check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check system resources
   */
  async checkSystemResources(): Promise<HealthCheckResult> {
    const start = Date.now();
    
    try {
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();
      
      // Check memory usage
      const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const memoryLimitMB = process.env.NODE_OPTIONS?.includes('--max-old-space-size') 
        ? parseInt(process.env.NODE_OPTIONS.split('--max-old-space-size=')[1]) 
        : 512; // Default 512MB

      const memoryUsagePercent = (memoryUsageMB / memoryLimitMB) * 100;
      
      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      if (memoryUsagePercent > 90) {
        status = 'unhealthy';
      } else if (memoryUsagePercent > 75) {
        status = 'degraded';
      }

      return {
        service: 'system-resources',
        status,
        responseTime: Date.now() - start,
        message: `Memory usage: ${memoryUsageMB}MB (${memoryUsagePercent.toFixed(1)}%)`,
        details: {
          memoryUsage: {
            heapUsed: memoryUsage.heapUsed,
            heapTotal: memoryUsage.heapTotal,
            external: memoryUsage.external,
            rss: memoryUsage.rss
          },
          uptime: uptime,
          nodeVersion: process.version,
          platform: process.platform
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        service: 'system-resources',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        message: `System resource check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check application-specific services
   */
  async checkApplicationServices(): Promise<HealthCheckResult> {
    const start = Date.now();
    
    try {
      const checks = [];

      // Check if critical environment variables are set
      const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY'
      ];

      const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
      
      checks.push({
        service: 'environment-variables',
        status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
        message: missingEnvVars.length === 0 
          ? 'All required environment variables are set'
          : `Missing environment variables: ${missingEnvVars.join(', ')}`
      });

      // Check if critical database tables exist
      const supabase = await createClient();
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['profiles', 'user_points', 'user_activity_log']);

      if (tablesError) {
        checks.push({
          service: 'database-tables',
          status: 'unhealthy',
          message: `Database tables check failed: ${tablesError.message}`
        });
      } else {
        const existingTables = tables?.map((t: any) => t.table_name) || [];
        const requiredTables = ['profiles', 'user_points', 'user_activity_log'];
        const missingTables = requiredTables.filter(table => !existingTables.includes(table));
        
        checks.push({
          service: 'database-tables',
          status: missingTables.length === 0 ? 'healthy' : 'unhealthy',
          message: missingTables.length === 0 
            ? 'All required database tables exist'
            : `Missing database tables: ${missingTables.join(', ')}`
        });
      }

      const healthyCount = checks.filter(c => c.status === 'healthy').length;
      const totalCount = checks.length;
      
      let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      if (healthyCount === 0) {
        overallStatus = 'unhealthy';
      } else if (healthyCount < totalCount) {
        overallStatus = 'degraded';
      }

      return {
        service: 'application-services',
        status: overallStatus,
        responseTime: Date.now() - start,
        message: `${healthyCount}/${totalCount} application services healthy`,
        details: { checks },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        service: 'application-services',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        message: `Application services check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Run all health checks
   */
  async runAllChecks(): Promise<HealthCheckResponse> {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkExternalAPIs(),
      this.checkSystemResources(),
      this.checkApplicationServices()
    ]);

    const summary = {
      total: checks.length,
      healthy: checks.filter(c => c.status === 'healthy').length,
      unhealthy: checks.filter(c => c.status === 'unhealthy').length,
      degraded: checks.filter(c => c.status === 'degraded').length
    };

    // Determine overall status
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    if (summary.unhealthy > 0) {
      overallStatus = 'unhealthy';
    } else if (summary.degraded > 0) {
      overallStatus = 'degraded';
    }

    const result = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: this.version,
      environment: this.environment,
      checks,
      summary
    };

    // Process results for alerting (commented out to avoid circular dependency)
    // This should be handled by the calling service
    console.log(`Health check completed with status: ${overallStatus}`);

    return result;
  }

  /**
   * Run quick health check (database only)
   */
  async runQuickCheck(): Promise<HealthCheckResponse> {
    const databaseCheck = await this.checkDatabase();
    
    return {
      status: databaseCheck.status,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: this.version,
      environment: this.environment,
      checks: [databaseCheck],
      summary: {
        total: 1,
        healthy: databaseCheck.status === 'healthy' ? 1 : 0,
        unhealthy: databaseCheck.status === 'unhealthy' ? 1 : 0,
        degraded: databaseCheck.status === 'degraded' ? 1 : 0
      }
    };
  }
}

// Global health checker instance
const healthChecker = new HealthChecker();

/**
 * Health check endpoint handler
 */
export async function handleHealthCheck(quick = false): Promise<Response> {
  try {
    const result = quick 
      ? await healthChecker.runQuickCheck()
      : await healthChecker.runAllChecks();

    const statusCode = result.status === 'healthy' ? 200 : 
                      result.status === 'degraded' ? 200 : 503;

    return new Response(
      JSON.stringify(result, null, 2),
      {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  }
}

export default healthChecker;
