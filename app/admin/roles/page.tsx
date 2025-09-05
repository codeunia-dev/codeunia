'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  Shield, 
  UserPlus, 
  UserMinus, 
  Edit, 
  Trash2,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Crown,
  User,
  UserCheck
} from 'lucide-react';
import { makeAuthenticatedRequest } from '@/lib/auth/client-admin-auth';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  permissions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  createdAt: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface AuditLog {
  id: string;
  admin_id: string;
  action_type: string;
  target_resource: string;
  target_id?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  admin_name: string;
  admin_email: string;
}

export default function AdminRolesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showEditUser, setShowEditUser] = useState<string | null>(null);

  // Form states
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const [editUser, setEditUser] = useState({
    role: '',
    isActive: true,
    permissions: [] as string[]
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest('/api/admin/roles');
      if (!response.ok) throw new Error('Failed to fetch roles');
      const data = await response.json();
      setRoles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest('/api/admin/permissions');
      if (!response.ok) throw new Error('Failed to fetch permissions');
      const data = await response.json();
      setPermissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest('/api/admin/audit-logs');
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      const result = await response.json();
      // The API returns { success: true, data: { logs: [...], total: number, has_more: boolean } }
      setAuditLogs(result.data?.logs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
      setAuditLogs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const createRole = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole)
      });
      if (!response.ok) throw new Error('Failed to create role');
      await fetchRoles();
      setShowCreateRole(false);
      setNewRole({ name: '', description: '', permissions: [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role');
    }
  };

  const updateUserRole = async (userId: string) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUser)
      });
      if (!response.ok) throw new Error('Failed to update user role');
      await fetchUsers();
      setShowEditUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    }
  };

  const deleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    try {
      const response = await makeAuthenticatedRequest(`/api/admin/roles/${roleId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete role');
      await fetchRoles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role');
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      if (!response.ok) throw new Error('Failed to update user status');
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPermissions();
    fetchAuditLogs();
  }, []);

  const filteredUsers = users.filter(user => {
    const email = user.email || '';
    const username = user.username || '';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    const matchesSearch = email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${firstName} ${lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'user':
        return <User className="h-4 w-4 text-gray-500" />;
      default:
        return <UserCheck className="h-4 w-4 text-green-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'default',
      moderator: 'secondary',
      user: 'outline'
    } as const;

    return (
      <Badge variant={variants[role.toLowerCase() as keyof typeof variants] || 'outline'}>
        {role}
      </Badge>
    );
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User & Role Management</h1>
          <p className="text-gray-600">Manage users, roles, and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchUsers} disabled={loading} variant="outline">
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

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts and their roles</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="all">All Roles</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{user.firstName || 'Unknown'} {user.lastName || 'User'}</h4>
                          {getStatusIcon(user.isActive)}
                        </div>
                        <p className="text-sm text-gray-600">{user.email || 'No email'}</p>
                        <p className="text-xs text-gray-500">
                          @{user.username || 'no-username'} • Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        {getRoleBadge(user.role)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setEditUser({
                              role: user.role,
                              isActive: user.isActive,
                              permissions: user.permissions
                            });
                            setShowEditUser(user.id);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => toggleUserStatus(user.id, !user.isActive)}
                          variant="outline"
                          size="sm"
                        >
                          {user.isActive ? (
                            <>
                              <UserMinus className="h-4 w-4 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Role Management</CardTitle>
                  <CardDescription>Create and manage user roles and permissions</CardDescription>
                </div>
                <Button onClick={() => setShowCreateRole(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {getRoleIcon(role.name)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{role.name}</h4>
                          {getRoleBadge(role.name)}
                          {role.isSystem && (
                            <Badge variant="outline" className="text-xs">System</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{role.description}</p>
                        <p className="text-xs text-gray-500">
                          {role.userCount} users • {role.permissions.length} permissions
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      {!role.isSystem && (
                        <Button
                          onClick={() => deleteRole(role.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Management</CardTitle>
              <CardDescription>View and manage system permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissions.map((permission) => (
                  <div key={permission.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{permission.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {permission.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{permission.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Track user actions and system changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{log.action_type}</Badge>
                        <span className="text-sm text-gray-600">{log.target_resource}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Admin:</strong> {log.admin_name} ({log.admin_email})
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Target ID: {log.target_id || 'N/A'}</span>
                      <span>IP: {log.ip_address || 'N/A'}</span>
                    </div>
                    {log.metadata && (
                      <div className="mt-2 text-xs text-gray-500">
                        <strong>Metadata:</strong> {JSON.stringify(log.metadata)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Role Modal */}
      {showCreateRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Role</CardTitle>
              <CardDescription>Define a new role with specific permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g., Moderator"
                />
              </div>
              <div>
                <Label htmlFor="role-description">Description</Label>
                <Textarea
                  id="role-description"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Describe the role's responsibilities"
                />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission.id}
                        checked={newRole.permissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewRole({
                              ...newRole,
                              permissions: [...newRole.permissions, permission.id]
                            });
                          } else {
                            setNewRole({
                              ...newRole,
                              permissions: newRole.permissions.filter(id => id !== permission.id)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={permission.id} className="text-sm">
                        {permission.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={createRole}>Create Role</Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateRole(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit User Role</CardTitle>
              <CardDescription>Update user role and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="user-role">Role</Label>
                <select
                  id="user-role"
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="user-active"
                  checked={editUser.isActive}
                  onCheckedChange={(checked) => setEditUser({ ...editUser, isActive: !!checked })}
                />
                <Label htmlFor="user-active">Active User</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => updateUserRole(showEditUser)}>Update User</Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditUser(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
