import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { serverCache } from "@/lib/cache";

// GET: Get public tests for display
export async function GET() {
  try {
    // Check cache first
    const cacheKey = 'public-tests';
    const cached = serverCache.get(cacheKey);
    
    if (cached) {
      return NextResponse.json(cached);
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
    serverCache.set(cacheKey, response, 300000);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in public tests route:', error);
    // Return empty response instead of 500 error
    return NextResponse.json({
      tests: [],
      total: 0
    });
  }
} 