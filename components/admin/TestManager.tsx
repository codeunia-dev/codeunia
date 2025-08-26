"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  BarChart3, 
  Users,
  FileText,
  Settings,
  Award,
  Trophy,
  Download,
  Send,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { apiFetch } from "@/lib/api-fetch";
import type { 
  Test, 
  CreateTestForm, 
  CreateTestQuestionForm
} from "@/types/test-management";
import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Define interfaces for API responses
interface TestDetailsResponse {
  test: Test;
  questions: Array<{
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_options: string[];
    explanation: string;
    points: number;
  }>;
}

interface RoundData {
  round_number: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  duration_minutes: number;
  max_attempts: number;
  passing_score: number;
  requirements: string[];
  assessment_criteria: string[];
  round_type: string;
  is_elimination_round: boolean;
  weightage: number;
}

interface TestRegistration {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  institution?: string;
  department?: string;
  year_of_study?: string;
  experience_level?: string;
  registration_date: string;
  status?: string;
  attempt_count?: number;
  best_score?: number;
  best_attempt_id?: string;
  registration_data?: Record<string, unknown>;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

interface TestAttempt {
  id: string;
  user_id: string;
  test_id: string;
  score: number;
  passed: boolean;
  time_taken_minutes: number;
  submitted_at: string;
  started_at: string;
  violations_count?: number;
  admin_override_score?: number | null;
  status: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  registration?: {
    phone?: string;
    institution?: string;
    department?: string;
    year_of_study?: string;
    experience_level?: string;
  };
  test_registrations?: {
    institution?: string;
    experience_level?: string;
  };
  tests?: {
    name: string;
    certificate_template_id?: string;
  };
}

interface LeaderboardEntry {
  id: string;
  rank: number;
  score: number;
  time_taken_minutes: number;
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
  registration?: {
    institution?: string;
    experience_level?: string;
  };
}

interface TestResults {
  statistics?: {
    totalRegistrations: number;
    totalAttempts: number;
    passedAttempts: number;
    averageScore: number;
  };
  attempts?: TestAttempt[];
  leaderboard?: LeaderboardEntry[];
}


import { CertificateGenerator } from "@/components/CertificateGenerator";
import { EventTimeline } from "@/components/admin/EventTimeline";
import { RoundsManager } from "@/components/admin/RoundsManager";

export function TestManager() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<User | null>(null);
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  const [formData, setFormData] = useState<CreateTestForm>({
    name: "",
    description: "",
    duration_minutes: 60,
    category: "",
    
    // Event Timeline
    event_start: "",
    event_end: "",
    registration_start: "",
    registration_end: "",
    certificate_start: "",
    certificate_end: "",
    
    // Dynamic Rounds System
    rounds: [],
    
    // Payment Settings
    is_paid: false,
    price: 0,
    currency: "INR",
    
    // Test Configuration
    is_public: true,
    enable_leaderboard: false,
    certificate_template_id: "",
    passing_score: 70,
    max_attempts: 1,
    questions: []
  });

  useEffect(() => {
    // Initialize Supabase client safely
    try {
      const client = createClient();
      setSupabaseClient(client);
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      toast.error('Failed to initialize database connection');
      setLoading(false);
    }
  }, []);

