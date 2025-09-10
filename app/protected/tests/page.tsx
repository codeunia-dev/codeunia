"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Target, 
  Award, 
  Calendar,
  Users,
  TrendingUp,
  BookOpen,
  Star,
  FileText,
  BarChart3
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface TestRegistration {
  id: string
  test_id: string
  status: string
  registration_date: string
  test: {
    id: string
    name: string
    description: string
    duration_minutes: number
    passing_score: number
    max_attempts: number
    enable_leaderboard: boolean
  }
}

interface TestAttempt {
  id: string
  test_id: string
  score: number
  max_score: number
  time_taken_minutes: number
  passed: boolean
  status: string
  submitted_at: string
  test: {
    id: string
    name: string
    description: string
    passing_score: number
    enable_leaderboard: boolean
  }
}

interface TestStats {
  totalRegistrations: number
  totalAttempts: number
  passedTests: number
  averageScore: number
  totalTimeSpent: number
  currentRankings: number
}

export default function TestDashboard() {
  const [registrations, setRegistrations] = useState<TestRegistration[]>([])
  const [attempts, setAttempts] = useState<TestAttempt[]>([])
  const [stats, setStats] = useState<TestStats>({
    totalRegistrations: 0,
    totalAttempts: 0,
    passedTests: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    currentRankings: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchUserTestData = useCallback(async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to view your test dashboard')
        return
      }

      // Fetch test registrations
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('test_registrations')
        .select(`
          id,
          test_id,
          status,
          registration_date,
          tests!inner(
            id,
            name,
            description,
            duration_minutes,
            passing_score,
            max_attempts,
            enable_leaderboard
          )
        `)
        .eq('user_id', user.id)
        .order('registration_date', { ascending: false })

      if (registrationsError) throw registrationsError

      // Fetch test attempts
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('test_attempts')
        .select(`
          id,
          test_id,
          score,
          max_score,
          time_taken_minutes,
          passed,
          status,
          submitted_at,
          tests!inner(
            id,
            name,
            description,
            passing_score,
            enable_leaderboard
          )
        `)
        .eq('user_id', user.id)
        .not('submitted_at', 'is', null)
        .order('submitted_at', { ascending: false })

      if (attemptsError) throw attemptsError

      // Process registrations data
      const processedRegistrations = (registrationsData || []).map(reg => ({
        id: reg.id,
        test_id: reg.test_id,
        status: reg.status,
        registration_date: reg.registration_date,
        test: Array.isArray(reg.tests) ? reg.tests[0] : reg.tests
      }))

      // Process attempts data
      const processedAttempts = (attemptsData || []).map(attempt => ({
        id: attempt.id,
        test_id: attempt.test_id,
        score: attempt.score,
        max_score: attempt.max_score,
        time_taken_minutes: attempt.time_taken_minutes,
        passed: attempt.passed,
        status: attempt.status,
        submitted_at: attempt.submitted_at,
        test: Array.isArray(attempt.tests) ? attempt.tests[0] : attempt.tests
      }))

      // Calculate statistics
      const totalRegistrations = processedRegistrations.length
      const totalAttempts = processedAttempts.length
      const passedTests = processedAttempts.filter(attempt => attempt.passed).length
      const averageScore = totalAttempts > 0 
        ? Math.round(processedAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.max_score * 100), 0) / totalAttempts)
        : 0
      const totalTimeSpent = processedAttempts.reduce((sum, attempt) => sum + attempt.time_taken_minutes, 0)

      setRegistrations(processedRegistrations)
      setAttempts(processedAttempts)
      setStats({
        totalRegistrations,
        totalAttempts,
        passedTests,
        averageScore,
        totalTimeSpent,
        currentRankings: 0 // TODO: Calculate actual rankings
      })

    } catch (error) {
      console.error('Error fetching test data:', error)
      toast.error('Failed to load test dashboard')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchUserTestData()
  }, [fetchUserTestData])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatScore = (score: number, maxScore: number) => {
    const percentage = Math.round((score / maxScore) * 100)
    return `${score}/${maxScore} (${percentage}%)`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'registered':
        return <Badge variant="default" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Registered</Badge>
      case 'attempted':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Attempted</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPassFailBadge = (passed: boolean) => {
    return passed ? (
      <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
        <CheckCircle className="h-3 w-3 mr-1" />
        Passed
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">
        <XCircle className="h-3 w-3 mr-1" />
        Failed
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your test dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Test Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Track your test registrations, attempts, and achievements
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
                    <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tests Attempted</p>
                    <p className="text-2xl font-bold">{stats.totalAttempts}</p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tests Passed</p>
                    <p className="text-2xl font-bold">{stats.passedTests}</p>
                  </div>
                  <Award className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">{stats.averageScore}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="registrations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="registrations">Registrations</TabsTrigger>
              <TabsTrigger value="attempts">Test Results</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            {/* Registrations Tab */}
            <TabsContent value="registrations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Test Registrations
                  </CardTitle>
                  <CardDescription>
                    Your test registration history and current status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {registrations.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No test registrations yet</p>
                      <Link href="/tests" className="mt-4">
                        <Button>Browse Available Tests</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {registrations.map((registration, index) => (
                        <motion.div
                          key={registration.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{registration.test.name}</h3>
                              {getStatusBadge(registration.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {registration.test.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {registration.test.duration_minutes}m
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {registration.test.passing_score}% pass
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {registration.test.max_attempts} attempts
                              </span>
                              {registration.test.enable_leaderboard && (
                                <span className="flex items-center gap-1">
                                  <Trophy className="h-3 w-3" />
                                  Leaderboard
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Registered: {formatDate(registration.registration_date)}
                            </p>
                            <Link href={`/tests/${registration.test_id}`}>
                              <Button variant="outline" size="sm" className="mt-2">
                                View Test
                              </Button>
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Test Results Tab */}
            <TabsContent value="attempts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Test Results
                  </CardTitle>
                  <CardDescription>
                    Your test attempts and performance history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {attempts.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No test attempts yet</p>
                      <Link href="/tests" className="mt-4">
                        <Button>Take Your First Test</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {attempts.map((attempt, index) => (
                        <motion.div
                          key={attempt.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-lg border transition-colors",
                            attempt.passed 
                              ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/10" 
                              : "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
                          )}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{attempt.test.name}</h3>
                              {getPassFailBadge(attempt.passed)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {attempt.test.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                Score: {formatScore(attempt.score, attempt.max_score)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Time: {formatTime(attempt.time_taken_minutes)}
                              </span>
                              {attempt.test.enable_leaderboard && (
                                <span className="flex items-center gap-1">
                                  <Trophy className="h-3 w-3" />
                                  <Link href={`/tests/${attempt.test_id}/leaderboard`} className="hover:underline">
                                    View Leaderboard
                                  </Link>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Completed: {formatDate(attempt.submitted_at)}
                            </p>
                            <Link href={`/tests/${attempt.test_id}/results?attempt=${attempt.id}`}>
                              <Button variant="outline" size="sm" className="mt-2">
                                View Results
                              </Button>
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Performance Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Success Rate</span>
                      <span className="text-lg font-bold">
                        {stats.totalAttempts > 0 ? Math.round((stats.passedTests / stats.totalAttempts) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Time Spent</span>
                      <span className="text-lg font-bold">{formatTime(stats.totalTimeSpent)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Tests Completed</span>
                      <span className="text-lg font-bold">{stats.totalAttempts}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-purple-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/tests" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Browse Available Tests
                      </Button>
                    </Link>
                    <Link href="/leaderboard" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <Trophy className="h-4 w-4 mr-2" />
                        View Global Leaderboard
                      </Button>
                    </Link>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={fetchUserTestData}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Refresh Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
