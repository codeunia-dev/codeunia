import { useState, useEffect, useCallback } from 'react'
import { CompanyMember } from '@/types/company'

/**
 * Hook for managing company team members
 */
export function useCompanyMembers(companySlug: string | null) {
  const [members, setMembers] = useState<CompanyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviting, setInviting] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [removing, setRemoving] = useState(false)

  const fetchMembers = useCallback(async () => {
    if (!companySlug) {
      setMembers([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/companies/${companySlug}/members`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch team members')
      }

      const result = await response.json()
      setMembers(result.members || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team members')
      console.error('Error fetching team members:', err)
    } finally {
      setLoading(false)
    }
  }, [companySlug])

  const inviteMember = async (email: string, role: string): Promise<boolean> => {
    if (!companySlug) return false

    try {
      setInviting(true)
      setError(null)

      const response = await fetch(`/api/companies/${companySlug}/members/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to invite member')
      }

      const result = await response.json()
      
      // Add the new member to the list
      if (result.member) {
        setMembers(prev => [...prev, result.member])
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite member')
      console.error('Error inviting member:', err)
      return false
    } finally {
      setInviting(false)
    }
  }

  const updateMemberRole = async (userId: string, role: string): Promise<boolean> => {
    if (!companySlug) return false

    try {
      setUpdating(true)
      setError(null)

      const response = await fetch(`/api/companies/${companySlug}/members/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update member role')
      }

      const result = await response.json()
      
      // Update the member in the list
      setMembers(prev => 
        prev.map(member => 
          member.user_id === userId ? result.member : member
        )
      )

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member role')
      console.error('Error updating member role:', err)
      return false
    } finally {
      setUpdating(false)
    }
  }

  const removeMember = async (userId: string): Promise<boolean> => {
    if (!companySlug) return false

    try {
      setRemoving(true)
      setError(null)

      const response = await fetch(`/api/companies/${companySlug}/members/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove member')
      }

      // Remove the member from the list
      setMembers(prev => prev.filter(member => member.user_id !== userId))

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member')
      console.error('Error removing member:', err)
      return false
    } finally {
      setRemoving(false)
    }
  }

  const refresh = useCallback(() => {
    fetchMembers()
  }, [fetchMembers])

  const clearError = () => {
    setError(null)
  }

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  return {
    members,
    loading,
    error,
    inviting,
    updating,
    removing,
    inviteMember,
    updateMemberRole,
    removeMember,
    refresh,
    clearError,
  }
}

/**
 * Hook for getting a specific member's details
 */
export function useCompanyMember(companySlug: string | null, userId: string | null) {
  const [member, setMember] = useState<CompanyMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMember = async () => {
      if (!companySlug || !userId) {
        setMember(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/companies/${companySlug}/members/${userId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Member not found')
          }
          throw new Error('Failed to fetch member')
        }

        const result = await response.json()
        setMember(result.member)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch member')
        console.error('Error fetching member:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMember()
  }, [companySlug, userId])

  return {
    member,
    loading,
    error,
  }
}
