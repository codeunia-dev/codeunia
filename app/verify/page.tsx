'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2, ShieldCheck, Award, Calendar, User, Briefcase, FileText, Link } from 'lucide-react';

// Define the structure of the certificate data we expect from the API
type CertificateData = {
  domain: string;
  start_date: string;
  end_date: string;
  project_name: string;
  project_url: string; // Added project_url
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
      <div className="flex flex-col items-center justify-center gap-6 min-h-[300px]">
        <div className="flex items-center justify-center w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Verifying Certificate</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Please wait while we validate the certificate</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md w-full">
        <Alert variant="destructive" className="border-red-200 shadow-sm">
          <XCircle className="h-4 w-4" />
          <AlertTitle className="font-semibold">Verification Failed</AlertTitle>
          <AlertDescription className="mt-1">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (certificate) {
    const fullName = `${certificate.profiles?.first_name || ''} ${certificate.profiles?.last_name || ''}`.trim();
    return (
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Certificate Verified</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">This certificate has been authenticated by Codeunia</p>
          <Badge variant="outline" className="mt-3 border-green-200 text-green-800 dark:text-green-200">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Authentic Certificate
          </Badge>
        </div>

        {/* Certificate Details */}
        <Card className="shadow-sm border border-gray-200 dark:border-gray-800">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">Internship Completion Certificate</CardTitle>
                <CardDescription>Official certificate of completion</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Recipient */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Certificate Holder</dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{fullName || 'Not Available'}</dd>
                </div>
              </div>

              {/* Domain */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Domain</dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{certificate.domain}</dd>
                </div>
              </div>

              {/* Project */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Project</dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{certificate.project_name || 'Not Specified'}</dd>
                </div>
              </div>

              {/* Project URL */}
              {certificate.project_url && (
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Link className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Project URL</dt>
                    <dd className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-1">
                      <a href={certificate.project_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {certificate.project_url}
                      </a>
                    </dd>
                  </div>
                </div>
              )}

              {/* Completion Date */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Date</dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                    {new Date(certificate.end_date).toLocaleDateString(undefined, { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </dd>
                </div>
              </div>
            </div>

            {/* Verification Info */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified on {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading verification system...</span>
        </div>
      }>
        <VerificationCard />
      </Suspense>
    </div>
  );
}