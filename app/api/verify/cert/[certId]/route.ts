import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Verify certificate by cert_id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certId: string }> }
) {
  const { certId } = await params;
  try {
    const supabase = await createClient();
    
    // Get certificate details
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .select(`
        *,
        assessments!certificates_assessment_id_fkey (
          title,
          description
        ),
        profiles!certificates_user_id_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .eq('cert_id', certId)
      .eq('is_valid', true)
      .single();

    if (certError || !certificate) {
      return NextResponse.json(
        { error: 'Certificate not found or invalid' },
        { status: 404 }
      );
    }

    // Check if certificate is expired
    if (certificate.expires_at && new Date(certificate.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Certificate has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      certificate,
      valid: true,
      message: 'Certificate is valid'
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}