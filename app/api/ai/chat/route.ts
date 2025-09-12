import { NextRequest } from 'next/server'

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


export async function POST(request: NextRequest) {
  try {
    await request.json() // Parse body but don't assign to unused variable
    
    // TODO: Implement AI chat functionality
    return new Response(JSON.stringify({
      message: 'AI chat endpoint - implementation pending',
      success: false
    }), {
      status: 501,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      success: false
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}