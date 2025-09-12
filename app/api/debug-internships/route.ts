import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


// Create Supabase client function to avoid build-time initialization
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    // Test internship applications - get all columns first
    const { data: appStructure, error: structError } = await supabase
      .from('internship_applications')
      .select('*')
      .limit(1);

    // Test internship applications with correct column structure
    const { data: applications, error: appError } = await supabase
      .from('internship_applications')
      .select(`
        id, user_id, email, internship_id, domain, 
        level, cover_note, status, created_at
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Test completed internships
    const { data: completed, error: compError } = await supabase
      .from('interns')
      .select(`
        email, first_name, last_name, domain, start_date, end_date,
        project_name, project_url, certificate_url, 
        certificate_issued_at, verification_code, passed, created_at
      `)
      .eq('passed', true)
      .order('created_at', { ascending: false })
      .limit(3);

    // Static internship offerings
    const staticInternships = [
      {
        id: 'free-basic',
        title: 'Codeunia Starter Internship',
        description: 'Learn by doing real tasks with mentor check-ins. Remote friendly.',
        type: 'Free',
        domains: ['Web Development', 'Python', 'Java'],
        levels: ['Beginner', 'Intermediate']
      },
      {
        id: 'paid-pro',
        title: 'Codeunia Pro Internship',
        description: 'Work on production-grade projects with weekly reviews and certificate.',
        type: 'Paid',
        domains: ['Web Development', 'Artificial Intelligence', 'Machine Learning'],
        levels: ['Intermediate', 'Advanced'],
        priceInr: 4999
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        applications: applications || [],
        appStructure: appStructure || [],
        completed: completed || [],
        offerings: staticInternships,
        errors: {
          appError: appError?.message,
          structError: structError?.message,
          compError: compError?.message
        },
        counts: {
          applications: applications?.length || 0,
          completed: completed?.length || 0,
          offerings: staticInternships.length
        }
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Debug failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
