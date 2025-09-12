import { NextRequest } from 'next/server';
import { authenticateAdmin } from '@/lib/auth/admin-auth';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { RateLimitConfigs } from '@/lib/security/rate-limiting';
import { networkInterfaces, cpus, loadavg } from 'os';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


export const GET = withRateLimit(
  {
    ...RateLimitConfigs.API,
    maxRequests: 10, // Limit system info requests
    windowMs: 60 * 1000 // 1 minute window
  },
  async (request: NextRequest) => {
    try {
      // Authenticate admin user
      const user = await authenticateAdmin(request);
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Get real system information
      const systemInfo = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memory: {
          total: process.memoryUsage().heapTotal,
          used: process.memoryUsage().heapUsed,
          free: process.memoryUsage().heapTotal - process.memoryUsage().heapUsed,
          percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
        },
        cpu: {
          cores: cpus().length,
          loadAverage: loadavg()
        },
        network: {
          interfaces: Object.entries(networkInterfaces()).map(([name, interfaces]) => ({
            name,
            addresses: interfaces?.map(iface => ({
              address: iface.address,
              family: iface.family,
              internal: iface.internal
            })) || []
          }))
        }
      };

      return new Response(
        JSON.stringify(systemInfo),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          } 
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
);
