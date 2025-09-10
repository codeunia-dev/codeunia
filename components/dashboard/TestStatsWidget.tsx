'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Target, 
  Trophy, 
  CheckCircle, 
  Clock, 
  BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface TestStats {
  totalRegistrations: number
  totalAttempts: number
  passedTests: number
  averageScore: number
  totalTimeSpent: number
  recentAttempts: Array<{
    id: string
    test_name: string
    score: number
    max_score: number
    passed: boolean
    submitted_at: string
  }>
}

interface TestStatsWidgetProps {
  userId: string
}

export function TestStatsWidget({ userId }: TestStatsWidgetProps) {
  const [stats, setStats] = useState<TestStats>({
    totalRegistrations: 0,
    totalAttempts: 0,
    passedTests: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    recentAttempts: []
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchTestStats = async () => {
      try {
        setLoading(true)

        // Fetch test registrations count
        const { count: registrationsCount } = await supabase
          .from('test_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)

        // Fetch test attempts with basic stats
        const { data: attemptsData, error: attemptsError } = await supabase
          .from('test_attempts')
          .select(`
            id,
            score,
            max_score,
            time_taken_minutes,
            passed,
            submitted_at,
            tests!inner(
              name
            )
          `)
          .eq('user_id', userId)
          .not('submitted_at', 'is', null)
          .order('submitted_at', { ascending: false })
          .limit(5)

        if (attemptsError) throw attemptsError

        const totalAttempts = attemptsData?.length || 0
        const passedTests = attemptsData?.filter(attempt => attempt.passed).length || 0
        const averageScore = totalAttempts > 0 
          ? Math.round(attemptsData.reduce((sum, attempt) => sum + (attempt.score / attempt.max_score * 100), 0) / totalAttempts)
          : 0
        const totalTimeSpent = attemptsData?.reduce((sum, attempt) => sum + (attempt.time_taken_minutes || 0), 0) || 0

        const recentAttempts = (attemptsData || []).map(attempt => ({
          id: attempt.id,
          test_name: (attempt.tests as { name?: string })?.name || 'Unknown Test',
          score: attempt.score,
          max_score: attempt.max_score,
          passed: attempt.passed,
          submitted_at: attempt.submitted_at
        }))

        setStats({
          totalRegistrations: registrationsCount || 0,
          totalAttempts,
          passedTests,
          averageScore,
          totalTimeSpent,
          recentAttempts
        })

      } catch (error) {
        console.error('Error fetching test stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchTestStats()
    }
  }, [userId, supabase])


  const formatScore = (score: number, maxScore: number) => {
    const percentage = Math.round((score / maxScore) * 100)
    return `${percentage}%`
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Test Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Test Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalAttempts}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Tests Taken</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.averageScore}%
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Avg Score</div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium">Success Rate</span>
          </div>
          <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
            {stats.totalAttempts > 0 ? Math.round((stats.passedTests / stats.totalAttempts) * 100) : 0}%
          </Badge>
        </div>

        {/* Recent Attempts */}
        {stats.recentAttempts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Tests</h4>
            <div className="space-y-2">
              {stats.recentAttempts.slice(0, 3).map((attempt, index) => (
                <motion.div
                  key={attempt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attempt.test_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatScore(attempt.score, attempt.max_score)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {attempt.passed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Link href="/protected/tests" className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <BookOpen className="h-4 w-4 mr-2" />
              View Dashboard
            </Button>
          </Link>
          <Link href="/tests" className="flex-1">
            <Button size="sm" className="w-full">
              <Target className="h-4 w-4 mr-2" />
              Take Test
            </Button>
          </Link>
        </div>

        {/* No tests message */}
        {stats.totalAttempts === 0 && (
          <div className="text-center py-4">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No tests taken yet</p>
            <Link href="/tests">
              <Button size="sm">
                <Target className="h-4 w-4 mr-2" />
                Start Testing
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
