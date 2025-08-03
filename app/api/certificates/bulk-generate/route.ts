import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface BulkCertificateData {
  templateId: string;
  participants: Array<{
    id: string;
    name: string;
    email: string;
    score?: number;
    rank?: number;
    eventName?: string;
    testName?: string;
    hackathonName?: string;
    cert_id: string;
    institution?: string;
    department?: string;
    experience_level?: string;
    total_registrations?: number;
    organizer?: string;
    duration?: string;
  }>;
  context: 'test' | 'event' | 'hackathon';
  customMessage?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { templateId, participants, context, customMessage }: BulkCertificateData = await request.json();
    
    if (!templateId || !participants || participants.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get template details
    const { data: template, error: templateError } = await supabase
      .from('certificate_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const generatedCertificates = [];
    const errors = [];

    // Generate certificates for each participant
    for (const participant of participants) {
      try {
        // Generate QR code
        const verificationUrl = `/verify/cert/${participant.cert_id}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;

        // Create certificate data
        const certificateData = {
          templateUrl: template.template_url,
          placeholders: {
            '{name}': participant.name,
            '{email}': participant.email,
            '{event_name}': participant.eventName || participant.testName || participant.hackathonName || '',
            '{score}': participant.score?.toString() || 'N/A',
            '{date}': new Date().toLocaleDateString(),
            '{cert_id}': participant.cert_id,
            '{qr_code}': qrCodeUrl,
            '{organizer}': participant.organizer || 'CodeUnia',
            '{total_registrations}': participant.total_registrations?.toString() || '100+',
            '{duration}': participant.duration || '60 minutes',
            '{institution}': participant.institution || 'N/A',
            '{department}': participant.department || 'N/A',
            '{experience_level}': participant.experience_level || 'N/A',
            '{rank}': participant.rank?.toString() || 'N/A'
          },
          configs: {
            '{name}': { x: 400, y: 300, fontSize: 48, fontFamily: 'Arial', color: '#000000', textAlign: 'center' },
            '{email}': { x: 400, y: 350, fontSize: 24, fontFamily: 'Arial', color: '#666666', textAlign: 'center' },
            '{event_name}': { x: 400, y: 400, fontSize: 36, fontFamily: 'Arial', color: '#000000', textAlign: 'center' },
            '{score}': { x: 400, y: 450, fontSize: 36, fontFamily: 'Arial', color: '#000000', textAlign: 'center' },
            '{date}': { x: 400, y: 500, fontSize: 24, fontFamily: 'Arial', color: '#666666', textAlign: 'center' },
            '{cert_id}': { x: 400, y: 550, fontSize: 18, fontFamily: 'Courier', color: '#999999', textAlign: 'center' },
            '{qr_code}': { x: 700, y: 500, fontSize: 0, fontFamily: 'Arial', color: '#000000' },
            '{organizer}': { x: 400, y: 600, fontSize: 20, fontFamily: 'Arial', color: '#666666', textAlign: 'center' },
            '{total_registrations}': { x: 400, y: 650, fontSize: 20, fontFamily: 'Arial', color: '#666666', textAlign: 'center' },
            '{duration}': { x: 400, y: 700, fontSize: 20, fontFamily: 'Arial', color: '#666666', textAlign: 'center' },
            '{institution}': { x: 400, y: 750, fontSize: 20, fontFamily: 'Arial', color: '#666666', textAlign: 'center' },
            '{department}': { x: 400, y: 800, fontSize: 20, fontFamily: 'Arial', color: '#666666', textAlign: 'center' },
            '{experience_level}': { x: 400, y: 850, fontSize: 20, fontFamily: 'Arial', color: '#666666', textAlign: 'center' },
            '{rank}': { x: 400, y: 900, fontSize: 20, fontFamily: 'Arial', color: '#666666', textAlign: 'center' }
          }
        };

        // Generate certificate
        const response = await fetch(`/api/certificates/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(certificateData)
        });

        if (!response.ok) {
          throw new Error('Failed to generate certificate');
        }

        const { certificateUrl } = await response.json();

        // Save certificate record
        const { error: saveError } = await supabase
          .from('certificates')
          .insert({
            cert_id: participant.cert_id,
            template_id: templateId,
            certificate_url: certificateUrl,
            qr_code_url: qrCodeUrl,
            issued_at: new Date().toISOString(),
            is_valid: true,
            sent_via_email: false
          });

        if (saveError) {
          console.error('Error saving certificate:', saveError);
        }

        generatedCertificates.push({
          participantId: participant.id,
          certId: participant.cert_id,
          certificateUrl,
          qrCodeUrl
        });

        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`Error generating certificate for ${participant.name}:`, error);
        errors.push({
          participantId: participant.id,
          name: participant.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      generated: generatedCertificates.length,
      total: participants.length,
      certificates: generatedCertificates,
      errors: errors
    });

  } catch (error) {
    console.error('Bulk certificate generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificates' },
      { status: 500 }
    );
  }
} 