'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Bell,
  RefreshCw,
  Eye,
  Zap,
  Shield,
  Server
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface MonitoringAlert {
  id: string;
  type: 'health_check_failure' | 'performance_degradation' | 'security_incident' | 'system_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  service?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  resolved_at?: string;
  status: 'active' | 'resolved' | 'acknowledged';
}

interface MonitoringStats {
  total_alerts: number;
  active_alerts: number;
  alerts_by_type: Record<string, number>;
  alerts_by_severity: Record<string, number>;
  recent_alerts: number;
}

const SEVERITY_COLORS: Record<string, string> = {
  'critical': 'bg-red-100 text-red-800 border-red-200',
  'high': 'bg-orange-100 text-orange-800 border-orange-200',
  'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'low': 'bg-green-100 text-green-800 border-green-200'
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'health_check_failure': Server,
  'performance_degradation': Zap,
  'security_incident': Shield,
  'system_error': AlertTriangle
};

const STATUS_COLORS: Record<string, string> = {
  'active': 'bg-red-100 text-red-800',
  'acknowledged': 'bg-yellow-100 text-yellow-800',
  'resolved': 'bg-green-100 text-green-800'
};

export default function MonitoringDashboard() {
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: '',
    type: '',
    severity: ''
  });

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.type) params.append('type', filter.type);
      if (filter.severity) params.append('severity', filter.severity);

      const response = await fetch(`/api/admin/monitoring/alerts?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch monitoring alerts');
      }

      setAlerts(data.data.alerts);
      setStats({
        total_alerts: data.data.total,
        active_alerts: data.data.active,
        alerts_by_type: {},
        alerts_by_severity: {},
        recent_alerts: 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const updateAlert = async (alertId: string, action: 'acknowledge' | 'resolve') => {
    try {
      const response = await fetch('/api/admin/monitoring/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alert_id: alertId,
          action
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update alert');
      }

      // Refresh alerts
      fetchAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update alert');
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filter, fetchAlerts]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    const IconComponent = TYPE_ICONS[type] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Monitoring & Alerts</h2>
          <p className="text-gray-400">Monitor system health and manage alerts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAlerts} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total_alerts}</div>
              <p className="text-xs text-gray-400">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{stats.active_alerts}</div>
              <p className="text-xs text-gray-400">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Critical Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {alerts.filter(a => a.severity === 'critical' && a.status === 'active').length}
              </div>
              <p className="text-xs text-gray-400">High priority</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Resolved Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {alerts.filter(a => 
                  a.status === 'resolved' && 
                  a.resolved_at && 
                  new Date(a.resolved_at).toDateString() === new Date().toDateString()
                ).length}
              </div>
              <p className="text-xs text-gray-400">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Status</label>
                  <select
                    value={filter.status || 'all'}
                    onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value === 'all' ? '' : e.target.value }))}
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Type</label>
                  <select
                    value={filter.type || 'all'}
                    onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value === 'all' ? '' : e.target.value }))}
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="health_check_failure">Health Check Failure</option>
                    <option value="performance_degradation">Performance Degradation</option>
                    <option value="security_incident">Security Incident</option>
                    <option value="system_error">System Error</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Severity</label>
                  <select
                    value={filter.severity || 'all'}
                    onChange={(e) => setFilter(prev => ({ ...prev, severity: e.target.value === 'all' ? '' : e.target.value }))}
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Monitoring Alerts</CardTitle>
              <CardDescription className="text-gray-400">
                {alerts.length} alerts found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Loading alerts...
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No alerts found matching your criteria.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">Alert</TableHead>
                      <TableHead className="text-white">Service</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Timestamp</TableHead>
                      <TableHead className="text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(alert.type)}
                              {getSeverityIcon(alert.severity)}
                              <span className="font-medium text-white">{alert.title}</span>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={SEVERITY_COLORS[alert.severity]}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-gray-400">
                                {alert.type.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">{alert.message}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {alert.service || 'System'}
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[alert.status]}>
                            {alert.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-white">{format(new Date(alert.created_at), 'MMM dd, yyyy')}</div>
                            <div className="text-gray-400">{format(new Date(alert.created_at), 'HH:mm:ss')}</div>
                            <div className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {alert.status === 'active' && (
                              <>
                                <Button
                                  onClick={() => updateAlert(alert.id, 'acknowledge')}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Bell className="h-4 w-4 mr-1" />
                                  Ack
                                </Button>
                                <Button
                                  onClick={() => updateAlert(alert.id, 'resolve')}
                                  variant="outline"
                                  size="sm"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Resolve
                                </Button>
                              </>
                            )}
                            {alert.status === 'acknowledged' && (
                              <Button
                                onClick={() => updateAlert(alert.id, 'resolve')}
                                variant="outline"
                                size="sm"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Resolve
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Alert History</CardTitle>
              <CardDescription className="text-gray-400">
                Complete history of all monitoring alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                Alert history view would be implemented here with additional filtering and pagination.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