  const checkAuthAndFetchTests = useCallback(async () => {
    if (!supabaseClient) {
      console.error('Supabase client not available');
      return;
    }

    try {
      // Add timeout to the auth request
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Authentication timeout')), 10000)
      );

      const authPromise = supabaseClient.auth.getUser();
      const result = await Promise.race([authPromise, timeoutPromise]);
      
      // Handle successful auth response
      const { data: { user }, error } = result;
    
      if (error) {
        toast.error('Authentication error: ' + error.message);
        return;
      }
      
      if (!user) {
        toast.error('Please sign in to access admin panel');
        return;
      }
      
      if (user.user_metadata?.role !== 'admin') {
        toast.error('Admin access required');
        return;
      }
      
      setUser(user);
      await fetchTests();
    } catch (error) {
      console.error('Authentication error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
        toast.error('Network timeout during authentication. Please check your connection and try again.');
      } else {
        toast.error('Failed to authenticate: ' + errorMessage);
      }
    }
  }, [supabaseClient]);

  useEffect(() => {
    if (supabaseClient) {
      checkAuthAndFetchTests();
    }
  }, [supabaseClient, checkAuthAndFetchTests]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await apiFetch('/api/admin/tests', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to fetch tests');
      }
      
      const result = await response.json();
      setTests(result.tests || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('timeout') || errorMessage.includes('aborted') || errorMessage.includes('network')) {
        toast.error('Network timeout. Please check your connection and try again.');
      } else {
        toast.error('Failed to fetch tests: ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async () => {
    try {
      if (!user) {
        toast.error('Please sign in to create tests');
        return;
      }
      
      if (formData.questions.length === 0) {
        toast.error('Please add at least one question');
        return;
      }

      const isEditing = selectedTest !== null;
      const url = isEditing ? `/api/admin/tests/${selectedTest.id}` : '/api/admin/tests';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${isEditing ? 'update' : 'create'} test`);
      }

      toast.success(`Test ${isEditing ? 'updated' : 'created'} successfully`);
      setShowCreateDialog(false);
      setSelectedTest(null);
      resetForm();
      fetchTests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${selectedTest ? 'update' : 'create'} test`);
    }
  };

  const handleEditTest = async (test: Test) => {
    try {
      // Fetch test details with questions
      const response = await fetch(`/api/admin/tests/${test.id}`);
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to fetch test details');
      }

      const data = await response.json();
      
      // Populate form with existing data
      setFormData({
        name: data.test.name,
        description: data.test.description || "",
        duration_minutes: data.test.duration_minutes,
        category: data.test.category || "",
        
        // Event Timeline
        event_start: data.test.event_start ? new Date(data.test.event_start).toISOString().slice(0, 16) : "",
        event_end: data.test.event_end ? new Date(data.test.event_end).toISOString().slice(0, 16) : "",
        registration_start: data.test.registration_start ? new Date(data.test.registration_start).toISOString().slice(0, 16) : "",
        registration_end: data.test.registration_end ? new Date(data.test.registration_end).toISOString().slice(0, 16) : "",
        certificate_start: data.test.certificate_start ? new Date(data.test.certificate_start).toISOString().slice(0, 16) : "",
        certificate_end: data.test.certificate_end ? new Date(data.test.certificate_end).toISOString().slice(0, 16) : "",
        
        // Dynamic Rounds System
        rounds: data.test.rounds?.map((r: RoundData) => ({
          round_number: r.round_number,
          name: r.name,
          description: r.description,
          start_date: r.start_date ? new Date(r.start_date).toISOString().slice(0, 16) : "",
          end_date: r.end_date ? new Date(r.end_date).toISOString().slice(0, 16) : "",
          duration_minutes: r.duration_minutes,
          max_attempts: r.max_attempts,
          passing_score: r.passing_score,
          requirements: r.requirements || [],
          assessment_criteria: r.assessment_criteria || [],
          round_type: r.round_type,
          is_elimination_round: r.is_elimination_round,
          weightage: r.weightage
        })) || [],
        
        // Payment Settings
        is_paid: data.test.is_paid || false,
        price: data.test.price || 0,
        currency: data.test.currency || "INR",
        
        // Test Configuration
        is_public: data.test.is_public,
        enable_leaderboard: data.test.enable_leaderboard,
        certificate_template_id: data.test.certificate_template_id || "",
        passing_score: data.test.passing_score,
        max_attempts: data.test.max_attempts,
        questions: data.questions.map((q: TestDetailsResponse['questions'][number]) => ({
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_options: q.correct_options || [],
          explanation: q.explanation || "",
          points: q.points || 1
        }))
      });

      // Set edit mode
      setSelectedTest(test);
      setShowCreateDialog(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load test for editing');
    }
  };

  const handleDeleteTest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
      const response = await fetch(`/api/admin/tests/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete test');
      }

      toast.success('Test deleted successfully');
      fetchTests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete test');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration_minutes: 60,
      category: "",
      
      // Event Timeline
      event_start: "",
      event_end: "",
      registration_start: "",
      registration_end: "",
      certificate_start: "",
      certificate_end: "",
      
      // Dynamic Rounds System
      rounds: [],
      
      // Payment Settings
      is_paid: false,
      price: 0,
      currency: "INR",
      
      // Test Configuration
      is_public: true,
      enable_leaderboard: false,
      certificate_template_id: "",
      passing_score: 70,
      max_attempts: 1,
      questions: []
    });
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_options: [],
        explanation: "",
        points: 1
      }]
    }));
  };

  const updateQuestion = (index: number, field: keyof CreateTestQuestionForm, value: CreateTestQuestionForm[keyof CreateTestQuestionForm]) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const getStatusBadge = (test: Test) => {
    if (!test.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    // Check if any rounds are currently active
    const now = new Date();
    const hasActiveRounds = test.rounds?.some(round => {
      const startDate = new Date(round.start_date);
      const endDate = new Date(round.end_date);
      return now >= startDate && now <= endDate;
    });
    
    if (hasActiveRounds) {
      return <Badge variant="default">Active</Badge>;
    } else {
      return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  const getRegistrationStatus = (test: Test) => {
    if (!test.registration_start || !test.registration_end) {
      return <Badge variant="secondary">No Registration</Badge>;
    }
    
    const now = new Date();
    const regStart = new Date(test.registration_start);
    const regEnd = new Date(test.registration_end);
    
    if (now < regStart) {
      return <Badge variant="outline">Registration Pending</Badge>;
    } else if (now > regEnd) {
      return <Badge variant="destructive">Registration Closed</Badge>;
    } else {
      return <Badge variant="default">Registration Open</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Test Management</h1>
          <p className="text-muted-foreground">Create and manage MCQ-based tests with registration and certificates</p>
          <p className="text-xs text-blue-600 mt-1">Debug: Currently showing {tests.length} test(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTests} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Refresh Data
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Test
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tests.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tests.filter(t => t.is_active).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tests.reduce((sum, t) => sum + (t.test_registrations?.[0]?.count || 0), 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tests.reduce((sum, t) => sum + (t.test_attempts?.[0]?.count || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tests</CardTitle>
          <CardDescription>Manage all tests and their configurations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Registrations</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Leaderboard</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{test.name}</div>
                        <div className="text-sm text-muted-foreground">{test.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(test)}</TableCell>
                    <TableCell>
                      {test.is_paid ? (
                        <Badge variant="default" className="bg-green-500">
                          ₹{(test.price || 0) / 100}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Free</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getRegistrationStatus(test)}</TableCell>
                    <TableCell>{test.duration_minutes} min</TableCell>
                    <TableCell>{test.test_registrations?.[0]?.count || 0}</TableCell>
                    <TableCell>{test.test_attempts?.[0]?.count || 0}</TableCell>
                    <TableCell>
                      {test.enable_leaderboard ? (
                        <Badge variant="default">Enabled</Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedTest(test);
                            setActiveTab("overview");
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedTest(test);
                            setActiveTab("results");
                          }}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditTest(test)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteTest(test.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Test Detail Dialog */}
      {selectedTest && (
        <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTest.name}</DialogTitle>
              <DialogDescription>
                Test details and management
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="registrations">Registrations</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="certificates">Certificates</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <TestOverview test={selectedTest} />
              </TabsContent>

              <TabsContent value="registrations" className="space-y-4">
                <TestRegistrations testId={selectedTest.id} />
              </TabsContent>

              <TabsContent value="results" className="space-y-4">
                <TestResults testId={selectedTest.id} />
              </TabsContent>

              <TabsContent value="certificates" className="space-y-4">
                <TestCertificates testId={selectedTest.id} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Test Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTest ? 'Edit Test' : 'Create New Test'}</DialogTitle>
            <DialogDescription>
              {selectedTest ? 'Edit test details and questions' : 'Create a new test with questions and configuration'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Test Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Test name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Test description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Category</option>
                <option value="Programming">Programming</option>
                <option value="Database">Database (DBMS)</option>
                <option value="Operating Systems">Operating Systems</option>
                <option value="Computer Networks">Computer Networks</option>
                <option value="Data Structures">Data Structures & Algorithms</option>
                <option value="Web Development">Web Development</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Computer Architecture">Computer Architecture</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="DevOps">DevOps</option>
                <option value="General">General Computer Science</option>
              </select>
            </div>

            {/* Registration Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reg-start">Registration Start</Label>
                <Input
                  id="reg-start"
                  type="datetime-local"
                  value={formData.registration_start}
                  onChange={(e) => setFormData(prev => ({ ...prev, registration_start: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-end">Registration End</Label>
                <Input
                  id="reg-end"
                  type="datetime-local"
                  value={formData.registration_end}
                  onChange={(e) => setFormData(prev => ({ ...prev, registration_end: e.target.value }))}
                />
              </div>
            </div>

            {/* Event Timeline */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Event Timeline</Label>
              
              {/* Event Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-start">Event Start (Goes Live)</Label>
                  <Input
                    id="event-start"
                    type="datetime-local"
                    value={formData.event_start}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_start: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-end">Event End</Label>
                  <Input
                    id="event-end"
                    type="datetime-local"
                    value={formData.event_end}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_end: e.target.value }))}
                  />
                </div>
              </div>

              {/* Registration Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-start">Registration Start</Label>
                  <Input
                    id="reg-start"
                    type="datetime-local"
                    value={formData.registration_start}
                    onChange={(e) => setFormData(prev => ({ ...prev, registration_start: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-end">Registration End</Label>
                  <Input
                    id="reg-end"
                    type="datetime-local"
                    value={formData.registration_end}
                    onChange={(e) => setFormData(prev => ({ ...prev, registration_end: e.target.value }))}
                  />
                </div>
              </div>

              {/* Dynamic Rounds System */}
              <RoundsManager 
                rounds={formData.rounds}
                onRoundsChange={(rounds) => setFormData(prev => ({ ...prev, rounds }))}
              />

              {/* Certificate Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="certificate-start">Certificate Distribution Start</Label>
                  <Input
                    id="certificate-start"
                    type="datetime-local"
                    value={formData.certificate_start}
                    onChange={(e) => setFormData(prev => ({ ...prev, certificate_start: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificate-end">Certificate Distribution End</Label>
                  <Input
                    id="certificate-end"
                    type="datetime-local"
                    value={formData.certificate_end}
                    onChange={(e) => setFormData(prev => ({ ...prev, certificate_end: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passing-score">Passing Score (%)</Label>
                <Input
                  id="passing-score"
                  type="number"
                  value={formData.passing_score}
                  onChange={(e) => setFormData(prev => ({ ...prev, passing_score: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-attempts">Max Attempts</Label>
                <Input
                  id="max-attempts"
                  type="number"
                  value={formData.max_attempts}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_attempts: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            {/* Payment Settings */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Payment Settings</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-paid"
                  checked={formData.is_paid}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_paid: !!checked }))}
                />
                <Label htmlFor="is-paid">Paid Test</Label>
              </div>
              
              {formData.is_paid && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price ? formData.price / 100 : 0}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        price: Math.round(parseFloat(e.target.value || '0') * 100) 
                      }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Test Options</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: !!checked }))}
                />
                <Label htmlFor="is-public">Public Test</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enable-leaderboard"
                  checked={formData.enable_leaderboard}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_leaderboard: !!checked }))}
                />
                <Label htmlFor="enable-leaderboard">Enable Leaderboard</Label>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Questions</Label>
                <Button type="button" variant="outline" onClick={addQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {formData.questions.map((question, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Textarea
                        value={question.question_text}
                        onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                        placeholder="Enter your question"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Option A</Label>
                        <Input
                          value={question.option_a}
                          onChange={(e) => updateQuestion(index, 'option_a', e.target.value)}
                          placeholder="Option A"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Option B</Label>
                        <Input
                          value={question.option_b}
                          onChange={(e) => updateQuestion(index, 'option_b', e.target.value)}
                          placeholder="Option B"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Option C</Label>
                        <Input
                          value={question.option_c}
                          onChange={(e) => updateQuestion(index, 'option_c', e.target.value)}
                          placeholder="Option C"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Option D</Label>
                        <Input
                          value={question.option_d}
                          onChange={(e) => updateQuestion(index, 'option_d', e.target.value)}
                          placeholder="Option D"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Correct Options</Label>
                        <div className="flex space-x-2">
                          {['A', 'B', 'C', 'D'].map((option) => (
                            <div key={option} className="flex items-center space-x-1">
                              <Checkbox
                                checked={question.correct_options.includes(option)}
                                onCheckedChange={(checked) => {
                                  const newOptions = checked
                                    ? [...question.correct_options, option]
                                    : question.correct_options.filter(o => o !== option);
                                  updateQuestion(index, 'correct_options', newOptions);
                                }}
                              />
                              <Label className="text-sm">{option}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Points</Label>
                        <Input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Explanation (Optional)</Label>
                      <Textarea
                        value={question.explanation}
                        onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                        placeholder="Explanation for review mode"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setSelectedTest(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateTest}>
              {selectedTest ? 'Update Test' : 'Create Test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-components for test details
function TestOverview({ test }: { test: Test }) {
  return (
    <div className="space-y-4">
      {/* Event Timeline */}
      <EventTimeline test={test} />
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-medium">{test.duration_minutes} minutes</span>
            </div>
            <div className="flex justify-between">
              <span>Passing Score:</span>
              <span className="font-medium">{test.passing_score}%</span>
            </div>
            <div className="flex justify-between">
              <span>Max Attempts:</span>
              <span className="font-medium">{test.max_attempts}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="font-medium">
                {test.is_paid ? `₹${(test.price || 0) / 100}` : 'Free'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Public:</span>
              <span className="font-medium">{test.is_public ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span>Leaderboard:</span>
              <span className="font-medium">{test.enable_leaderboard ? 'Enabled' : 'Disabled'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {test.event_start && (
              <div className="flex justify-between">
                <span>Event Start:</span>
                <span className="font-medium">{new Date(test.event_start).toLocaleString()}</span>
              </div>
            )}
            {test.registration_start && (
              <div className="flex justify-between">
                <span>Registration Start:</span>
                <span className="font-medium">{new Date(test.registration_start).toLocaleString()}</span>
              </div>
            )}
            {test.registration_end && (
              <div className="flex justify-between">
                <span>Registration End:</span>
                <span className="font-medium">{new Date(test.registration_end).toLocaleString()}</span>
              </div>
            )}
            {test.rounds && test.rounds.length > 0 && (
              <div className="flex justify-between">
                <span>Total Rounds:</span>
                <span className="font-medium">{test.rounds.length}</span>
              </div>
            )}
            {test.certificate_start && (
              <div className="flex justify-between">
                <span>Certificate Start:</span>
                <span className="font-medium">{new Date(test.certificate_start).toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TestRegistrations({ testId }: { testId: string }) {
  const [registrations, setRegistrations] = useState<TestRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<TestRegistration | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/tests/${testId}`);
      const data = await response.json();
      setRegistrations(data.registrations || []);
    } catch {
      toast.error('Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const downloadCSV = () => {
    const headers = [
      'Full Name',
      'Email', 
      'Phone',
      'Institution/Company',
      'Department',
      'Year of Study',
      'Experience Level',
      'Registration Date',
      'Status',
      'Attempts',
      'Best Score',
      'Best Attempt ID',
      'Registration Data (JSON)'
    ];

    const csvData = registrations.map(reg => [
      reg.full_name || `${reg.profiles?.first_name || ''} ${reg.profiles?.last_name || ''}`.trim(),
      reg.email || reg.profiles?.email || '',
      reg.phone || '',
      reg.institution || '',
      reg.department || '',
      reg.year_of_study || '',
      reg.experience_level || '',
      new Date(reg.registration_date).toLocaleDateString(),
      reg.status || '',
      reg.attempt_count || 0,
      reg.best_score || '',
      reg.best_attempt_id || '',
      JSON.stringify(reg.registration_data || {})
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-registrations-${testId}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('CSV downloaded successfully!');
  };

  const viewRegistrationDetails = (registration: TestRegistration) => {
    setSelectedRegistration(registration);
    setShowDetailsDialog(true);
  };

  if (loading) return <div>Loading registrations...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Registrations ({registrations.length})</h3>
        <Button variant="outline" size="sm" onClick={downloadCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Institution</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Attempts</TableHead>
            <TableHead>Best Score</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((reg) => (
            <TableRow key={reg.id}>
              <TableCell className="font-medium">
                {reg.full_name || `${reg.profiles?.first_name || ''} ${reg.profiles?.last_name || ''}`.trim() || 'N/A'}
              </TableCell>
              <TableCell>{reg.email || reg.profiles?.email || 'N/A'}</TableCell>
              <TableCell>{reg.phone || 'N/A'}</TableCell>
              <TableCell>{reg.institution || 'N/A'}</TableCell>
              <TableCell>{reg.experience_level || 'N/A'}</TableCell>
              <TableCell>
                <Badge variant={reg.status === 'registered' ? 'default' : 'secondary'}>
                  {reg.status || 'registered'}
                </Badge>
              </TableCell>
              <TableCell>{reg.attempt_count || 0}</TableCell>
              <TableCell>
                {reg.best_score ? `${reg.best_score}%` : '-'}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewRegistrationDetails(reg)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Registration Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>
              Complete information for this registration
            </DialogDescription>
          </DialogHeader>
          
          {selectedRegistration && (
            <div className="space-y-4">
              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="text-sm">{selectedRegistration.full_name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{selectedRegistration.email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="text-sm">{selectedRegistration.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Institution/Company</Label>
                  <p className="text-sm">{selectedRegistration.institution || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                  <p className="text-sm">{selectedRegistration.department || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Year of Study</Label>
                  <p className="text-sm">{selectedRegistration.year_of_study || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Experience Level</Label>
                  <p className="text-sm">{selectedRegistration.experience_level || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Registration Date</Label>
                  <p className="text-sm">{new Date(selectedRegistration.registration_date).toLocaleString()}</p>
                </div>
              </div>

              {/* Test Performance */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Test Performance</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge variant={selectedRegistration.status === 'registered' ? 'default' : 'secondary'}>
                      {selectedRegistration.status || 'registered'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Attempts</Label>
                    <p className="text-sm">{selectedRegistration.attempt_count || 0}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Best Score</Label>
                    <p className="text-sm">{selectedRegistration.best_score ? `${selectedRegistration.best_score}%` : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Raw Registration Data */}
              {selectedRegistration.registration_data && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Registration Data (JSON)</h4>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(selectedRegistration.registration_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TestResults({ testId }: { testId: string }) {
  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState<TestAttempt | null>(null);
  const [showAttemptDetails, setShowAttemptDetails] = useState(false);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/tests/${testId}/results`);
      const data = await response.json();
      setResults(data);
    } catch {
      toast.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const downloadResultsCSV = () => {
    if (!results?.attempts) return;

    const headers = [
      'Full Name',
      'Email',
      'Phone',
      'Institution/Company',
      'Department',
      'Year of Study',
      'Experience Level',
      'Score',
      'Status',
      'Time Taken (min)',
      'Submitted At',
      'Violations',
      'Admin Override Score'
    ];

    const csvData = results.attempts.map((attempt: TestAttempt) => [
      attempt.profiles?.first_name + ' ' + attempt.profiles?.last_name || 'N/A',
      attempt.profiles?.email || 'N/A',
      attempt.registration?.phone || 'N/A',
      attempt.registration?.institution || 'N/A',
      attempt.registration?.department || 'N/A',
      attempt.registration?.year_of_study || 'N/A',
      attempt.registration?.experience_level || 'N/A',
      attempt.score || 0,
      attempt.passed ? 'Passed' : 'Failed',
      attempt.time_taken_minutes || 0,
      new Date(attempt.submitted_at).toLocaleString(),
      attempt.violations_count || 0,
      attempt.admin_override_score || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map((cell: string | number) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${testId}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Results CSV downloaded successfully!');
  };

  const viewAttemptDetails = (attempt: TestAttempt) => {
    setSelectedAttempt(attempt);
    setShowAttemptDetails(true);
  };

  if (loading) return <div>Loading results...</div>;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{results?.statistics?.totalRegistrations || 0}</div>
            <div className="text-sm text-muted-foreground">Total Registrations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{results?.statistics?.totalAttempts || 0}</div>
            <div className="text-sm text-muted-foreground">Total Attempts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{results?.statistics?.passedAttempts || 0}</div>
            <div className="text-sm text-muted-foreground">Passed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {results?.statistics?.averageScore ? Math.round(results.statistics.averageScore) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Average Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={downloadResultsCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export Results CSV
        </Button>
      </div>

      {/* Leaderboard */}
      {results?.leaderboard && results.leaderboard.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Experience</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.leaderboard.map((entry: LeaderboardEntry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Badge variant={entry.rank <= 3 ? 'default' : 'secondary'}>
                        #{entry.rank}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {entry.profiles?.first_name} {entry.profiles?.last_name}
                    </TableCell>
                    <TableCell>{entry.registration?.institution || 'N/A'}</TableCell>
                    <TableCell className="font-semibold">{entry.score}%</TableCell>
                    <TableCell>{entry.time_taken_minutes} min</TableCell>
                    <TableCell>{entry.registration?.experience_level || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Violations</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results?.attempts?.map((attempt: TestAttempt) => (
                <TableRow key={attempt.id}>
                  <TableCell className="font-medium">
                    {attempt.profiles?.first_name} {attempt.profiles?.last_name}
                  </TableCell>
                  <TableCell>{attempt.registration?.institution || 'N/A'}</TableCell>
                  <TableCell>
                    {attempt.admin_override_score !== null ? (
                      <span className="text-orange-600 font-semibold">{attempt.admin_override_score}% (overridden)</span>
                    ) : (
                      <span className="font-semibold">{attempt.score}%</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={attempt.passed ? 'default' : 'destructive'}>
                      {attempt.passed ? 'Passed' : 'Failed'}
                    </Badge>
                  </TableCell>
                  <TableCell>{attempt.time_taken_minutes} min</TableCell>
                  <TableCell>
                    <Badge variant={(attempt.violations_count ?? 0) > 0 ? 'destructive' : 'secondary'}>
                      {attempt.violations_count || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(attempt.submitted_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => viewAttemptDetails(attempt)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {attempt.passed && (
                        <Button variant="outline" size="sm">
                          <Award className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Attempt Details Dialog */}
      <Dialog open={showAttemptDetails} onOpenChange={setShowAttemptDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Attempt Details</DialogTitle>
            <DialogDescription>
              Complete information about this test attempt
            </DialogDescription>
          </DialogHeader>
          
          {selectedAttempt && (
            <div className="space-y-6">
              {/* Student Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="text-sm font-medium">
                    {selectedAttempt.profiles?.first_name} {selectedAttempt.profiles?.last_name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{selectedAttempt.profiles?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="text-sm">{selectedAttempt.registration?.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Institution</Label>
                  <p className="text-sm">{selectedAttempt.registration?.institution || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                  <p className="text-sm">{selectedAttempt.registration?.department || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Experience Level</Label>
                  <p className="text-sm">{selectedAttempt.registration?.experience_level || 'N/A'}</p>
                </div>
              </div>

              {/* Test Performance */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Test Performance</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Score</Label>
                    <p className="text-lg font-bold">
                      {selectedAttempt.admin_override_score !== null 
                        ? `${selectedAttempt.admin_override_score}% (overridden)`
                        : `${selectedAttempt.score}%`
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge variant={selectedAttempt.passed ? 'default' : 'destructive'}>
                      {selectedAttempt.passed ? 'Passed' : 'Failed'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Time Taken</Label>
                    <p className="text-sm">{selectedAttempt.time_taken_minutes} minutes</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Violations</Label>
                    <Badge variant={(selectedAttempt.violations_count ?? 0) > 0 ? 'destructive' : 'secondary'}>
                      {selectedAttempt.violations_count || 0}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Started At</Label>
                    <p className="text-sm">{new Date(selectedAttempt.started_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Submitted At</Label>
                    <p className="text-sm">{new Date(selectedAttempt.submitted_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Certificate Actions */}
              {selectedAttempt.passed && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Certificate Actions</h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Award className="w-4 h-4 mr-2" />
                      Generate Certificate
                    </Button>
                    <Button variant="outline" size="sm">
                      <Send className="w-4 h-4 mr-2" />
                      Send Certificate
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAttemptDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TestCertificates({ testId }: { testId: string }) {
  const [selectedAttempt, setSelectedAttempt] = useState<TestAttempt | null>(null);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingCertificates, setSendingCertificates] = useState(false);
  const [selectedAttempts, setSelectedAttempts] = useState<string[]>([]);
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  const [userProfiles, setUserProfiles] = useState<{[key: string]: { first_name: string; last_name: string; email: string }}>({});

  const fetchUserProfiles = useCallback(async (userIds: string[]) => {
    if (!supabaseClient || userIds.length === 0) return;

    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      const profilesMap: {[key: string]: { first_name: string; last_name: string; email: string }} = {};
      data?.forEach((profile: { id: string; first_name: string; last_name: string; email: string }) => {
        profilesMap[profile.id] = profile;
      });
      setUserProfiles(profilesMap);
    } catch (error) {
      console.error('Error fetching user profiles:', error);
    }
  }, [supabaseClient]);

  const fetchPassedAttempts = useCallback(async () => {
    if (!supabaseClient) {
      console.error('Supabase client not available');
      return;
    }

    setLoading(true);
    try {
      // Add timeout to the request
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const queryPromise = supabaseClient
        .from('test_attempts')
        .select(`
          *,
          tests!test_attempts_test_id_fkey (
            name,
            certificate_template_id
          )
        `)
        .eq('test_id', testId)
        .eq('passed', true)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false });

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as { data: TestAttempt[], error: Error | null };

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Database query failed');
      }
      
      setAttempts(data || []);

      // Fetch user profiles for the attempts
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((attempt: TestAttempt) => attempt.user_id))] as string[];
        await fetchUserProfiles(userIds);
      }
    } catch (error) {
      console.error('Error fetching attempts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
        toast.error('Network timeout. Please check your connection and try again.');
      } else {
        toast.error(`Failed to fetch passed attempts: ${errorMessage}`);
      }
      setAttempts([]); // Set empty array to prevent further errors
    } finally {
      setLoading(false);
    }
  }, [supabaseClient, testId, fetchUserProfiles]);

  useEffect(() => {
    // Initialize Supabase client safely
    try {
      const client = createClient();
      setSupabaseClient(client);
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      toast.error('Failed to initialize database connection');
    }
  }, []);

  useEffect(() => {
    if (supabaseClient && testId) {
      fetchPassedAttempts();
    }
  }, [supabaseClient, testId, fetchPassedAttempts]);

  const generateCertificateForAttempt = (attempt: TestAttempt) => {
    setSelectedAttempt(attempt);
  };

  const sendCertificateEmail = async (attempt: TestAttempt) => {
    if (!supabaseClient) return;
    try {
      // Get user profile data separately
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', attempt.user_id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast.error('Failed to fetch user profile');
        return;
      }

      const response = await apiFetch('/api/certificates/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: profileData.email,
          name: `${profileData.first_name} ${profileData.last_name}`,
          testName: attempt.tests?.name,
          score: attempt.score,
          certId: `CU-TEST-${attempt.test_id}-${attempt.user_id}`,
          issuedDate: new Date().toLocaleDateString()
        }),
      });

      if (response.ok) {
        toast.success(`Certificate email sent to ${profileData.email}`);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      toast.error(`Failed to send certificate email: ${errorMessage}`);
    }
  };

  const sendBulkCertificates = async () => {
    if (selectedAttempts.length === 0) {
      toast.error('Please select at least one candidate');
      return;
    }

    setSendingCertificates(true);
    try {
      const selectedAttemptsData = attempts.filter(attempt => 
        selectedAttempts.includes(attempt.id)
      );

      for (const attempt of selectedAttemptsData) {
        await sendCertificateEmail(attempt);
        // Small delay to avoid overwhelming the email service
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast.success(`Certificates sent to ${selectedAttemptsData.length} candidates`);
      setSelectedAttempts([]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      toast.error(`Failed to send bulk certificates: ${errorMessage}`);
    } finally {
      setSendingCertificates(false);
    }
  };

  const toggleAttemptSelection = (attemptId: string) => {
    setSelectedAttempts(prev => 
      prev.includes(attemptId) 
        ? prev.filter(id => id !== attemptId)
        : [...prev, attemptId]
    );
  };

  const selectAllAttempts = () => {
    setSelectedAttempts(attempts.map(attempt => attempt.id));
  };

  const deselectAllAttempts = () => {
    setSelectedAttempts([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Certificate Management</h3>
        <div className="flex gap-2">
          {selectedAttempts.length > 0 && (
            <Button 
              variant="outline" 
              onClick={sendBulkCertificates}
              disabled={sendingCertificates}
            >
              {sendingCertificates ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send to {selectedAttempts.length} Selected
            </Button>
          )}
          <Button onClick={() => window.open('/admin/certificates', '_blank')}>
            <Award className="w-4 h-4 mr-2" />
            Certificate Generator
          </Button>
        </div>
      </div>
      
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading passed attempts...</p>
            </div>
          </CardContent>
        </Card>
      ) : attempts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Passed Attempts</h3>
              <p className="text-muted-foreground">
                No candidates have passed this test yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Passed Candidates ({attempts.length})</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllAttempts}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllAttempts}>
                    Deselect All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedAttempts.length === attempts.length}
                        onCheckedChange={(checked) => 
                          checked ? selectAllAttempts() : deselectAllAttempts()
                        }
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedAttempts.includes(attempt.id)}
                          onCheckedChange={() => toggleAttemptSelection(attempt.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {userProfiles[attempt.user_id] ? 
                          `${userProfiles[attempt.user_id].first_name} ${userProfiles[attempt.user_id].last_name}` : 
                          'Loading...'}
                      </TableCell>
                      <TableCell>{userProfiles[attempt.user_id]?.email || 'N/A'}</TableCell>
                      <TableCell>{attempt.test_registrations?.institution || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={attempt.score >= 70 ? 'default' : 'secondary'}>
                          {attempt.score}%
                        </Badge>
                      </TableCell>
                      <TableCell>{attempt.test_registrations?.experience_level || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(attempt.submitted_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateCertificateForAttempt(attempt)}
                          >
                            <Award className="w-4 h-4 mr-2" />
                            Generate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendCertificateEmail(attempt)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {selectedAttempt && (
            <Card>
              <CardHeader>
                <CardTitle>Generate Certificate</CardTitle>
              </CardHeader>
              <CardContent>
                <CertificateGenerator
                  context="test"
                  userData={{
                    name: userProfiles[selectedAttempt.user_id] ? 
                           `${userProfiles[selectedAttempt.user_id].first_name} ${userProfiles[selectedAttempt.user_id].last_name}` : 
                           'Loading...',
                    score: selectedAttempt.score,
                    testName: selectedAttempt.tests?.name,
                    cert_id: `CU-TEST-${selectedAttempt.test_id}-${selectedAttempt.user_id}`,
                    email: userProfiles[selectedAttempt.user_id]?.email || '',
                    issued_date: new Date().toLocaleDateString(),
                    category: 'Test Completion',
                    duration: `${selectedAttempt.time_taken_minutes} minutes`,
                    organization: 'Codeunia',
                    institution: selectedAttempt.test_registrations?.institution,
                    department: selectedAttempt.registration?.department,
                    experience_level: selectedAttempt.test_registrations?.experience_level
                  }}
                  templateId={selectedAttempt.tests?.certificate_template_id}
                  onComplete={() => {
                    toast.success('Certificate generated successfully!');
                    setSelectedAttempt(null);
                  }}
                  onError={(error) => {
                    toast.error(`Certificate generation failed: ${error}`);
                  }}
                  showPreview={true}
                  autoGenerate={false}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
} 

export default TestManager; 