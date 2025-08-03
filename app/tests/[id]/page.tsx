"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, Calendar, Users, Award, Star, Sparkles, FileText, Play, CheckCircle, Trophy, Target, BookOpen, Brain, Zap } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Footer from "@/components/footer"
import type { Test } from "@/types/test-management"

export default function TestDetailPage() {
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registrationCount, setRegistrationCount] = useState(0)
  const [userAttempts, setUserAttempts] = useState<any[]>([])
  const [hasCompleted, setHasCompleted] = useState(false)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [registrationData, setRegistrationData] = useState({
    full_name: '',
    email: '',
    phone: '',
    institution: '',
    department: '',
    year_of_study: '',
    experience_level: '',
    agree_to_terms: false
  })
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const testId = params?.id as string

  useEffect(() => {
    fetchTest()
    checkAuth()
  }, [testId])

  const fetchTest = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tests')
        .select(`
          *,
          test_registrations(count),
          test_questions(count)
        `)
        .eq('id', testId)
        .eq('is_public', true)
        .single()

      if (error) throw error
      setTest(data)
      
      // Get registration count
      if (data.test_registrations?.[0]?.count) {
        setRegistrationCount(data.test_registrations[0].count)
      }
    } catch (error) {
      toast.error('Failed to fetch test details')
      console.error('Error fetching test:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      
      if (user) {
        // Check if user is registered for this test
        const { data: registration } = await supabase
          .from('test_registrations')
          .select('*')
          .eq('test_id', testId)
          .eq('user_id', user.id)
          .single()
        
        setIsRegistered(!!registration)

        // Check user's attempts for this test
        const { data: attempts } = await supabase
          .from('test_attempts')
          .select('*')
          .eq('test_id', testId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        setUserAttempts(attempts || [])
        
        // Check if user has completed the test (has submitted attempts)
        const hasSubmittedAttempts = attempts?.some(attempt => 
          attempt.status === 'submitted' || attempt.submitted_at
        )
        setHasCompleted(!!hasSubmittedAttempts)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
    }
  }

  const handleRegister = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Please sign in to register for tests')
        router.push('/auth/signin')
        return
      }

      if (isRegistered) {
        toast.error('You are already registered for this test')
        return
      }

      // Show registration form
      setShowRegistrationForm(true)
    } catch (error) {
      toast.error('Failed to register for test')
    }
  }

  const handleRegistrationSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Please sign in to register for tests')
        return
      }

      // Validate required fields
      if (!registrationData.full_name || !registrationData.email || !registrationData.agree_to_terms) {
        toast.error('Please fill in all required fields and agree to terms')
        return
      }

      // Register for the test with additional data
      const { error } = await supabase
        .from('test_registrations')
        .insert([{
          test_id: testId,
          user_id: user.id,
          status: 'registered',
          registration_data: registrationData // Store additional data as JSON
        }])

      if (error) throw error

      toast.success('Successfully registered for the test!')
      setIsRegistered(true)
      setRegistrationCount(prev => prev + 1)
      setShowRegistrationForm(false)
      
      // Reset form
      setRegistrationData({
        full_name: '',
        email: '',
        phone: '',
        institution: '',
        department: '',
        year_of_study: '',
        experience_level: '',
        agree_to_terms: false
      })
    } catch (error) {
      toast.error('Failed to register for test')
    }
  }

  const handleStartTest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Please sign in to take tests')
        router.push('/auth/signin')
        return
      }

      if (!isRegistered) {
        toast.error('Please register for this test first')
        return
      }

      // Check if user has already completed the test
      if (hasCompleted) {
        toast.error('You have already completed this test')
        return
      }

      // Check if test is currently active
      if (!test) return

      const now = new Date()
      const testStart = test.event_start ? new Date(test.event_start) : null
      const testEnd = test.event_end ? new Date(test.event_end) : null

      if (testStart && now < testStart) {
        toast.error('Test has not started yet')
        return
      }

      if (testEnd && now > testEnd) {
        toast.error('Test has ended')
        return
      }

      // Check attempt limit
      if (userAttempts.length >= test.max_attempts) {
        toast.error(`You have reached the maximum attempts (${test.max_attempts}) for this test`)
        return
      }

      // Navigate to test
      router.push(`/tests/${testId}/take`)
    } catch (error) {
      toast.error('Failed to start test')
    }
  }

  const getTestStatus = (test: Test) => {
    const now = new Date()
    const testStart = test.event_start ? new Date(test.event_start) : null
    const testEnd = test.event_end ? new Date(test.event_end) : null
    
    if (testStart && now < testStart) {
      return { status: 'upcoming', badge: <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Upcoming</Badge> }
    } else if (testEnd && now > testEnd) {
      return { status: 'ended', badge: <Badge variant="secondary" className="bg-gray-500/10 text-gray-500">Ended</Badge> }
    } else {
      return { status: 'active', badge: <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge> }
    }
  }

  const getRegistrationStatus = (test: Test) => {
    if (!test.registration_start || !test.registration_end) {
      return { status: 'open', badge: <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">Open</Badge> }
    }
    
    const now = new Date()
    const regStart = new Date(test.registration_start)
    const regEnd = new Date(test.registration_end)
    
    if (now < regStart) {
      return { status: 'pending', badge: <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Registration Pending</Badge> }
    } else if (now > regEnd) {
      return { status: 'closed', badge: <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">Registration Closed</Badge> }
    } else {
      return { status: 'open', badge: <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">Registration Open</Badge> }
    }
  }

  const getCompletionStatus = () => {
    if (!isAuthenticated || !isRegistered) return null
    
    if (hasCompleted) {
      return { 
        status: 'completed', 
        badge: <Badge variant="default" className="bg-purple-500/10 text-purple-500 border-purple-500/20">Completed</Badge>,
        message: 'You have completed this test'
      }
    }
    
    if (userAttempts.length >= (test?.max_attempts || 1)) {
      return { 
        status: 'max_attempts', 
        badge: <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">Max Attempts Reached</Badge>,
        message: `You have used all ${test?.max_attempts || 1} attempts`
      }
    }
    
    return null
  }

  const canStartTest = () => {
    if (!isAuthenticated || !isRegistered) return false
    if (hasCompleted) return false
    if (userAttempts.length >= (test?.max_attempts || 1)) return false
    return true
  }

  // --- Tab Content Renderers ---
  const renderAbout = () => (
    <div className="space-y-6">
      <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          About the Test
        </h2>
        <p className="text-lg leading-relaxed mb-6">{test?.description || "Test your knowledge and skills with this comprehensive assessment."}</p>
        
        {/* Test Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="flex items-center gap-3 p-4 bg-background/30 rounded-lg border border-primary/10">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <div className="font-semibold">Duration</div>
              <div className="text-sm text-muted-foreground">{test?.duration_minutes} minutes</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-background/30 rounded-lg border border-primary/10">
            <Target className="h-5 w-5 text-primary" />
            <div>
              <div className="font-semibold">Passing Score</div>
              <div className="text-sm text-muted-foreground">{test?.passing_score}%</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-background/30 rounded-lg border border-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <div className="font-semibold">Questions</div>
              <div className="text-sm text-muted-foreground">Multiple questions</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-background/30 rounded-lg border border-primary/10">
            <Brain className="h-5 w-5 text-primary" />
            <div>
              <div className="font-semibold">Max Attempts</div>
              <div className="text-sm text-muted-foreground">{test?.max_attempts} attempt{test?.max_attempts !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderInstructions = () => (
    <div className="space-y-6">
      <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          Test Instructions
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-semibold text-primary">1</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Read Carefully</h3>
              <p className="text-muted-foreground">Read each question carefully before answering. You can review your answers before submitting.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-semibold text-primary">2</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Time Management</h3>
              <p className="text-muted-foreground">You have {test?.duration_minutes} minutes to complete the test. Use your time wisely.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-semibold text-primary">3</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">No Cheating</h3>
              <p className="text-muted-foreground">Do not use external resources or communicate with others during the test. Violations will result in disqualification.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-semibold text-primary">4</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Submit on Time</h3>
              <p className="text-muted-foreground">Ensure you submit your test before the time limit. Unsubmitted tests will be automatically submitted.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderResults = () => (
    <div className="space-y-6">
      <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          Results & Certificates
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-background/30 rounded-lg border border-primary/10">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <div className="font-semibold">Immediate Results</div>
              <div className="text-sm text-muted-foreground">Get your score immediately after completing the test</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-background/30 rounded-lg border border-primary/10">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <div>
              <div className="font-semibold">Leaderboard</div>
              <div className="text-sm text-muted-foreground">
                {test?.enable_leaderboard ? 'Compete on the leaderboard with other participants' : 'Leaderboard not available for this test'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-background/30 rounded-lg border border-primary/10">
            <Star className="h-5 w-5 text-purple-500" />
            <div>
              <div className="font-semibold">Certificates</div>
              <div className="text-sm text-muted-foreground">
                {test?.certificate_template_id ? 'Earn a certificate upon passing the test' : 'No certificate available for this test'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const testTabs = [
    {
      title: "About",
      value: "about",
      content: renderAbout(),
    },
    {
      title: "Instructions",
      value: "instructions",
      content: renderInstructions(),
    },
    {
      title: "Results",
      value: "results",
      content: renderResults(),
    },
  ]

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

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
            <div className="absolute inset-0 w-16 h-16 bg-primary/10 rounded-full blur-xl animate-pulse mx-auto"></div>
          </div>
          <h1 className="text-2xl font-bold">Test not found</h1>
          <Button asChild className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
            <Link href="/tests">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tests
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  const testStatus = getTestStatus(test)
  const regStatus = getRegistrationStatus(test)
  const completionStatus = getCompletionStatus()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Back to Tests - full width, above banner */}
      <div className="w-full bg-background/90 sticky top-0 z-50 border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" asChild className="hover:bg-primary/10 transition-colors">
            <Link href="/tests">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tests
            </Link>
          </Button>
        </div>
      </div>

      {/* Test Banner - full width, edge-to-edge */}
      <div className="w-full relative">
        <div className="aspect-[2/1] sm:aspect-[4/1] bg-gradient-to-br from-primary/10 via-purple-500/10 to-background overflow-hidden rounded-b-2xl">
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <FileText className="h-12 w-12 text-white" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold">{test.name}</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {test.description || "Test your knowledge and skills with this comprehensive assessment"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - centered, white background, margin-top */}
      <div className="flex-1 flex flex-col">
        <div className="w-full flex justify-center pt-8 md:pt-12 pb-24">
          <div className="max-w-6xl w-full bg-white dark:bg-background rounded-2xl shadow-lg mt-0 relative z-10 px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content with Tabs */}
              <div className="lg:col-span-2 space-y-8">
                {/* Test Header */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    {testStatus.badge}
                    {regStatus.badge}
                    {completionStatus && completionStatus.badge}
                    {test.enable_leaderboard && (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                        <Trophy className="h-3 w-3 mr-1" />
                        Leaderboard
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Registration Card (mobile only) */}
                <div className="block lg:hidden mb-4">
                  <Card className="border border-primary/10 shadow-md">
                    <CardHeader>
                      <CardTitle>Registration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{registrationCount} participants registered</span>
                      </div>
                      {test.registration_start && test.registration_end && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Registration deadline</span>
                          <span className="font-medium text-foreground">
                            {new Date(test.registration_end).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      {regStatus.status === 'open' && testStatus.status === 'active' && !isRegistered && (
                        <Button onClick={handleRegister} className="w-full">
                          Register Now
                        </Button>
                      )}
                      {regStatus.status === 'open' && testStatus.status === 'active' && canStartTest() && (
                        <Button onClick={handleStartTest} className="w-full">
                          <Play className="mr-2 h-4 w-4" />
                          Start Test
                        </Button>
                      )}
                      {completionStatus && (
                        <div className="space-y-2">
                          {completionStatus.badge}
                          <p className="text-sm text-muted-foreground">{completionStatus.message}</p>
                          {hasCompleted && userAttempts.length > 0 && (
                            <Button variant="outline" asChild className="w-full">
                              <Link href={`/tests/${testId}/results?attempt=${userAttempts[0].id}`}>
                                View Results
                              </Link>
                            </Button>
                          )}
                        </div>
                      )}
                      {regStatus.status === 'closed' && (
                        <Button variant="outline" disabled className="w-full">
                          Registration Closed
                        </Button>
                      )}
                      {testStatus.status === 'upcoming' && (
                        <Button variant="outline" disabled className="w-full">
                          Coming Soon
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs */}
                <div className="w-full">
                  <Tabs defaultValue="about" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="about">About</TabsTrigger>
                      <TabsTrigger value="instructions">Instructions</TabsTrigger>
                      <TabsTrigger value="results">Results</TabsTrigger>
                    </TabsList>
                    <TabsContent value="about">
                      {renderAbout()}
                    </TabsContent>
                    <TabsContent value="instructions">
                      {renderInstructions()}
                    </TabsContent>
                    <TabsContent value="results">
                      {renderResults()}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* Sidebar (Test Details, Registration, Need Help) */}
              <div className="space-y-6">
                {/* Registration Card (desktop only) */}
                <div className="hidden lg:block">
                  <Card className="border border-primary/10 shadow-md">
                    <CardHeader>
                      <CardTitle>Registration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{registrationCount} participants registered</span>
                      </div>
                      {test.registration_start && test.registration_end && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Registration deadline</span>
                          <span className="font-medium text-foreground">
                            {new Date(test.registration_end).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      {regStatus.status === 'open' && testStatus.status === 'active' && !isRegistered && (
                        <Button onClick={handleRegister} className="w-full">
                          Register Now
                        </Button>
                      )}
                      {regStatus.status === 'open' && testStatus.status === 'active' && canStartTest() && (
                        <Button onClick={handleStartTest} className="w-full">
                          <Play className="mr-2 h-4 w-4" />
                          Start Test
                        </Button>
                      )}
                      {completionStatus && (
                        <div className="space-y-2">
                          {completionStatus.badge}
                          <p className="text-sm text-muted-foreground">{completionStatus.message}</p>
                          {hasCompleted && userAttempts.length > 0 && (
                            <Button variant="outline" asChild className="w-full">
                              <Link href={`/tests/${testId}/results?attempt=${userAttempts[0].id}`}>
                                View Results
                              </Link>
                            </Button>
                          )}
                        </div>
                      )}
                      {regStatus.status === 'closed' && (
                        <Button variant="outline" disabled className="w-full">
                          Registration Closed
                        </Button>
                      )}
                      {testStatus.status === 'upcoming' && (
                        <Button variant="outline" disabled className="w-full">
                          Coming Soon
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Test Details Card */}
                <Card className="border border-primary/10 shadow-md">
                  <CardHeader>
                    <CardTitle>Test Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="block text-xs text-muted-foreground">Duration</span>
                      <span className="font-medium">{test.duration_minutes} minutes</span>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground">Passing Score</span>
                      <span className="font-medium">{test.passing_score}%</span>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground">Max Attempts</span>
                      <span className="font-medium">{test.max_attempts} attempt{test.max_attempts !== 1 ? 's' : ''}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground">Questions</span>
                      <span className="font-medium">Multiple questions</span>
                    </div>
                    {test.event_start && (
                      <div>
                        <span className="block text-xs text-muted-foreground">Test Start</span>
                        <span className="font-medium">{new Date(test.event_start).toLocaleDateString()}</span>
                      </div>
                    )}
                    {test.event_end && (
                      <div>
                        <span className="block text-xs text-muted-foreground">Test End</span>
                        <span className="font-medium">{new Date(test.event_end).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div>
                      <span className="block text-xs text-muted-foreground">Leaderboard</span>
                      <span className="font-medium">{test.enable_leaderboard ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Need Help Card */}
                <Card className="border border-primary/10 shadow-md">
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Have questions about this test? Contact our support team or check the FAQ section.
                    </p>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl py-3 px-4 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 border-0"
                      asChild
                    >
                      <Link href="/contact">
                        Contact Support
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Disclaimer Section */}
            <div className="mt-6 mb-2 max-w-3xl">
              <div className="bg-background/50 border border-primary/10 rounded-xl p-4">
                <p className="text-xs text-muted-foreground text-left">
                  This test is provided by Codeunia. Please ensure you have a stable internet connection and a quiet environment before starting the test. Any technical issues should be reported immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Register for Test</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRegistrationForm(false)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={registrationData.full_name}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={registrationData.phone}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Institution */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Institution/Company
                  </label>
                  <input
                    type="text"
                    value={registrationData.institution}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, institution: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your institution or company"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={registrationData.department}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your department"
                  />
                </div>

                {/* Year of Study */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Year of Study
                  </label>
                  <select
                    value={registrationData.year_of_study}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, year_of_study: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Experience Level
                  </label>
                  <select
                    value={registrationData.experience_level}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, experience_level: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select experience level</option>
                    <option value="Beginner">Beginner (0-1 years)</option>
                    <option value="Intermediate">Intermediate (1-3 years)</option>
                    <option value="Advanced">Advanced (3-5 years)</option>
                    <option value="Expert">Expert (5+ years)</option>
                  </select>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="agree-terms"
                    checked={registrationData.agree_to_terms}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, agree_to_terms: e.target.checked }))}
                    className="mt-1"
                  />
                  <label htmlFor="agree-terms" className="text-sm">
                    I agree to the test terms and conditions, and confirm that I will not cheat or use unauthorized resources during the test. *
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleRegistrationSubmit}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  Complete Registration
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      <Footer/>
    </div>
  )
} 