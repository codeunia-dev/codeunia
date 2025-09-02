import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          response: 'Please sign in to use the AI assistant.',
          context: 'auth_error',
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Forward the request to the main AI endpoint with user information
    const response = await fetch(`${request.nextUrl.origin}/api/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': user.id,
        'X-User-Email': user.email || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`AI endpoint responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling AI endpoint:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'AI service unavailable',
        response: 'Sorry, the AI assistant is currently unavailable. Please try again later.',
        context: 'error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check - forward to main AI endpoint
    const response = await fetch(`${request.nextUrl.origin}/api/ai`);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        message: 'AI service is not available',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
