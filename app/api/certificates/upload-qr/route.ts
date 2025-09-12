import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


// Create Supabase client function to avoid build-time initialization
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { certId, qrCodeDataUrl } = await request.json();

    if (!certId || !qrCodeDataUrl) {
      return NextResponse.json(
        { error: 'Certificate ID and QR code data URL are required' },
        { status: 400 }
      );
    }

    // Validate and convert data URL to blob (SSRF protection)
    if (!qrCodeDataUrl.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid QR code data URL format' },
        { status: 400 }
      );
    }
    
    // Additional validation for data URL format
    const dataUrlPattern = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/i;
    if (!dataUrlPattern.test(qrCodeDataUrl)) {
      return NextResponse.json(
        { error: 'Invalid image format in data URL' },
        { status: 400 }
      );
    }
    
    // Convert data URL to blob (safe - no external requests)
    const qrCodeBlob = await fetch(qrCodeDataUrl).then(r => r.blob());
    const qrFileName = `qr-codes/${certId}.png`;
    
    // Upload QR code to storage
    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(qrFileName, qrCodeBlob);

    if (uploadError) {
      console.error('QR upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload QR code' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('certificates')
      .getPublicUrl(qrFileName);

    return NextResponse.json({
      success: true,
      qrCodeUrl: publicUrl
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 