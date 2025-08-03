import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, User, Calendar, Award, Download, QrCode } from 'lucide-react';
import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/optimized-image'

interface CertificateData {
  certificate: {
    id: string;
    cert_id: string;
    issued_at: string;
    expires_at?: string;
    is_valid: boolean;
    certificate_url?: string;
    qr_code_url?: string;
  };
  assessment: {
    title: string;
    description?: string;
  };
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface PageProps {
  params: Promise<{ certId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { certId } = await params;
  return {
    title: `Certificate Verification - ${certId} | CodeUnia`,
    description: 'Verify the authenticity of a CodeUnia certificate',
  };
}

async function getCertificateData(certId: string): Promise<CertificateData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/verify/cert/${certId}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching certificate:', error);
    return null;
  }
}

export default async function CertificateVerificationPage({ params }: PageProps) {
  const { certId } = await params;
  const certificateData = await getCertificateData(certId);

  if (!certificateData) {
    notFound();
  }

  const { certificate, assessment, user } = certificateData;
  const isExpired = certificate.expires_at && new Date(certificate.expires_at) < new Date();
  const isValid = certificate.is_valid && !isExpired;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Certificate Verification
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Verify the authenticity of this CodeUnia certificate
            </p>
          </div>

          {/* Certificate Status */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Certificate Status</CardTitle>
                <Badge 
                  variant={isValid ? "default" : "destructive"}
                  className="text-lg px-4 py-2"
                >
                  {isValid ? (
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Valid</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>{isExpired ? 'Expired' : 'Invalid'}</span>
                    </div>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Certificate Holder</p>
                      <p className="font-semibold">{user.first_name} {user.last_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Assessment</p>
                      <p className="font-semibold">{assessment.title}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Issued Date</p>
                      <p className="font-semibold">
                        {new Date(certificate.issued_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {certificate.expires_at && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Expiry Date</p>
                        <p className="font-semibold">
                          {new Date(certificate.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <QrCode className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Certificate ID</p>
                      <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {certificate.cert_id}
                      </p>
                    </div>
                  </div>
                  
                  {certificate.qr_code_url && (
                    <div className="flex items-center space-x-3">
                      <QrCode className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">QR Code</p>
                        <OptimizedImage
                          src={certificate.qr_code_url}
                          alt="Certificate QR Code"
                          width={80}
                          height={80}
                          className="w-20 h-20 border rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificate Preview */}
          {certificate.certificate_url && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Certificate Preview</span>
                  <Button asChild>
                    <a href={certificate.certificate_url} download>
                      <Download className="w-4 h-4 mr-2" />
                      Download Certificate
                    </a>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-white">
                  <iframe
                    src={certificate.certificate_url}
                    className="w-full h-96 border-0"
                    title="Certificate Preview"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assessment Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{assessment.title}</h3>
                  {assessment.description && (
                    <p className="text-gray-600 dark:text-gray-300">{assessment.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Info */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <p>
                  This certificate has been verified against our secure database. 
                  The certificate ID is unique and cannot be duplicated.
                </p>
                <p>
                  If you have any concerns about the authenticity of this certificate, 
                  please contact us at{' '}
                  <a href="mailto:support@codeunia.com" className="text-primary hover:underline">
                    support@codeunia.com
                  </a>
                </p>
                <p>
                  Certificate verification URL: {process.env.NEXT_PUBLIC_SITE_URL}/verify/cert/{certificate.cert_id}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/">
                Back to CodeUnia
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 