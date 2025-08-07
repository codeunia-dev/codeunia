"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Clock, 
  FileText, 
  Users, 
  Trophy,
  Play,
  ArrowRight,
  Filter,
  Target,
  Brain,
  Sparkles
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Header from "@/components/header";
import Footer from "@/components/footer";
import type { Test } from "@/types/test-management";

// Test categories for dropdown
const testCategories = [
  "All",
  "Programming",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "AI/ML",
  "Cybersecurity",
  "Database",
  "DevOps",
  "General Knowledge"
];

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [userRegistrations, setUserRegistrations] = useState<Set<string>>(new Set());
  const router = useRouter();
  const supabase = createClient();

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tests')
        .select(`
          *,
          test_registrations(count)
        `)
        .eq('is_public', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch {
      toast.error('Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const checkUserAndRegistrations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch user's registrations
        const { data: registrations, error } = await supabase
          .from('test_registrations')
          .select('test_id')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user registrations:', error);
          return;
        }

        const registeredTestIds = new Set(registrations?.map(r => r.test_id) || []);
        setUserRegistrations(registeredTestIds);
      }
    } catch (error) {
      console.error('Error checking user and registrations:', error);
    }
  }, [supabase]);

  useEffect(() => {
    fetchTests();
    checkUserAndRegistrations();
  }, [fetchTests, checkUserAndRegistrations]);



  const handleRegister = async (testId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to register for tests');
        router.push('/auth/signin');
        return;
      }

      console.log('Attempting to register for test:', testId);
      console.log('User ID:', user.id);

      // Check if already registered using local state
      if (userRegistrations.has(testId)) {
        toast.error('You are already registered for this test');
        return;
      }

      // Get test details for debugging
      const test = tests.find(t => t.id === testId);
      console.log('Test details:', test);

      // Register for the test
      const { error } = await supabase
        .from('test_registrations')
        .insert([{
          test_id: testId,
          user_id: user.id,
          status: 'registered'
        }]);

      if (error) {
        console.error('Registration error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      toast.success('Successfully registered for the test!');
      // Update local state to reflect the new registration
      setUserRegistrations(prev => new Set([...prev, testId]));
      fetchTests(); // Refresh to update registration count
    } catch {
      toast.error('Failed to register for test');
    }
  };

  const handleStartTest = async (testId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to take tests');
        router.push('/auth/signin');
        return;
      }

      // Check if registered using local state
      if (!userRegistrations.has(testId)) {
        toast.error('Please register for this test first');
        return;
      }

      // Check if test is currently available
      const test = tests.find(t => t.id === testId);
      if (!test) return;

      if (!isTestAvailable(test)) {
        const now = new Date();
        const testStart = test.event_start ? new Date(test.event_start) : null;
        const testEnd = test.event_end ? new Date(test.event_end) : null;

        if (testStart && now < testStart) {
          toast.error('Test has not started yet');
          return;
        }

        if (testEnd && now > testEnd) {
          toast.error('Test has ended');
          return;
        }

        toast.error('Test is not currently available');
        return;
      }

      // Check attempt limit
      const { data: attempts } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('test_id', testId)
        .eq('user_id', user.id);

      if (attempts && attempts.length >= test.max_attempts) {
        toast.error(`You have reached the maximum attempts (${test.max_attempts}) for this test`);
        return;
      }

      // Navigate to test
      router.push(`/tests/${testId}`);
    } catch {
      toast.error('Failed to start test');
    }
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "upcoming" && test.event_start && new Date(test.event_start) > new Date()) ||
      (filterStatus === "active" && 
       (!test.event_start || new Date(test.event_start) <= new Date()) &&
       (!test.event_end || new Date(test.event_end) >= new Date())) ||
      (filterStatus === "ended" && test.event_end && new Date(test.event_end) < new Date());
    
    const matchesCategory = selectedCategory === "All" || test.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getTestStatus = (test: Test) => {
    const now = new Date();
    const testStart = test.event_start ? new Date(test.event_start) : null;
    const testEnd = test.event_end ? new Date(test.event_end) : null;
    
    if (testStart && now < testStart) {
      return { 
        status: 'upcoming', 
        badge: <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Test Not Started</Badge>,
        message: testStart ? `Test starts ${testStart.toLocaleDateString()} at ${testStart.toLocaleTimeString()}` : 'Test not started'
      };
    } else if (testEnd && now > testEnd) {
      return { 
        status: 'ended', 
        badge: <Badge variant="secondary" className="bg-gray-500/10 text-gray-500">Test Ended</Badge>,
        message: `Test ended ${testEnd.toLocaleDateString()} at ${testEnd.toLocaleTimeString()}`
      };
    } else if (testStart && testEnd && now >= testStart && now <= testEnd) {
      return { 
        status: 'active', 
        badge: <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">Test Active</Badge>,
        message: testEnd ? `Test ends ${testEnd.toLocaleDateString()} at ${testEnd.toLocaleTimeString()}` : 'Test active'
      };
    } else if (!testStart && !testEnd) {
      return { 
        status: 'active', 
        badge: <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">Test Active</Badge>,
        message: 'Test always available'
      };
    } else {
      return { 
        status: 'inactive', 
        badge: <Badge variant="secondary" className="bg-gray-500/10 text-gray-500">Test Inactive</Badge>,
        message: 'Test not available'
      };
    }
  };

  const getRegistrationStatus = (test: Test) => {
    const now = new Date();
    const regStart = test.registration_start ? new Date(test.registration_start) : null;
    const regEnd = test.registration_end ? new Date(test.registration_end) : null;
    
    // Check if user is registered for this test
    if (userRegistrations.has(test.id)) {
      return { status: 'registered', badge: <Badge variant="default" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Registered</Badge> };
    }
    
    // Check registration dates
    if (regStart && now < regStart) {
      return { 
        status: 'pending', 
        badge: <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Registration Pending</Badge>,
        message: `Registration starts ${regStart.toLocaleDateString()} at ${regStart.toLocaleTimeString()}`
      };
    } else if (regEnd && now > regEnd) {
      return { 
        status: 'closed', 
        badge: <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">Registration Closed</Badge>,
        message: `Registration ended ${regEnd.toLocaleDateString()} at ${regEnd.toLocaleTimeString()}`
      };
    } else {
      return { 
        status: 'open', 
        badge: <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">Registration Open</Badge>,
        message: regEnd ? `Registration ends ${regEnd.toLocaleDateString()} at ${regEnd.toLocaleTimeString()}` : 'Registration open'
      };
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Programming":
        return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
      case "Web Development":
        return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
      case "Mobile Development":
        return "bg-gradient-to-r from-purple-500 to-violet-600 text-white"
      case "Data Science":
        return "bg-gradient-to-r from-red-500 to-pink-600 text-white"
      case "AI/ML":
        return "bg-gradient-to-r from-orange-500 to-amber-600 text-white"
      case "Cybersecurity":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "Database":
        return "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
      case "DevOps":
        return "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
      case "General Knowledge":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-600 text-white"
    }
  }

  const isTestAvailable = (test: Test) => {
    const now = new Date();
    const testStart = test.event_start ? new Date(test.event_start) : null;
    const testEnd = test.event_end ? new Date(test.event_end) : null;
    
    // If no dates are set, test is always available
    if (!testStart && !testEnd) {
      return true;
    }
    
    // If only start date is set, check if we're past it
    if (testStart && !testEnd) {
      return now >= testStart;
    }
    
    // If only end date is set, check if we're before it
    if (!testStart && testEnd) {
      return now <= testEnd;
    }
    
    // If both dates are set, check if we're within the window
    if (testStart && testEnd) {
      return now >= testStart && now <= testEnd;
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/10">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:20px_20px]",
            "[background-image:linear-gradient(to_right,rgba(99,102,241,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.8)_1px,transparent_1px)]",
            "dark:[background-image:linear-gradient(to_right,rgba(139,92,246,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.8)_1px,transparent_1px)]"
          )}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 animate-gradient"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container px-4 mx-auto relative z-10"
        >
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
              <div className="flex flex-col items-center justify-center gap-4">
                <button className="bg-slate-800 no-underline group relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block cursor-default">
                  <span className="absolute inset-0 overflow-hidden rounded-full">
                    <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </span>
                  <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
                    <span>Skill Assessment Hub</span>
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                </button>
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold tracking-tight leading-tight"
            >
              Master Your <span className="gradient-text">Skills</span> with Assessments
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              Register for tests, demonstrate your skills, and earn certificates. 
              Track your progress and compete on leaderboards.
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* Search and Filters - Redesigned */}
      <section className="py-8 bg-gradient-to-b from-muted/30 to-background relative border-b border-primary/10">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search tests by title, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-12 shadow-lg border-2 focus:border-primary/50 transition-all duration-300 bg-background/80 backdrop-blur-sm rounded-xl"
              />
            </div>
            {/* Filters Button */}
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>

          {/* Category Dropdown */}
          <div className="mt-4 w-full max-w-xs">
            <label htmlFor="category-select" className="block text-sm font-medium text-muted-foreground mb-1">Test Category</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background/80 shadow focus:border-primary focus:ring-2 focus:ring-primary/20 text-base"
            >
              {testCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Tests Section */}
      <section className="py-16 bg-gradient-to-b from-muted/30 to-background relative">
        <div className="container px-4 mx-auto relative z-10">

          {/* Header with Stats */}
          <motion.div 
            className="flex items-center justify-between mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                <span>Available Tests</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Browse <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">All Tests</span>
              </h2>
            </div>
            <div className="text-sm text-muted-foreground font-medium bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
              {filteredTests.length} tests found
            </div>
          </motion.div>

          {/* Tests Grid */}
          {filteredTests.length === 0 ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 animate-pulse"></div>
                <FileText className="h-16 w-16 text-muted-foreground relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No tests found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {searchTerm || filterStatus !== "all" || selectedCategory !== "All"
                  ? "Try adjusting your search terms or browse different categories."
                  : "No tests are currently available"
                }
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setFilterStatus("all")
                  setSelectedCategory("All")
                }}
                className="glow-effect hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-purple-600"
              >
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {filteredTests.map((test, index) => {
                const testStatus = getTestStatus(test);
                const regStatus = getRegistrationStatus(test);
                
                return (
                  <motion.div
                    key={test.id}
                    className="flex h-full"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className={cn(
                      "group relative overflow-hidden border-0 shadow-xl card-hover bg-gradient-to-br from-background to-muted/20 flex flex-col h-full w-full",
                      `hover:shadow-2xl hover:scale-105 transition-all duration-300`)}>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600"></div>
                      
                      {/* Test Image/Logo */}
                      <div className="h-32 w-full relative flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 border-b border-primary/10">
                        <div className="flex items-center justify-center w-full h-full">
                          <FileText className="h-12 w-12 text-muted-foreground opacity-40" />
                        </div>
                        {/* Category Badge */}
                        <div className="absolute top-2 left-2 flex gap-1 z-10">
                          <Badge className={`${getCategoryColor(test.category || 'General Knowledge')} shadow-lg text-xs`} variant="secondary">
                            {test.category || 'General Knowledge'}
                          </Badge>
                        </div>
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
                          {testStatus.badge}
                        </div>
                      </div>
                      
                      <CardHeader className="relative z-10 pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl font-bold group-hover:text-white transition-colors duration-300">
                              {test.name}
                            </CardTitle>
                            <CardDescription className="text-base text-muted-foreground group-hover:text-white/90 transition-colors duration-300 line-clamp-2 mt-2">
                              {test.description || "Test your knowledge and skills"}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-3">
                          {regStatus.badge}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="relative z-10 flex flex-col flex-1 justify-between pt-0">
                        {/* Test Meta */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 group-hover:text-white/90 transition-colors">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {test.duration_minutes}m
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              {test.passing_score}%
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {test.test_registrations?.[0]?.count || 0}
                            </span>
                          </div>
                        </div>
                        
                        {/* Test Timing Info */}
                        <div className="space-y-2 mb-4">
                          {(test.event_start || test.event_end) && (
                            <div className="text-xs text-muted-foreground group-hover:text-white/70 transition-colors">
                              {testStatus.message}
                            </div>
                          )}
                          {(test.registration_start || test.registration_end) && (
                            <div className="text-xs text-muted-foreground group-hover:text-white/70 transition-colors">
                              {regStatus.message}
                            </div>
                          )}
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {test.enable_leaderboard && testStatus.status === 'ended' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/tests/${test.id}/results`)}
                              className="text-xs bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-colors"
                            >
                              <Trophy className="w-3 h-3 mr-1" />
                              View Leaderboard
                            </Button>
                          )}
                          {test.enable_leaderboard && testStatus.status !== 'ended' && (
                            <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-colors">
                              <Trophy className="w-3 h-3 mr-1" />
                              Leaderboard
                            </Badge>
                          )}
                          {test.max_attempts > 1 && (
                            <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-colors">
                              <Brain className="w-3 h-3 mr-1" />
                              {test.max_attempts} Attempts
                            </Badge>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{test.test_registrations?.[0]?.count || 0} registered</span>
                            </div>
                          </div>
                          
                          {/* Registered User - Test Active */}
                          {regStatus.status === 'registered' && testStatus.status === 'active' && (
                            <Button
                              onClick={() => handleStartTest(test.id)}
                              size="lg"
                              className="
                                font-semibold 
                                px-4 py-2 
                                text-sm 
                                rounded-full 
                                bg-gradient-to-r from-primary to-purple-600 
                                hover:from-primary/90 hover:to-purple-600/90 
                                shadow-lg 
                                transition-transform duration-200 
                                transform-gpu hover:scale-105 
                                focus:ring-2 focus:ring-primary/40 
                                w-full sm:w-fit
                                text-center
                                max-w-full
                              "
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start Test <ArrowRight className="ml-1 h-4 w-4 flex-shrink-0" />
                            </Button>
                          )}

                          {/* Registered User - Test Not Started */}
                          {regStatus.status === 'registered' && testStatus.status === 'upcoming' && (
                            <Button variant="outline" disabled size="lg" className="w-full sm:w-fit">
                              Test Not Started Yet
                            </Button>
                          )}

                          {/* Registered User - Test Ended */}
                          {regStatus.status === 'registered' && testStatus.status === 'ended' && (
                            <Button
                              onClick={() => router.push(`/tests/${test.id}/results`)}
                              size="lg"
                              className="
                                font-semibold 
                                px-4 py-2 
                                text-sm 
                                rounded-full 
                                bg-gradient-to-r from-green-600 to-emerald-600 
                                hover:from-green-600/90 hover:to-emerald-600/90 
                                shadow-lg 
                                transition-transform duration-200 
                                transform-gpu hover:scale-105 
                                focus:ring-2 focus:ring-green-600/40 
                                w-full sm:w-fit
                                text-center
                                max-w-full
                              "
                            >
                              <Target className="w-4 h-4 mr-2" />
                              View Results <ArrowRight className="ml-1 h-4 w-4 flex-shrink-0" />
                            </Button>
                          )}

                          {/* Not Registered - Registration Open */}
                          {regStatus.status === 'open' && (
                            <Button
                              onClick={() => handleRegister(test.id)}
                              size="lg"
                              className="
                                font-semibold 
                                px-4 py-2 
                                text-sm 
                                rounded-full 
                                bg-gradient-to-r from-primary to-purple-600 
                                hover:from-primary/90 hover:to-purple-600/90 
                                shadow-lg 
                                transition-transform duration-200 
                                transform-gpu hover:scale-105 
                                focus:ring-2 focus:ring-primary/40 
                                w-full sm:w-fit
                                text-center
                                max-w-full
                              "
                            >
                              Register <ArrowRight className="ml-1 h-4 w-4 flex-shrink-0" />
                            </Button>
                          )}

                          {/* Registration Pending */}
                          {regStatus.status === 'pending' && (
                            <Button variant="outline" disabled size="lg" className="w-full sm:w-fit">
                              Registration Pending
                            </Button>
                          )}

                          {/* Registration Closed */}
                          {regStatus.status === 'closed' && (
                            <Button variant="outline" disabled size="lg" className="w-full sm:w-fit">
                              Registration Closed
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30 relative">
        <div className="container px-4 mx-auto relative z-10">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{tests.length}</div>
                  <div className="text-sm text-muted-foreground">Total Tests</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {tests.filter(t => {
                      const now = new Date();
                      const testStart = t.event_start ? new Date(t.event_start) : null;
                      const testEnd = t.event_end ? new Date(t.event_end) : null;
                      return (!testStart || now >= testStart) && (!testEnd || now <= testEnd);
                    }).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Tests</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {tests.reduce((sum, t) => sum + (t.test_registrations?.[0]?.count || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Registrations</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {tests.filter(t => t.enable_leaderboard).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Leaderboard Tests</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}