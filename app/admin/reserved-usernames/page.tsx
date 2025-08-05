'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { ReservedUsername, reservedUsernameClientService } from '@/lib/services/reserved-usernames-client';
import { Plus, Trash2, Edit, Search, Filter } from 'lucide-react';

const CATEGORIES = [
  'system', 'admin', 'api', 'events', 'learning', 'professional', 
  'content', 'legal', 'ecommerce', 'discovery', 'premium', 'community', 
  'brand', 'common_words', 'single_letters', 'abbreviations', 'error_pages'
] as const;

export default function ReservedUsernamesPage() {
  const [reservedUsernames, setReservedUsernames] = useState<ReservedUsername[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUsername, setEditingUsername] = useState<ReservedUsername | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    category: 'system' as ReservedUsername['category'],
    reason: '',
    expiresAt: ''
  });

  const supabase = createClient();

  const loadReservedUsernames = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reserved_usernames')
        .select('*')
        .order('username');

      if (error) throw error;
      setReservedUsernames(data || []);
    } catch (error) {
      console.error('Error loading reserved usernames:', error);
      toast.error('Failed to load reserved usernames');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadReservedUsernames();
  }, [loadReservedUsernames]);

  const handleAddUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await reservedUsernameClientService.addReservedUsername(
        formData.username,
        formData.category,
        formData.reason,
        undefined,
        formData.expiresAt || undefined
      );

      toast.success('Reserved username added successfully');
      setFormData({ username: '', category: 'system', reason: '', expiresAt: '' });
      setShowAddForm(false);
      loadReservedUsernames();
    } catch (error) {
      console.error('Error adding reserved username:', error);
      toast.error('Failed to add reserved username');
    }
  };

  const handleRemoveUsername = async (username: string) => {
    if (!confirm(`Are you sure you want to remove "${username}" from reserved usernames?`)) {
      return;
    }

    try {
      await reservedUsernameClientService.removeReservedUsername(username);
      toast.success('Reserved username removed successfully');
      loadReservedUsernames();
    } catch (error) {
      console.error('Error removing reserved username:', error);
      toast.error('Failed to remove reserved username');
    }
  };

  const handleEditUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUsername || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await reservedUsernameClientService.updateReservedUsername(editingUsername.username, {
        category: formData.category,
        reason: formData.reason,
        expires_at: formData.expiresAt || undefined
      });

      toast.success('Reserved username updated successfully');
      setEditingUsername(null);
      setFormData({ username: '', category: 'system', reason: '', expiresAt: '' });
      loadReservedUsernames();
    } catch (error) {
      console.error('Error updating reserved username:', error);
      toast.error('Failed to update reserved username');
    }
  };

  const startEdit = (username: ReservedUsername) => {
    setEditingUsername(username);
    setFormData({
      username: username.username,
      category: username.category,
      reason: username.reason,
      expiresAt: username.expires_at || ''
    });
  };

  const cancelEdit = () => {
    setEditingUsername(null);
    setFormData({ username: '', category: 'system', reason: '', expiresAt: '' });
  };

  const filteredUsernames = reservedUsernames.filter(username => {
    const matchesSearch = username.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         username.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || username.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      system: 'bg-blue-100 text-blue-800',
      admin: 'bg-red-100 text-red-800',
      api: 'bg-purple-100 text-purple-800',
      events: 'bg-green-100 text-green-800',
      learning: 'bg-yellow-100 text-yellow-800',
      professional: 'bg-indigo-100 text-indigo-800',
      content: 'bg-pink-100 text-pink-800',
      legal: 'bg-gray-100 text-gray-800',
      ecommerce: 'bg-orange-100 text-orange-800',
      discovery: 'bg-teal-100 text-teal-800',
      premium: 'bg-amber-100 text-amber-800',
      community: 'bg-emerald-100 text-emerald-800',
      brand: 'bg-rose-100 text-rose-800',
      common_words: 'bg-slate-100 text-slate-800',
      single_letters: 'bg-zinc-100 text-zinc-800',
      abbreviations: 'bg-stone-100 text-stone-800',
      error_pages: 'bg-neutral-100 text-neutral-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
        <span className="ml-4 text-lg">Loading reserved usernames...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reserved Usernames Management</h1>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Reserved Username
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search usernames or reasons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {(showAddForm || editingUsername) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingUsername ? 'Edit Reserved Username' : 'Add Reserved Username'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingUsername ? handleEditUsername : handleAddUsername} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!!editingUsername}
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value: ReservedUsername['category']) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Why is this username reserved?"
                  required
                />
              </div>
              <div>
                <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingUsername ? 'Update' : 'Add'} Reserved Username
                </Button>
                <Button type="button" variant="outline" onClick={editingUsername ? cancelEdit : () => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reserved Usernames List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Reserved Usernames ({filteredUsernames.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsernames.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No reserved usernames found matching your criteria.
              </p>
            ) : (
              filteredUsernames.map(username => (
                <div key={username.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{username.username}</h3>
                      <Badge className={getCategoryColor(username.category)}>
                        {username.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                      {!username.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{username.reason}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Created: {new Date(username.created_at).toLocaleDateString()}</span>
                      {username.expires_at && (
                        <span>Expires: {new Date(username.expires_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(username)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveUsername(username.username)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 