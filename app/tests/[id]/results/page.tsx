"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, CheckCircle, XCircle, Trophy, Target, Brain, Award, Star, Share2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Footer from "@/components/footer"
import type { Test, TestAttempt } from "@/types/test-management"
import { CertificateGenerator } from '@/components/CertificateGenerator';

export default function TestResultsPage() {
  const [test, setTest] = useState<Test | null>(null)
  const [attempt, setAttempt] = useState<TestAttempt | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const [showCertificateGenerator, setShowCertificateGenerator] = useState(false);
  
  const testId = params?.id as string
  const attemptId = searchParams.get('attempt')

  useEffect(() => {
    fetchResults()
  }, [testId, attemptId])

  const fetchResults = async () => {
    try {
      setLoading(true)
      
      if (!attemptId) {
        toast.error('No attempt ID provided')
        router.push(`/tests/${testId}`)
        return
      }

      // Fetch test details
      const { data: testData, error: testError } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .single()

      if (testError) throw testError
      setTest(testData)

      // Fetch attempt details
      const { data: attemptData, error: attemptError } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('id', attemptId)
        .single()

      if (attemptError) throw attemptError
      setAttempt(attemptData)
    } catch (error) {
      toast.error('Failed to load results')
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const shareResults = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      toast.success('Results link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

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

  if (!test || !attempt) {
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
          <h1 className="text-2xl font-bold">Results not found</h1>
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

  const scorePercentage = attempt.score && attempt.max_score 
    ? Math.round((attempt.score / attempt.max_score) * 100)
    : 0

  const isPassed = attempt.passed || false
  const timeTaken = attempt.time_taken_minutes || 0

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="w-full bg-background/90 sticky top-0 z-50 border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" asChild className="hover:bg-primary/10 transition-colors">
            <Link href={`/tests/${testId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Test
            </Link>
          </Button>
          
          <Button variant="outline" onClick={shareResults} className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share Results
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex justify-center py-8">
        <div className="max-w-4xl w-full px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Results Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                {isPassed ? (
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                    <XCircle className="h-10 w-10 text-red-500" />
                  </div>
                )}
              </div>
              
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {isPassed ? 'Congratulations!' : 'Test Completed'}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {isPassed 
                    ? 'You have successfully passed the test!' 
                    : 'You have completed the test. Keep practicing to improve your score!'
                  }
                </p>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Badge 
                  variant={isPassed ? "default" : "secondary"}
                  className={cn(
                    isPassed 
                      ? "bg-green-500/10 text-green-500 border-green-500/20" 
                      : "bg-red-500/10 text-red-500 border-red-500/20"
                  )}
                >
                  {isPassed ? 'PASSED' : 'FAILED'}
                </Badge>
              </div>
            </div>

            {/* Score Card */}
            <Card className="border border-primary/10 shadow-lg">
              <CardHeader>
                <CardTitle className="text-center">Your Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-primary">
                    {scorePercentage}%
                  </div>
                  
                  <div className="text-lg text-muted-foreground">
                    {attempt.score} out of {attempt.max_score} points
                  </div>

                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={cn(
                        "h-3 rounded-full transition-all duration-1000",
                        isPassed ? "bg-green-500" : "bg-red-500"
                      )}
                      style={{ width: `${scorePercentage}%` }}
                    />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Passing score: {test.passing_score}%
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-primary/10 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Test Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Test Name</span>
                    <span className="font-medium">{test.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{test.category || 'General Knowledge'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{test.duration_minutes} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Time Taken</span>
                    <span className="font-medium">{timeTaken} minutes</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-primary/10 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Score</span>
                    <span className="font-medium">{attempt.score}/{attempt.max_score}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Percentage</span>
                    <span className="font-medium">{scorePercentage}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge 
                      variant={isPassed ? "default" : "secondary"}
                      className={cn(
                        isPassed 
                          ? "bg-green-500/10 text-green-500 border-green-500/20" 
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      )}
                    >
                      {isPassed ? 'PASSED' : 'FAILED'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Submitted</span>
                    <span className="font-medium">
                      {attempt.submitted_at 
                        ? new Date(attempt.submitted_at).toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                <Link href="/tests">
                  Browse More Tests
                </Link>
              </Button>
              
              {test.enable_leaderboard && (
                <Button variant="outline" asChild>
                  <Link href={`/tests/${testId}/leaderboard`}>
                    <Trophy className="mr-2 h-4 w-4" />
                    View Leaderboard
                  </Link>
                </Button>
              )}

              {isPassed && test.certificate_template_id && (
                <Button variant="outline" asChild>
                  <Link href={`/verify/cert/${attempt.id}`}>
                    <Award className="mr-2 h-4 w-4" />
                    View Certificate
                  </Link>
                </Button>
              )}
            </div>

            {/* Encouragement */}
            <Card className="border border-primary/10 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  {isPassed ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Star className="h-5 w-5" />
                      <span className="font-semibold">Excellent work! You've demonstrated strong knowledge in this area.</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-orange-600">
                      <Brain className="h-5 w-5" />
                      <span className="font-semibold">Keep practicing! Review the material and try again to improve your score.</span>
                    </div>
                  )}
                  
                  <p className="text-muted-foreground">
                    {isPassed 
                      ? "Continue learning and take on more challenging tests to further develop your skills."
                      : "Don't be discouraged. Learning is a journey, and every attempt helps you grow."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      <Footer/>
      {isPassed && test.certificate_template_id && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Certificate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showCertificateGenerator ? (
              <CertificateGenerator
                context="test"
                userData={{
                  name: `User ${attempt.user_id?.slice(0, 8)}`,
                  score: attempt.score,
                  testName: test.name,
                  cert_id: `CU-TEST-${test.id}-${attempt.user_id}`,
                  email: 'user@example.com',
                  issued_date: new Date().toLocaleDateString(),
                  category: test.category || 'Test Completion',
                  duration: `${attempt.time_taken_minutes || 0} minutes`,
                  organization: 'CodeUnia'
                }}
                templateId={test.certificate_template_id}
                onComplete={(certURL) => {
                  toast.success('Certificate generated successfully!');
                  setShowCertificateGenerator(false);
                }}
                onError={(error) => {
                  toast.error(`Certificate generation failed: ${error}`);
                }}
                showPreview={true}
                autoGenerate={false}
              />
            ) : (
              <div className="text-center py-6">
                <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Congratulations!</h3>
                <p className="text-muted-foreground mb-4">
                  You've passed the test! Generate your certificate to showcase your achievement.
                </p>
                <Button onClick={() => setShowCertificateGenerator(true)}>
                  <Award className="w-4 h-4 mr-2" />
                  Generate Certificate
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 