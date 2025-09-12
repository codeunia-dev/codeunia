import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


interface BulkEmailData {
  certificates: Array<{
    certId: string;
    email: string;
    name: string;
    certificateUrl: string;
  }>;
  context: 'test' | 'event' | 'hackathon';
}

export async function POST(request: NextRequest) {
  try {
    const { certificates, context }: BulkEmailData = await request.json();
    
    if (!certificates || certificates.length === 0) {
      return NextResponse.json(
        { error: 'No certificates provided' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const sentEmails = [];
    const errors = [];

    // Send emails for each certificate
    for (const cert of certificates) {
      try {
        const response = await fetch(`/api/certificates/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cert.email,
            name: cert.name,
            certificateUrl: cert.certificateUrl,
            certId: cert.certId,
            context
          })
        });

        if (!response.ok) {
          throw new Error('Failed to send email');
        }

        // Update certificate record to mark as sent
        const { error: updateError } = await supabase
          .from('certificates')
          .update({ sent_via_email: true })
          .eq('cert_id', cert.certId);

        if (updateError) {
          console.error('Error updating certificate email status:', updateError);
        }

        sentEmails.push({
          certId: cert.certId,
          email: cert.email,
          name: cert.name
        });

        // Small delay to avoid overwhelming the email service
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error sending email for ${cert.name}:`, error);
        errors.push({
          certId: cert.certId,
          name: cert.name,
          email: cert.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentEmails.length,
      total: certificates.length,
      sentEmails,
      errors
    });

  } catch (error) {
    console.error('Bulk email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    );
  }
} 