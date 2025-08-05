"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Trophy, Medal, Award, Target, Users } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Footer from "@/components/footer"

interface LeaderboardEntry {
  id: string
  user_id: string
  user_email: string
  user_name?: string
  score: number
  max_score: number
  time_taken_minutes: number
  passed: boolean
  submitted_at: string
  rank?: number
}

interface Test {
  id: string
  name: string
  description: string
  enable_leaderboard: boolean
  passing_score: number
}

export default function LeaderboardPage() {
  const [test, setTest] = useState<Test | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState<number | null>(null)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const testId = params?.id as string

  useEffect(() => {
    fetchTestAndLeaderboard()
  }, [testId])

  const fetchTestAndLeaderboard = async () => {
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

      // Check if leaderboard is enabled
      if (!testData.enable_leaderboard) {
        toast.error('Leaderboard is not enabled for this test')
        router.push(`/tests/${testId}`)
        return
      }

      // Fetch leaderboard data
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('test_attempts')
        .select(`
          id,
          user_id,
          score,
          max_score,
          time_taken_minutes,
          passed,
          submitted_at
        `)
        .eq('test_id', testId)
        .not('submitted_at', 'is', null)
        .order('score', { ascending: false })
        .order('time_taken_minutes', { ascending: true })

      if (leaderboardError) throw leaderboardError

      if (leaderboardError) throw leaderboardError

      // For now, we'll use user_id as display name since we can't easily fetch user details
      // In a production app, you might want to store user display names in a separate table

      // Process leaderboard data
      const processedLeaderboard = (leaderboardData || []).map((entry, index) => ({
        id: entry.id,
        user_id: entry.user_id,
        user_email: `User ${entry.user_id.slice(0, 8)}...`, // Show partial user ID
        user_name: `User ${entry.user_id.slice(0, 8)}...`, // Show partial user ID
        score: entry.score,
        max_score: entry.max_score,
        time_taken_minutes: entry.time_taken_minutes,
        passed: entry.passed,
        submitted_at: entry.submitted_at,
        rank: index + 1
      }))

      setLeaderboard(processedLeaderboard)

      // Get current user's rank
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const userEntry = processedLeaderboard.find(entry => entry.user_id === user.id)
        if (userEntry) {
          setUserRank(userEntry.rank)
        }
      }

    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      toast.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading leaderboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Test not found</h1>
            <Link href="/tests">
              <Button>Back to Tests</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/tests/${testId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Test
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">{test.name} - Leaderboard</h1>
                <p className="text-sm text-muted-foreground">Test Results & Rankings</p>
              </div>
            </div>
            {userRank && (
              <Badge variant="secondary" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Your Rank: #{userRank}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Test Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Leaderboard
              </CardTitle>
              <CardDescription>
                {test.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{leaderboard.length} participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>{test.passing_score}% passing score</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span>{leaderboard.filter(entry => entry.passed).length} passed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No submissions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border",
                        index === 0 && "bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500/20",
                        index === 1 && "bg-gradient-to-r from-gray-500/10 to-gray-600/10 border-gray-500/20",
                        index === 2 && "bg-gradient-to-r from-amber-600/10 to-amber-700/10 border-amber-600/20",
                        index > 2 && "bg-card hover:bg-muted/50 transition-colors"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8">
                          {getRankIcon(entry.rank!)}
                        </div>
                        <div>
                          <p className="font-medium">{entry.user_name}</p>
                          <p className="text-sm text-muted-foreground">{entry.user_email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{formatScore(entry.score, entry.max_score)}</p>
                          <p className="text-muted-foreground">Score</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{formatTime(entry.time_taken_minutes)}</p>
                          <p className="text-muted-foreground">Time</p>
                        </div>
                        <div className="text-center">
                          <Badge variant={entry.passed ? "default" : "secondary"}>
                            {entry.passed ? "Passed" : "Failed"}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
} 