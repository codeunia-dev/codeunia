import { useState, useEffect, useCallback } from 'react'

export interface ModerationItem {
  id: string
  type: 'event' | 'hackathon'
  title: string
  description?: string
  company_id: string
  company_name?: string
  created_by: string
  created_at: string
  approval_status: 'pending' | 'approved' | 'rejected' | 'changes_requested'
  automated_checks?: {
    passed: boolean
    issues: string[]
  }
}

export interface ModerationQueueParams {
  status?: 'pending' | 'approved' | 'rejected' | 'changes_requested'
  type?: 'event' | 'hackathon' | 'all'
  limit?: number
  offset?: number
}

export interface ModerationQueueResponse {
  items: ModerationItem[]
  total: number
  hasMore: boolean
}

/**
 * Hook for managing the moderation queue (Platform Admin only)
 */
export function useModerationQueue(params: ModerationQueueParams = {}) {
  const [data, setData] = useState<ModerationQueueResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      
      if (params.status) queryParams.append('status', params.status)
      if (params.type && params.type !== 'all') queryParams.append('type', params.type)
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.offset) queryParams.append('offset', params.offset.toString())

      const response = await fetch(`/api/admin/moderation/events?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch moderation queue')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch moderation queue')
      console.error('Error fetching moderation queue:', err)
    } finally {
      setLoading(false)
    }
  }, [params.status, params.type, params.limit, params.offset])

  const approveItem = async (itemId: string, type: 'event' | 'hackathon', notes?: string): Promise<boolean> => {
    try {
      setProcessing(true)
      setError(null)

      const response = await fetch(`/api/admin/moderation/${type}s/${itemId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to approve item')
      }

      // Refresh the queue
      await fetchQueue()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve item')
      console.error('Error approving item:', err)
      return false
    } finally {
      setProcessing(false)
    }
  }

  const rejectItem = async (itemId: string, type: 'event' | 'hackathon', reason: string, notes?: string): Promise<boolean> => {
    try {
      setProcessing(true)
      setError(null)

      const response = await fetch(`/api/admin/moderation/${type}s/${itemId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, notes }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reject item')
      }

      // Refresh the queue
      await fetchQueue()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject item')
      console.error('Error rejecting item:', err)
      return false
    } finally {
      setProcessing(false)
    }
  }

  const requestChanges = async (itemId: string, type: 'event' | 'hackathon', feedback: string): Promise<boolean> => {
    try {
      setProcessing(true)
      setError(null)

      const response = await fetch(`/api/admin/moderation/${type}s/${itemId}/request-changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to request changes')
      }

      // Refresh the queue
      await fetchQueue()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request changes')
      console.error('Error requesting changes:', err)
      return false
    } finally {
      setProcessing(false)
    }
  }

  const refresh = useCallback(() => {
    fetchQueue()
  }, [fetchQueue])

  const clearError = () => {
    setError(null)
  }

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  return {
    data,
    loading,
    error,
    processing,
    approveItem,
    rejectItem,
    requestChanges,
    refresh,
    clearError,
  }
}

/**
 * Hook for fetching a single moderation item details
 */
export function useModerationItem(itemId: string | null, type: 'event' | 'hackathon') {
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [moderationHistory, setModerationHistory] = useState<any[]>([])

  const fetchItem = useCallback(async () => {
    if (!itemId) {
      setItem(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch the item details
      const response = await fetch(`/api/admin/moderation/${type}s/${itemId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Item not found')
        }
        throw new Error('Failed to fetch item')
      }

      const result = await response.json()
      setItem(result.item)
      setModerationHistory(result.history || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch item')
      console.error('Error fetching moderation item:', err)
    } finally {
      setLoading(false)
    }
  }, [itemId, type])

  const refresh = useCallback(() => {
    fetchItem()
  }, [fetchItem])

  useEffect(() => {
    fetchItem()
  }, [fetchItem])

  return {
    item,
    moderationHistory,
    loading,
    error,
    refresh,
  }
}

/**
 * Hook for moderation statistics
 */
export function useModerationStats() {
  const [stats, setStats] = useState({
    pending_events: 0,
    pending_hackathons: 0,
    approved_today: 0,
    rejected_today: 0,
    average_review_time: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/moderation/stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch moderation stats')
      }

      const result = await response.json()
      setStats(result.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch moderation stats')
      console.error('Error fetching moderation stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()

    // Refresh every minute
    const interval = setInterval(fetchStats, 60000)

    return () => clearInterval(interval)
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  }
}
