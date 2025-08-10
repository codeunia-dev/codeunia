
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2, ShieldAlert } from 'lucide-react';

// Define the structure of the certificate data we expect from the API
type CertificateData = {
  domain: string;
  start_date: string;
  end_date: string;
  project_name: string;
  profiles: {
    first_name: string;
    last_name: string;
  } | null;
};

function VerificationCard() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);

  useEffect(() => {
    if (!code) {
      setError('No verification code provided.');
      setLoading(false);
      return;
    }

    async function verifyCertificate() {
      try {
        setLoading(true);
        const res = await fetch(`/api/verify-certificate?code=${code}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Verification failed.');
        }

        setCertificate(data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }

    verifyCertificate();
  }, [code]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Verifying certificate...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-lg">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Verification Failed</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (certificate) {
    const fullName = `${certificate.profiles?.first_name || ''} ${certificate.profiles?.last_name || ''}`.trim();
    return (
      <Card className="max-w-lg w-full shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <div>
              <CardTitle className="text-2xl">Certificate Verified</CardTitle>
              <CardDescription>This is an authentic certificate issued by Codeunia.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="font-medium text-muted-foreground col-span-1">Recipient</span>
                <span className="font-semibold text-lg col-span-2">{fullName || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="font-medium text-muted-foreground col-span-1">Internship Domain</span>
                <span className="col-span-2">{certificate.domain}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="font-medium text-muted-foreground col-span-1">Project Name</span>
                <span className="col-span-2">{certificate.project_name || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="font-medium text-muted-foreground col-span-1">Completion Date</span>
                <span className="col-span-2">{new Date(certificate.end_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

export default function VerifyPage() {
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-4 bg-muted">
        <Suspense fallback={<div>Loading...</div>}>
            <VerificationCard />
        </Suspense>
    </div>
  );
}
