'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  RefreshCw, 
  Server, 
  HardDrive,
  Cpu,
  MemoryStick,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { makeAuthenticatedRequest } from '@/lib/auth/client-admin-auth';

interface SystemInfo {
  timestamp: string;
  environment: string;
  version: string;
  nodeVersion: string;
  platform: string;
  uptime: number;
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
    loadAverage: number[];
  };
  disk: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  network: {
    interfaces: Array<{
      name: string;
      address: string;
      family: string;
    }>;
  };
}

interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  uptime: number;
  memory: number;
  cpu: number;
  lastRestart: string;
}

interface SystemLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  service: string;
}

export default function AdminSystemPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logLevel, setLogLevel] = useState('all');
  const [logService, setLogService] = useState('all');

  const fetchSystemInfo = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest('/api/admin/system-info');
      if (!response.ok) throw new Error('Failed to fetch system information');
      const data = await response.json();
      setSystemInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system information');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest('/api/admin/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (logLevel !== 'all') params.append('level', logLevel);
      if (logService !== 'all') params.append('service', logService);
      
      const response = await makeAuthenticatedRequest(`/api/admin/logs?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  }, [logLevel, logService]);

  const restartService = async (serviceName: string) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/admin/services/${serviceName}/restart`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to restart service');
      await fetchServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restart service');
    }
  };

  const stopService = async (serviceName: string) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/admin/services/${serviceName}/stop`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to stop service');
      await fetchServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop service');
    }
  };

  const startService = async (serviceName: string) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/admin/services/${serviceName}/start`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to start service');
      await fetchServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start service');
    }
  };

  useEffect(() => {
    fetchSystemInfo();
    fetchServices();
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'stopped':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'warn':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      case 'debug':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Management</h1>
          <p className="text-gray-600">Monitor and manage system resources and services</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchSystemInfo} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {systemInfo && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                    <Server className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatUptime(systemInfo.uptime)}</div>
                    <p className="text-xs text-muted-foreground">
                      Since last restart
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                    <Cpu className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemInfo.cpu.usage.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                      {systemInfo.cpu.cores} cores
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                    <MemoryStick className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemInfo.memory.percentage.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(systemInfo.memory.used)} / {formatBytes(systemInfo.memory.total)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                    <HardDrive className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemInfo.disk.percentage.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(systemInfo.disk.used)} / {formatBytes(systemInfo.disk.total)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Information</CardTitle>
                    <CardDescription>Basic system details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Environment:</span>
                      <Badge variant="outline">{systemInfo.environment}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Version:</span>
                      <span className="text-sm">{systemInfo.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Node.js:</span>
                      <span className="text-sm">{systemInfo.nodeVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Platform:</span>
                      <span className="text-sm">{systemInfo.platform}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Network Interfaces</CardTitle>
                    <CardDescription>Available network interfaces</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {systemInfo.network.interfaces.map((iface, index) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                          <span className="font-mono text-sm">{iface.name}</span>
                          <span className="text-sm">{iface.address}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>System Services</CardTitle>
                  <CardDescription>Manage and monitor system services</CardDescription>
                </div>
                <Button onClick={fetchServices} disabled={loading} variant="outline" size="sm">
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-gray-600">
                          Uptime: {formatUptime(service.uptime)} | 
                          Memory: {formatBytes(service.memory)} | 
                          CPU: {service.cpu.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">
                          Last restart: {new Date(service.lastRestart).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {service.status === 'running' ? (
                        <>
                          <Button
                            onClick={() => restartService(service.name)}
                            variant="outline"
                            size="sm"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Restart
                          </Button>
                          <Button
                            onClick={() => stopService(service.name)}
                            variant="outline"
                            size="sm"
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Stop
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => startService(service.name)}
                          variant="outline"
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>System Logs</CardTitle>
                  <CardDescription>View and filter system logs</CardDescription>
                </div>
                <div className="flex gap-2">
                  <select
                    value={logLevel}
                    onChange={(e) => setLogLevel(e.target.value)}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    <option value="all">All Levels</option>
                    <option value="error">Error</option>
                    <option value="warn">Warning</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                  </select>
                  <select
                    value={logService}
                    onChange={(e) => setLogService(e.target.value)}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    <option value="all">All Services</option>
                    <option value="api">API</option>
                    <option value="database">Database</option>
                    <option value="auth">Authentication</option>
                    <option value="cache">Cache</option>
                  </select>
                  <Button onClick={fetchLogs} disabled={loading} variant="outline" size="sm">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className={`p-3 border rounded ${getLogLevelColor(log.level)}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {log.level.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {log.service}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{log.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system parameters and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button variant="outline" size="sm">
                      Enable Maintenance Mode
                    </Button>
                    <Button variant="outline" size="sm">
                      Disable Maintenance Mode
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="log-retention">Log Retention (days)</Label>
                  <Input
                    id="log-retention"
                    type="number"
                    placeholder="30"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="backup-schedule">Backup Schedule</Label>
                  <select className="w-full mt-2 px-3 py-2 border rounded">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="maintenance-message">Maintenance Message</Label>
                  <Textarea
                    id="maintenance-message"
                    placeholder="System is currently under maintenance. Please try again later."
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-2">
                  <Button>Save Settings</Button>
                  <Button variant="outline">Reset to Defaults</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
