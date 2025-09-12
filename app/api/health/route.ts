import { NextRequest } from 'next/server';
import { handleHealthCheck } from '@/lib/monitoring/health-checks';
import { healthAlertingIntegration } from '@/lib/monitoring/health-alerting-integration';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { RateLimitConfigs } from '@/lib/security/rate-limiting';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


export async function GET(request: NextRequest) {
  // Check for quick health check parameter
  const url = new URL(request.url);
  const quick = url.searchParams.get('quick') === 'true';
  
  // Use integration service for health checks with alerting
  try {
    const results = await healthAlertingIntegration.runHealthChecksWithAlerting(quick);
    
    const statusCode = results.status === 'healthy' ? 200 : 
                      results.status === 'degraded' ? 200 : 503;

    return new Response(
      JSON.stringify(results, null, 2),
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

// Apply rate limiting to health check endpoint
export const POST = withRateLimit(
  {
    ...RateLimitConfigs.PUBLIC,
    maxRequests: 10, // Limit health check requests
    windowMs: 60 * 1000 // 1 minute window
  },
  async (request: NextRequest) => {
    const url = new URL(request.url);
    const quick = url.searchParams.get('quick') === 'true';
    
    return handleHealthCheck(quick);
  }
);
