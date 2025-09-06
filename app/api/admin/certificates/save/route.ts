import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client function to avoid build-time initialization
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Define the type for certificate data
interface CertificateData {
  cert_id: string;
  template_id: string;
  certificate_url?: string;
  user_id?: string;
  event_type?: string;
  event_title?: string;
  score?: number;
  status?: string;
  issued_at?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    // Check if request has content
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.text();
    if (!body) {
      return NextResponse.json(
        { error: 'Request body is empty' },
        { status: 400 }
      );
    }

    let data;
    try {
      data = JSON.parse(body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const {
      cert_id,
      template_id,
      certificate_url,
      user_id,
      event_type,
      event_title,
      score,
      status = 'active',
      issued_at
    } = data;

    if (!cert_id || !template_id || !certificate_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save certificate record with typed fields
    const certificateData: CertificateData = {
      cert_id,
      template_id
    };

    // Add optional fields if they exist
    if (certificate_url) certificateData.certificate_url = certificate_url;
    if (user_id) certificateData.user_id = user_id;
    if (issued_at) certificateData.issued_at = issued_at;
    if (event_type) certificateData.event_type = event_type;
    if (event_title) certificateData.event_title = event_title;
    if (score) certificateData.score = score;
    if (status) certificateData.status = status;

    const { data: certificate, error } = await supabase
      .from('certificates')
      .insert(certificateData)
      .select()
      .single();

    if (error) {
      console.error('Error saving certificate:', error);
      return NextResponse.json(
        { error: 'Failed to save certificate' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      certificate
    });

  } catch (error) {
    console.error('Certificate save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}