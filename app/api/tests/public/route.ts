import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCacheHeaders, CACHE_CONFIGS } from "@/lib/cache-headers";

// In-memory cache for this API route
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// GET: Get public tests for display
export async function GET() {
  try {
    // Check cache first
    const cacheKey = 'public-tests';
    const now = Date.now();
    const cached = cache.get(cacheKey);
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      const headers = createCacheHeaders(CACHE_CONFIGS.MEDIUM);
      return NextResponse.json(cached.data, {
        headers: {
          ...headers,
          'X-Cache': 'HIT'
        }
      });
    }

    const supabase = await createClient();
    
    // Add timeout to the query
    const timeoutPromise = new Promise((_, reject) => {
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
    const { data: tests, error } = result as { data: Array<{
      id: string;
      name: string;
      description: string;
      duration_minutes: number;
      passing_score: number;
      test_registrations: Array<{ count: number }>;
    }> | null; error: Error | null };

    if (error) {
      console.error('Error fetching tests:', error);
      // Return empty response instead of 500 error
      return NextResponse.json({
        tests: [],
        total: 0
      });
    }

    const response = {
      tests: tests || [],
      total: tests?.length || 0
    };

    // Cache the response for 5 minutes
    cache.set(cacheKey, { data: response, timestamp: now });

    const headers = createCacheHeaders(CACHE_CONFIGS.MEDIUM);
    return NextResponse.json(response, {
      headers: {
        ...headers,
        'X-Cache': 'MISS'
      }
    });
  } catch (error) {
    console.error('Error in public tests route:', error);
    // Return empty response instead of 500 error
    return NextResponse.json({
      tests: [],
      total: 0
    });
  }
} 