'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, TrendingUp, Users, Activity, Database, Shield, Clock, AlertTriangle } from 'lucide-react';
import { makeAuthenticatedRequest } from '@/lib/auth/client-admin-auth';

interface SystemStats {
  timestamp: string;
  performance: {
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
  };
  users: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    usersOnline: number;
  };
  database: {
    totalQueries: number;
    slowQueries: number;
    connectionPool: {
      active: number;
      idle: number;
      total: number;
    };
    cacheHitRate: number;
  };
  system: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    uptime: number;
  };
}

interface PerformanceMetrics {
  timestamp: string;
  metrics: Array<{
    name: string;
    value: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
  }>;
}

export default function AdminStatisticsPage() {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [error, setError] = useState<string | null>(null);

  const fetchSystemStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(`/api/admin/statistics?range=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch system statistics');
      const data = await response.json();
      setSystemStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system statistics');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const fetchPerformanceMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(`/api/admin/performance-metrics?range=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch performance metrics');
      const data = await response.json();
      setPerformanceMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch performance metrics');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchSystemStats();
    fetchPerformanceMetrics();
  }, [timeRange, fetchSystemStats, fetchPerformanceMetrics]);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Statistics</h1>
          <p className="text-gray-600">Monitor system performance and usage metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchSystemStats} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {systemStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.performance.averageResponseTime}ms</div>
                  <p className="text-xs text-muted-foreground">
                    P95: {systemStats.performance.p95ResponseTime}ms
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.users.activeUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {systemStats.users.usersOnline} online now
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Database Queries</CardTitle>
                  <Database className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.database.totalQueries.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {systemStats.database.slowQueries} slow queries
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                  <Shield className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatUptime(systemStats.system.uptime)}</div>
                  <p className="text-xs text-muted-foreground">
                    CPU: {systemStats.system.cpuUsage}%
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {performanceMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {performanceMetrics.metrics.map((metric, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                    {getTrendIcon(metric.trend)}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metric.value.toLocaleString()} {metric.unit}
                    </div>
                    <p className={`text-xs ${getTrendColor(metric.trend)}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}% from last period
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {systemStats && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Details</CardTitle>
                <CardDescription>Detailed performance metrics for the selected time range</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Response Time</span>
                      <span className="font-mono">{systemStats.performance.averageResponseTime}ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">P95 Response Time</span>
                      <span className="font-mono">{systemStats.performance.p95ResponseTime}ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">P99 Response Time</span>
                      <span className="font-mono">{systemStats.performance.p99ResponseTime}ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Requests per Second</span>
                      <span className="font-mono">{systemStats.performance.requestsPerSecond.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Error Rate</span>
                      <Badge variant={systemStats.performance.errorRate > 5 ? 'destructive' : 'default'}>
                        {systemStats.performance.errorRate.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {systemStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.users.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    All registered users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Activity className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.users.activeUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Last 30 days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Users Today</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.users.newUsersToday.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Users Online</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.users.usersOnline.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently active
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          {systemStats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
                    <Database className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats.database.totalQueries.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Last {timeRange}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Slow Queries</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats.database.slowQueries.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      &gt; 1000ms
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats.database.cacheHitRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                      Cache efficiency
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
                    <Activity className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats.database.connectionPool.active}</div>
                    <p className="text-xs text-muted-foreground">
                      of {systemStats.database.connectionPool.total} total
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Database Connection Pool</CardTitle>
                  <CardDescription>Current database connection status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {systemStats.database.connectionPool.active}
                      </div>
                      <div className="text-sm text-gray-600">Active</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {systemStats.database.connectionPool.idle}
                      </div>
                      <div className="text-sm text-gray-600">Idle</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">
                        {systemStats.database.connectionPool.total}
                      </div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          {systemStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                  <Activity className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.system.cpuUsage}%</div>
                  <p className="text-xs text-muted-foreground">
                    Current usage
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                  <Database className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.system.memoryUsage}%</div>
                  <p className="text-xs text-muted-foreground">
                    RAM utilization
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                  <Shield className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.system.diskUsage}%</div>
                  <p className="text-xs text-muted-foreground">
                    Storage utilization
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatUptime(systemStats.system.uptime)}</div>
                  <p className="text-xs text-muted-foreground">
                    System uptime
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
