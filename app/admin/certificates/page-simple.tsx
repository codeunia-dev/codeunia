'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api-fetch';

interface Certificate {
  id: string;
  cert_id: string;
  issued_at: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
}

interface Template {
  id: string;
  name: string;
}

export default function CertificatesPageSimple() {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching certificates data...');
      
      // Fetch certificates data
      const dataResponse = await apiFetch('/api/admin/certificates/data');
      console.log('Data response status:', dataResponse.status);
      
      if (dataResponse.ok) {
        const data = await dataResponse.json();
        setCertificates(data.certificates || []);
        setTemplates(data.templates || []);
        console.log('Certificates:', data.certificates?.length || 0);
        console.log('Templates:', data.templates?.length || 0);
      } else {
        console.error('Data API failed:', dataResponse.status);
        toast.error('Failed to fetch certificates data');
      }

      // Fetch participants
      const participantsResponse = await apiFetch('/api/admin/certificates/participants');
      console.log('Participants response status:', participantsResponse.status);
      
      if (participantsResponse.ok) {
        const participantsData = await participantsResponse.json();
        setParticipants(participantsData || []);
        console.log('Participants:', participantsData?.length || 0);
      } else {
        console.error('Participants API failed:', participantsResponse.status);
        toast.error('Failed to fetch participants');
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Certificates Management</h1>
        <p className="text-muted-foreground">
          Manage and generate certificates for participants
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Certificates</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{certificates.length}</div>
            <p className="text-muted-foreground">Total certificates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Participants</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{participants.length}</div>
            <p className="text-muted-foreground">Eligible participants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Templates</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{templates.length}</div>
            <p className="text-muted-foreground">Available templates</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <p className="text-muted-foreground">No certificates found</p>
          ) : (
            <div className="space-y-4">
              {certificates.slice(0, 5).map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{cert.cert_id}</p>
                    <p className="text-sm text-muted-foreground">
                      Issued: {new Date(cert.issued_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8">
        <Button onClick={fetchData} variant="outline">
          Refresh Data
        </Button>
      </div>
    </div>
  );
} 