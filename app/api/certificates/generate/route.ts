import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { activityService } from '@/lib/services/activity';

interface CertificateData {
  templateUrl: string;
  placeholders: Record<string, string>;
  configs: Record<string, {
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    maxWidth?: number;
    textAlign?: 'left' | 'center' | 'right';
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { templateUrl, placeholders, configs }: CertificateData = await request.json();
    
    if (!templateUrl || !placeholders) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For now, we'll create a simple certificate by returning the template URL
    // In a production environment, you would process the image/PDF with text overlay
    
    // Generate a unique certificate ID
    const certId = `CERT-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Create a simple certificate URL (for now, just return the template)
    // In a real implementation, you would:
    // 1. Download the template
    // 2. Process it with text overlay using a library like sharp or jimp
    // 3. Upload the processed certificate
    // 4. Return the new URL
    
    const certificateUrl = templateUrl; // For now, just use the template URL
    
    // Upload a placeholder certificate (in real implementation, this would be the processed image)
    const fileName = `certificates/${certId}.png`;
    
    // Log activity for points
    try {
      await activityService.logActivity(user.id, 'certificate_earned', { 
        cert_id: certId,
        template_url: templateUrl,
        placeholders
      });
      console.log(`✅ Activity logged: certificate_earned for user ${user.id} with cert ${certId}`);
    } catch (activityError) {
      console.error('❌ Failed to log certificate earned activity:', activityError);
      // Don't fail the certificate generation if activity logging fails
    }
    
    // For now, we'll just return the template URL as the certificate
    // In production, you would process the template and upload the result
    
    return NextResponse.json({ 
      certificateUrl: certificateUrl,
      certId: certId,
      message: 'Certificate generated successfully (using template as placeholder)'
    });

  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
} 