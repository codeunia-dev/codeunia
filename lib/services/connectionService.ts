import { createClient } from '@/lib/supabase/client'

export interface Connection {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export class ConnectionService {
  private getSupabaseClient() {
    return createClient()
  }

  // Follow a user
  async followUser(userId: string): Promise<void> {
    const supabase = this.getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    if (user.id === userId) {
      throw new Error('Cannot follow yourself')
    }

    const { error } = await supabase
      .from('user_connections')
      .insert([{
        follower_id: user.id,
        following_id: userId
      }])

    if (error) {
      // Ignore duplicate error (already following)
      if (error.code === '23505') {
        return
      }
      console.error('Error following user:', error)
      throw new Error(`Failed to follow user: ${error.message}`)
    }
  }

  // Unfollow a user
  async unfollowUser(userId: string): Promise<void> {
    const supabase = this.getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('user_connections')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', userId)

    if (error) {
      console.error('Error unfollowing user:', error)
      throw new Error(`Failed to unfollow user: ${error.message}`)
    }
  }

  // Check if current user is following another user
  async isFollowing(userId: string): Promise<boolean> {
    const supabase = this.getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data, error } = await supabase
      .from('user_connections')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking follow status:', error)
    }

    return !!data
  }

  // Check if two users are mutual connections
  async areMutualConnections(userId: string): Promise<boolean> {
    const supabase = this.getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    // Check if current user follows the other user
    const { data: following } = await supabase
      .from('user_connections')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .single()

    // Check if the other user follows current user
    const { data: follower } = await supabase
      .from('user_connections')
      .select('id')
      .eq('follower_id', userId)
      .eq('following_id', user.id)
      .single()

    return !!following && !!follower
  }

  // Get follower count for a user
  async getFollowerCount(userId: string): Promise<number> {
    const supabase = this.getSupabaseClient()

    const { count, error } = await supabase
      .from('user_connections')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)

    if (error) {
      console.error('Error getting follower count:', error)
      return 0
    }

    return count || 0
  }

  // Get following count for a user
  async getFollowingCount(userId: string): Promise<number> {
    const supabase = this.getSupabaseClient()

    const { count, error } = await supabase
      .from('user_connections')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)

    if (error) {
      console.error('Error getting following count:', error)
      return 0
    }

    return count || 0
  }

  // Get connection status with another user
  async getConnectionStatus(userId: string): Promise<{
    isFollowing: boolean
    isFollower: boolean
    isMutual: boolean
  }> {
    const supabase = this.getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { isFollowing: false, isFollower: false, isMutual: false }
    }

    // Check if current user follows the other user
    const { data: following } = await supabase
      .from('user_connections')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .maybeSingle()

    // Check if the other user follows current user
    const { data: follower } = await supabase
      .from('user_connections')
      .select('id')
      .eq('follower_id', userId)
      .eq('following_id', user.id)
      .maybeSingle()

    const isFollowing = !!following
    const isFollower = !!follower
    const isMutual = isFollowing && isFollower

    return { isFollowing, isFollower, isMutual }
  }

  // Get mutual connections between current user and another user
  async getMutualConnections(userId: string): Promise<{
    count: number
    users: Array<{
      id: string
      first_name: string | null
      last_name: string | null
      username: string
      avatar_url: string | null
    }>
  }> {
    const supabase = this.getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { count: 0, users: [] }
    }

    // Get users that both current user and target user follow
    const { data: currentUserFollowing } = await supabase
      .from('user_connections')
      .select('following_id')
      .eq('follower_id', user.id)

    const { data: targetUserFollowing } = await supabase
      .from('user_connections')
      .select('following_id')
      .eq('follower_id', userId)

    if (!currentUserFollowing || !targetUserFollowing) {
      return { count: 0, users: [] }
    }

    // Find mutual following
    const currentFollowingIds = new Set(currentUserFollowing.map(c => c.following_id))
    const mutualIds = targetUserFollowing
      .map(c => c.following_id)
      .filter(id => currentFollowingIds.has(id) && id !== user.id && id !== userId)

    if (mutualIds.length === 0) {
      return { count: 0, users: [] }
    }

    // Get profile info for first 3 mutual connections
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, username, avatar_url')
      .in('id', mutualIds.slice(0, 3))

    return {
      count: mutualIds.length,
      users: profiles || []
    }
  }
}

export const connectionService = new ConnectionService()
