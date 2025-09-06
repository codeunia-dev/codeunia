'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Download, Eye, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { makeAuthenticatedRequest } from '@/lib/auth/client-admin-auth';

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  message?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: HealthCheckResult[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    degraded: number;
  };
}

interface SecurityReport {
  timestamp: string;
  totalRequests: number;
  blockedRequests: number;
  rateLimitHits: number;
  csrfViolations: number;
  suspiciousActivity: number;
  topBlockedIPs: Array<{ ip: string; count: number }>;
  topViolations: Array<{ type: string; count: number }>;
}

export default function AdminReportsPage() {
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
  const [securityData, setSecurityData] = useState<SecurityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest('/api/health');
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in as an admin user.');
        }
        throw new Error('Failed to fetch health data');
      }
      const data = await response.json();
      setHealthData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest('/api/admin/security-reports');
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in as an admin user.');
        }
        throw new Error('Failed to fetch security data');
      }
      const data = await response.json();
      setSecurityData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch security data');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (type: 'health' | 'security') => {
    try {
      const endpoint = type === 'health' ? '/api/health' : '/api/admin/security-reports';
      const response = await makeAuthenticatedRequest(endpoint);
      const data = await response.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download report');
    }
  };

  useEffect(() => {
    fetchHealthData();
    fetchSecurityData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      degraded: 'secondary',
      unhealthy: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Reports</h1>
          <p className="text-gray-600">Monitor system health and security metrics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchHealthData} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Health
          </Button>
          <Button onClick={fetchSecurityData} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Security
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">Health Reports</TabsTrigger>
          <TabsTrigger value="security">Security Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          {healthData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
                    {getStatusIcon(healthData.status)}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getStatusBadge(healthData.status)}</div>
                    <p className="text-xs text-muted-foreground">
                      Uptime: {Math.round(healthData.uptime / 1000 / 60)} minutes
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Healthy Services</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {healthData.summary.healthy}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      of {healthData.summary.total} total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Degraded Services</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {healthData.summary.degraded}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      of {healthData.summary.total} total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unhealthy Services</CardTitle>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {healthData.summary.unhealthy}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      of {healthData.summary.total} total
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Service Health Details</CardTitle>
                      <CardDescription>
                        Detailed health status for each service component
                      </CardDescription>
                    </div>
                    <Button onClick={() => downloadReport('health')} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {healthData.checks.map((check, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(check.status)}
                          <div>
                            <h4 className="font-medium capitalize">{check.service.replace('-', ' ')}</h4>
                            <p className="text-sm text-gray-600">{check.message}</p>
                            {check.details && (
                              <div className="text-xs text-gray-500 mt-1">
                                {Object.entries(check.details).map(([key, value]) => (
                                  <span key={key} className="mr-4">
                                    {key}: {String(value)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{check.responseTime}ms</div>
                          <div className="text-sm text-gray-600">
                            {new Date(check.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          {securityData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <Eye className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{securityData.totalRequests.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Last 24 hours
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Blocked Requests</CardTitle>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {securityData.blockedRequests.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {((securityData.blockedRequests / securityData.totalRequests) * 100).toFixed(2)}% of total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rate Limit Hits</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {securityData.rateLimitHits.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Suspicious activity
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Top Blocked IPs</CardTitle>
                        <CardDescription>Most frequently blocked IP addresses</CardDescription>
                      </div>
                      <Button onClick={() => downloadReport('security')} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {securityData.topBlockedIPs.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                          <span className="font-mono text-sm">{item.ip}</span>
                          <Badge variant="destructive">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Violations</CardTitle>
                    <CardDescription>Types of security violations detected</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {securityData.topViolations.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                          <span className="text-sm capitalize">{item.type.replace('_', ' ')}</span>
                          <Badge variant="secondary">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
