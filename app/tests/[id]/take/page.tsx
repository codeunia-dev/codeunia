"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, FileText, AlertTriangle, CheckCircle, Timer, Brain, Target } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Footer from "@/components/footer"
import { activityService } from "@/lib/services/activity"
import type { Test, TestQuestion } from "@/types/test-management"

export default function TakeTestPage() {
  const [test, setTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [testStarted, setTestStarted] = useState(false)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [violations, setViolations] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const testId = params?.id as string

  useEffect(() => {
    fetchTestAndQuestions()
  }, [testId])

  useEffect(() => {
    if (testStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitTest()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [testStarted, timeRemaining])

  // Full-screen and tab switching detection
  useEffect(() => {
    if (!testStarted) return

    const handleFullScreenChange = () => {
      const isInFullScreen = !!document.fullscreenElement
      setIsFullScreen(isInFullScreen)
      
      // If full-screen was lost and test is active, force it back
      if (!isInFullScreen && testStarted) {
        setTimeout(() => {
          requestFullScreen()
        }, 1000)
      }
    }

      const handleVisibilityChange = () => {
    if (document.hidden) {
      const newViolations = violations + 1
      setViolations(newViolations)
      setShowWarning(true)
      toast.error(`Tab switching detected! This is violation ${newViolations}/2.`)
      
      // Force full-screen after first violation
      if (newViolations === 1) {
        setTimeout(() => {
          requestFullScreen()
        }, 1000)
      }
      
      // Auto-submit test after 2 violations
      if (newViolations >= 2) {
        toast.error('Maximum violations reached! Test will be submitted automatically.')
        setTimeout(() => {
          handleSubmitTest()
        }, 2000)
        return
      }
      
      // Hide warning after 3 seconds
      setTimeout(() => setShowWarning(false), 3000)
    }
  }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F11, Alt+F4, Ctrl+W, Ctrl+N, etc.
      if (e.key === 'F11' || 
          (e.altKey && e.key === 'F4') ||
          (e.ctrlKey && (e.key === 'w' || e.key === 'n' || e.key === 't' || e.key === 'Tab'))) {
        e.preventDefault()
        toast.error('This action is not allowed during the test')
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      toast.error('Right-click is disabled during the test')
    }

    // Add event listeners
    document.addEventListener('fullscreenchange', handleFullScreenChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleContextMenu)

    // Request full-screen on test start
    if (testStarted && !isFullScreen) {
      requestFullScreen()
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [testStarted, isFullScreen])

  const requestFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullScreen(true)
      }
    } catch (error) {
      console.error('Failed to enter full-screen mode:', error)
      toast.error('Please enable full-screen mode for the test')
    }
  }

  const exitFullScreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        setIsFullScreen(false)
      }
    } catch (error) {
      console.error('Failed to exit full-screen mode:', error)
    }
  }

  const updateViolations = async () => {
    if (!attemptId) return
    
    try {
      const { error } = await supabase
        .from('test_attempts')
        .update({ violations_count: violations })
        .eq('id', attemptId)
      
      if (error) {
        console.error('Error updating violations:', error)
      }
    } catch (error) {
      console.error('Error updating violations:', error)
    }
  }

  // Update violations in database when violations change
  useEffect(() => {
    if (testStarted && attemptId) {
      updateViolations()
    }
  }, [violations, testStarted, attemptId])

  const fetchTestAndQuestions = async () => {
    try {
      setLoading(true)
      
      // Fetch test details
      const { data: testData, error: testError } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .eq('is_public', true)
        .single()

      if (testError) throw testError
      setTest(testData)

      // Set initial time
      setTimeRemaining(testData.duration_minutes * 60)
    } catch (error) {
      toast.error('Failed to load test')
      console.error('Error fetching test:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestions = async () => {
    try {
      // Fetch questions only after user is registered
      const { data: questionsData, error: questionsError } = await supabase
        .from('test_questions')
        .select('*')
        .eq('test_id', testId)
        .order('order_index', { ascending: true })

      console.log('Questions fetch result:', { questionsData, error: questionsError })

      if (questionsError) {
        console.error('Error fetching questions:', questionsError)
        throw questionsError
      }

      setQuestions(questionsData || [])
      console.log('Questions loaded:', questionsData?.length || 0)
    } catch (error) {
      toast.error('Failed to load questions')
      console.error('Error fetching questions:', error)
    }
  }

  const startTest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Please sign in to take tests')
        router.push('/auth/signin')
        return
      }

      console.log('Starting test for user:', user.id)
      console.log('Test ID:', testId)

      // Check if user is registered for this test
      const { data: registration, error: regError } = await supabase
        .from('test_registrations')
        .select('*')
        .eq('test_id', testId)
        .eq('user_id', user.id)
        .single()

      console.log('Registration check:', { registration, error: regError })

      if (regError && regError.code !== 'PGRST116') {
        console.error('Error checking registration:', regError)
        toast.error('Error checking registration status')
        return
      }

      if (!registration) {
        toast.error('You must register for this test before taking it')
        router.push(`/tests/${testId}`)
        return
      }

      // Log test registration activity if not already logged
      try {
        await activityService.logActivity(user.id, 'test_registration', { 
          test_id: testId,
          registration_id: registration.id
        });
        console.log(`✅ Activity logged: test_registration for user ${user.id}`);
      } catch (activityError) {
        console.error('❌ Failed to log test registration activity:', activityError);
        // Don't fail the test start if activity logging fails
      }

      // Fetch questions only after confirming registration
      await fetchQuestions()

      // Create test attempt
      const attemptData = {
        test_id: testId,
        user_id: user.id,
        started_at: new Date().toISOString(),
        status: 'in_progress',
        violations_count: violations,
        review_mode_enabled: false
      }

      console.log('Creating test attempt with data:', attemptData)
      console.log('User ID type:', typeof user.id)
      console.log('Test ID type:', typeof testId)

      // Validate data before insertion
      if (!user.id || !testId) {
        throw new Error('Missing required data: user ID or test ID')
      }

      const { data: attemptDataResult, error: attemptError } = await supabase
        .from('test_attempts')
        .insert([attemptData])
        .select()
        .single()

      if (attemptError) {
        console.error('Test attempt creation error:', attemptError)
        console.error('Error details:', {
          message: attemptError.message,
          details: attemptError.details,
          hint: attemptError.hint,
          code: attemptError.code
        })
        console.error('Full error object:', JSON.stringify(attemptError, null, 2))
        throw attemptError
      }

      console.log('Test attempt created successfully:', attemptDataResult)

      setAttemptId(attemptDataResult.id)
      setTestStarted(true)
      toast.success('Test started! Entering full-screen mode...')
      
      // Force full-screen immediately
      setTimeout(() => {
        requestFullScreen()
      }, 500)
    } catch (error) {
      console.error('Failed to start test:', error)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      console.error('Error keys:', Object.keys(error || {}))
      console.error('Full error:', JSON.stringify(error, null, 2))
      
      // Show more specific error message
      if (error && typeof error === 'object' && 'message' in error) {
        toast.error(`Failed to start test: ${error.message}`)
      } else {
        toast.error('Failed to start test - please try again')
      }
    }
  }

  const handleAnswerChange = (questionId: string, option: string) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || []
      const newAnswers = currentAnswers.includes(option)
        ? currentAnswers.filter(a => a !== option)
        : [...currentAnswers, option]
      
      return {
        ...prev,
        [questionId]: newAnswers
      }
    })
  }

  const handleSubmitTest = async () => {
    if (!attemptId || !test) return

    try {
      // Calculate score
      let score = 0
      let maxScore = 0

      questions.forEach(question => {
        maxScore += question.points
        const userAnswers = answers[question.id] || []
        const correctAnswers = question.correct_options

        if (userAnswers.length === correctAnswers.length &&
            userAnswers.every(answer => correctAnswers.includes(answer))) {
          score += question.points
        }
      })

      const passed = (score / maxScore) * 100 >= test.passing_score

      // Update attempt
      const { error: updateError } = await supabase
        .from('test_attempts')
        .update({
          submitted_at: new Date().toISOString(),
          score,
          max_score: maxScore,
          passed,
          time_taken_minutes: Math.floor((test.duration_minutes * 60 - timeRemaining) / 60),
          status: 'submitted'
        })
        .eq('id', attemptId)

      if (updateError) throw updateError

      // Save answers
      const answerRecords = Object.entries(answers).map(([questionId, selectedOptions]) => ({
        attempt_id: attemptId,
        question_id: questionId,
        selected_options: selectedOptions,
        answered_at: new Date().toISOString()
      }))

      if (answerRecords.length > 0) {
        const { error: answersError } = await supabase
          .from('test_answers')
          .insert(answerRecords)

        if (answersError) throw answersError
      }

      // Log activity for points
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await activityService.logActivity(user.id, 'test_completion', { 
            test_id: testId,
            attempt_id: attemptId,
            score,
            max_score: maxScore,
            passed
          });
          console.log(`✅ Activity logged: test_completion for user ${user.id}`);
        }
      } catch (activityError) {
        console.error('❌ Failed to log test completion activity:', activityError);
        // Don't fail the test submission if activity logging fails
      }

      toast.success('Test submitted successfully!')
      router.push(`/tests/${testId}/results?attempt=${attemptId}`)
    } catch (error) {
      toast.error('Failed to submit test')
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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

  const currentQuestion = questions[currentQuestionIndex]

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
          
          {testStarted && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-3 py-1 rounded-full">
                <Timer className="h-4 w-4" />
                <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              {violations > 0 && (
                <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-3 py-1 rounded-full">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Violations: {violations}/2</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Violation Warning */}
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Tab switching detected! This is violation {violations}/2.</span>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex justify-center py-8">
        <div className="max-w-4xl w-full px-4">
          {!testStarted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Test Info */}
              <Card className="border border-primary/10 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">{test.name}</CardTitle>
                  <CardDescription>{test.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span>{test.duration_minutes} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      <span>{test.passing_score}% passing score</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      <span>{questions.length > 0 ? `${questions.length} questions` : 'Questions will load after registration'}</span>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div className="space-y-2">
                        <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">Important Instructions</h3>
                        <ul className="text-sm text-yellow-600 dark:text-yellow-400 space-y-1">
                          <li>• The test will automatically enter full-screen mode</li>
                          <li>• Do not switch tabs or windows during the test</li>
                          <li>• Do not refresh the page during the test</li>
                          <li>• Right-click is disabled during the test</li>
                          <li>• Complete all questions before time runs out</li>
                          <li>• You cannot go back to previous questions</li>
                          <li>• Maximum 2 violations allowed - test will auto-submit after 2 violations</li>
                          <li>• Full-screen mode will be enforced after first violation</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={startTest}
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold py-3"
                  >
                    Start Test
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Question Card */}
              <Card className="border border-primary/10 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1}</span>
                      <Badge variant="outline">{currentQuestion.points} points</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {Object.keys(answers).length} answered
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">{currentQuestion.question_text}</h3>
                    
                    <div className="space-y-3">
                      {['A', 'B', 'C', 'D'].map((option) => {
                        const optionText = currentQuestion[`option_${option.toLowerCase()}` as keyof TestQuestion] as string
                        const isSelected = (answers[currentQuestion.id] || []).includes(option)
                        
                        return (
                          <label
                            key={option}
                            className={cn(
                              "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-200",
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-primary/50 hover:bg-muted/50"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleAnswerChange(currentQuestion.id, option)}
                              className="sr-only"
                            />
                            <div className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center",
                              isSelected
                                ? "border-primary bg-primary text-white"
                                : "border-muted"
                            )}>
                              {isSelected && <CheckCircle className="h-3 w-3" />}
                            </div>
                            <span className="font-medium">{option}.</span>
                            <span className="flex-1">{optionText}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitTest}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Submit Test
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      <Footer/>
    </div>
  )
} 