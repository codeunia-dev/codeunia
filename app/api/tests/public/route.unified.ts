import { createClient } from "@/lib/supabase/server";
import { UnifiedCache } from "@/lib/unified-cache-system";

// Type definition for test data
interface PublicTest {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  passing_score: number;
  test_registrations: Array<{ count: number }>;
}

interface PublicTestsResponse {
  tests: PublicTest[];
  total: number;
}

// GET: Get public tests for display
export async function GET() {
  try {
    const cacheKey = 'public-tests';

    // Use unified cache system with MEDIUM_CONTENT strategy
    const result = await UnifiedCache.cachedQuery(
      cacheKey,
      async (): Promise<PublicTestsResponse> => {
        const supabase = await createClient();
        
        // Add timeout to the query
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Database query timeout')), 10000);
        });

        const queryPromise = supabase
          .from('tests')
          .select(`
            id,
            name,
            description,
            duration_minutes,
            passing_score,
            test_registrations(count)
          `)
          .eq('is_public', true)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(6); // Show only 6 most recent tests

        const result = await Promise.race([queryPromise, timeoutPromise]);
        const { data: tests, error } = result;

        if (error) {
          console.error('Error fetching tests:', error);
          // Return empty response instead of throwing
          return {
            tests: [],
            total: 0
          };
        }

        return {
          tests: tests || [],
          total: tests?.length || 0
        };
      },
      'DATABASE_QUERIES' // 5-minute cache strategy for database content
    );

    return UnifiedCache.createResponse(result, 'DATABASE_QUERIES');
    
  } catch (error) {
    console.error('Error in public tests route:', error);
    
    // Return fallback data without caching errors
    return UnifiedCache.createResponse({
      tests: [],
      total: 0
    }, 'USER_PRIVATE');
  }
}
