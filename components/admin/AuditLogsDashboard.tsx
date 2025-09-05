'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Shield
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface AuditLog {
  id: string;
  admin_id: string;
  action_type: string;
  target_resource: string;
  target_id?: string;
  metadata: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  admin_name: string;
  admin_email: string;
}

interface AuditStats {
  total_actions: number;
  actions_by_type: Record<string, number>;
  actions_by_admin: Array<{ admin_id: string; admin_name: string; count: number }>;
  recent_actions: number;
  period_days: number;
  generated_at: string;
}

// interface AuditLogResponse {
//   logs: AuditLog[];
//   total: number;
//   has_more: boolean;
// }

const ACTION_TYPE_COLORS: Record<string, string> = {
  'user_created': 'bg-green-100 text-green-800',
  'user_updated': 'bg-blue-100 text-blue-800',
  'user_deleted': 'bg-red-100 text-red-800',
  'user_role_changed': 'bg-yellow-100 text-yellow-800',
  'premium_membership_granted': 'bg-purple-100 text-purple-800',
  'premium_membership_revoked': 'bg-orange-100 text-orange-800',
  'premium_membership_updated': 'bg-indigo-100 text-indigo-800',
  'hackathon_created': 'bg-green-100 text-green-800',
  'hackathon_updated': 'bg-blue-100 text-blue-800',
  'hackathon_deleted': 'bg-red-100 text-red-800',
  'hackathon_published': 'bg-emerald-100 text-emerald-800',
  'certificate_generated': 'bg-cyan-100 text-cyan-800',
  'certificate_sent': 'bg-teal-100 text-teal-800',
  'certificate_revoked': 'bg-red-100 text-red-800',
  'system_config_updated': 'bg-gray-100 text-gray-800',
  'system_maintenance': 'bg-yellow-100 text-yellow-800',
  'system_backup': 'bg-blue-100 text-blue-800',
  'admin_login': 'bg-green-100 text-green-800',
  'admin_logout': 'bg-gray-100 text-gray-800',
  'security_event': 'bg-red-100 text-red-800',
  'suspicious_activity': 'bg-red-100 text-red-800',
  'rate_limit_exceeded': 'bg-orange-100 text-orange-800',
  'webhook_processed': 'bg-purple-100 text-purple-800',
  'api_access': 'bg-blue-100 text-blue-800',
  'admin_action': 'bg-indigo-100 text-indigo-800'
};

const ACTION_TYPES = [
  'user_created', 'user_updated', 'user_deleted', 'user_role_changed',
  'premium_membership_granted', 'premium_membership_revoked', 'premium_membership_updated',
  'hackathon_created', 'hackathon_updated', 'hackathon_deleted', 'hackathon_published',
  'certificate_generated', 'certificate_sent', 'certificate_revoked',
  'system_config_updated', 'system_maintenance', 'system_backup',
  'admin_login', 'admin_logout', 'security_event', 'suspicious_activity',
  'rate_limit_exceeded', 'webhook_processed', 'api_access', 'admin_action'
];

export default function AuditLogsDashboard() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    action_type: '',
    target_resource: '',
    start_date: '',
    end_date: '',
    limit: 50
  });
  const [pagination, setPagination] = useState({
    offset: 0,
    has_more: false,
    total: 0
  });

  const fetchLogs = useCallback(async (resetPagination = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.action_type) params.append('action_type', filters.action_type);
      if (filters.target_resource) params.append('target_resource', filters.target_resource);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      params.append('limit', filters.limit.toString());
      
      const offset = resetPagination ? 0 : pagination.offset;
      params.append('offset', offset.toString());

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch audit logs');
      }

      if (resetPagination) {
        setLogs(data.data.logs);
        setPagination({
          offset: 0,
          has_more: data.data.has_more,
          total: data.data.total
        });
      } else {
        setLogs(prev => [...prev, ...data.data.logs]);
        setPagination(prev => ({
          ...prev,
          has_more: data.data.has_more,
          total: data.data.total
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.offset]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/audit-logs/stats?period_days=30');
      const data = await response.json();

      if (response.ok) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch audit stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchLogs(true);
    fetchStats();
  }, [fetchLogs, fetchStats]);

  const handleFilterChange = (key: string, value: string) => {
    // Convert "all" back to empty string for filtering
    const filterValue = value === 'all' ? '' : value;
    setFilters(prev => ({ ...prev, [key]: filterValue }));
  };

  const applyFilters = () => {
    fetchLogs(true);
  };

  const clearFilters = () => {
    setFilters({
      action_type: '',
      target_resource: '',
      start_date: '',
      end_date: '',
      limit: 50
    });
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const loadMore = () => {
    setPagination(prev => ({ ...prev, offset: prev.offset + filters.limit }));
    fetchLogs(false);
  };

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.action_type) params.append('action_type', filters.action_type);
      if (filters.target_resource) params.append('target_resource', filters.target_resource);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      params.append('limit', '1000'); // Export more records

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await response.json();

      if (response.ok) {
        const csv = convertToCSV(data.data.logs);
        downloadCSV(csv, `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      }
    } catch (err) {
      console.error('Failed to export logs:', err);
    }
  };

  const convertToCSV = (logs: AuditLog[]): string => {
    const headers = [
      'ID', 'Admin Name', 'Admin Email', 'Action Type', 'Target Resource', 
      'Target ID', 'IP Address', 'User Agent', 'Created At', 'Metadata'
    ];
    
    const rows = logs.map(log => [
      log.id,
      log.admin_name,
      log.admin_email,
      log.action_type,
      log.target_resource,
      log.target_id || '',
      log.ip_address || '',
      log.user_agent || '',
      log.created_at,
      JSON.stringify(log.metadata)
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getActionIcon = (actionType: string) => {
    if (actionType.includes('created') || actionType.includes('granted')) return <CheckCircle className="h-4 w-4" />;
    if (actionType.includes('deleted') || actionType.includes('revoked')) return <AlertTriangle className="h-4 w-4" />;
    if (actionType.includes('updated') || actionType.includes('changed')) return <RefreshCw className="h-4 w-4" />;
    if (actionType.includes('security') || actionType.includes('suspicious')) return <Shield className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Audit Logs</h2>
          <p className="text-gray-400">Monitor and track all admin actions and system events</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchLogs(true)} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="action_type" className="text-white">Action Type</Label>
                  <Select value={filters.action_type || 'all'} onValueChange={(value) => handleFilterChange('action_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All actions</SelectItem>
                      {ACTION_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target_resource" className="text-white">Target Resource</Label>
                  <Input
                    id="target_resource"
                    placeholder="e.g., user:123"
                    value={filters.target_resource}
                    onChange={(e) => handleFilterChange('target_resource', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="limit" className="text-white">Results per page</Label>
                  <Select value={filters.limit.toString()} onValueChange={(value) => handleFilterChange('limit', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date" className="text-white">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="end_date" className="text-white">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={applyFilters} size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
                <Button onClick={clearFilters} variant="outline" size="sm">
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Audit Logs</CardTitle>
              <CardDescription className="text-gray-400">
                Showing {logs.length} of {pagination.total} total logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Loading audit logs...
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No audit logs found matching your criteria.
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-white">Action</TableHead>
                        <TableHead className="text-white">Admin</TableHead>
                        <TableHead className="text-white">Target</TableHead>
                        <TableHead className="text-white">IP Address</TableHead>
                        <TableHead className="text-white">Timestamp</TableHead>
                        <TableHead className="text-white">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.action_type)}
                              <Badge className={ACTION_TYPE_COLORS[log.action_type] || 'bg-gray-100 text-gray-800'}>
                                {log.action_type.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-white">{log.admin_name}</div>
                              <div className="text-sm text-gray-400">{log.admin_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-white">{log.target_resource}</div>
                              {log.target_id && (
                                <div className="text-sm text-gray-400">ID: {log.target_id}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {log.ip_address || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="text-white">{format(new Date(log.created_at), 'MMM dd, yyyy')}</div>
                              <div className="text-gray-400">{format(new Date(log.created_at), 'HH:mm:ss')}</div>
                              <div className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {Object.keys(log.metadata).length > 0 && (
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {pagination.has_more && (
                    <div className="flex justify-center">
                      <Button onClick={loadMore} variant="outline" disabled={loading}>
                        {loading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Load More'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Total Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.total_actions}</div>
                  <p className="text-xs text-gray-400">Last {stats.period_days} days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Recent Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.recent_actions}</div>
                  <p className="text-xs text-gray-400">Last 24 hours</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Active Admins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.actions_by_admin.length}</div>
                  <p className="text-xs text-gray-400">Unique admins</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Action Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{Object.keys(stats.actions_by_type).length}</div>
                  <p className="text-xs text-gray-400">Different types</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Loading statistics...
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
