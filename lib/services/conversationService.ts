import { createClient } from '@/lib/supabase/client'
import type { Conversation, ConversationWithDetails, CreateConversationData } from '@/types/messaging'

export class ConversationService {
  private getSupabaseClient() {
    return createClient()
  }

  // Decrypt message content via API
  private async decryptContent(encrypted: string | null): Promise<string | null> {
    if (!encrypted) return null
    
    try {
      const response = await fetch('/api/messages/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encrypted })
      })

      if (!response.ok) {
        return encrypted // Return encrypted if decryption fails
      }

      const { decrypted } = await response.json()
      return decrypted
    } catch (error) {
      console.error('Error decrypting last message:', error)
      return encrypted // Return encrypted if error occurs
    }
  }

  // Get all conversations for current user
  async getConversations(): Promise<ConversationWithDetails[]> {
    const supabase = this.getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get conversations where user is a participant
    const { data, error } = await supabase
      .from('conversation_participants')
      .select(`
        conversation:conversations (
          id,
          created_at,
          updated_at,
          last_message_at,
          last_message_content,
          is_group,
          group_name,
          group_avatar_url
        ),
        last_read_at
      `)
      .eq('user_id', user.id)
      .order('conversation(last_message_at)', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      throw new Error(`Failed to fetch conversations: ${error.message}`)
    }

    // Enrich conversations with participant details and unread count
    const enrichedConversations = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.map(async (item: any) => {
        const conversation = item.conversation

        // Get all participants
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select(`
            *,
            user:profiles!user_id (
              id,
              first_name,
              last_name,
              username,
              avatar_url
            )
          `)
          .eq('conversation_id', conversation.id)

        // Find other user (for 1-on-1 chats)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const otherParticipant = participants?.find((p: any) => p.user_id !== user.id)
        const otherUser = otherParticipant?.user || null

        // Calculate unread count
        const { data: unreadMessages } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conversation.id)
          .neq('sender_id', user.id)
          .gt('created_at', item.last_read_at || '1970-01-01')

        // Decrypt last message content
        const decryptedLastMessage = await this.decryptContent(conversation.last_message_content)

        return {
          ...conversation,
          last_message_content: decryptedLastMessage,
          participants: participants || [],
          other_user: otherUser,
          unread_count: unreadMessages?.length || 0
        }
      })
    )

    return enrichedConversations as ConversationWithDetails[]
  }

  // Check if user can message another user
  async canMessageUser(recipientId: string): Promise<{ canMessage: boolean; reason?: string }> {
    const supabase = this.getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { canMessage: false, reason: 'Not authenticated' }
    }

    // Call the database function
    const { data, error } = await supabase.rpc('can_message_user', {
      sender_id: user.id,
      recipient_id: recipientId
    })

    if (error) {
      console.error('Error checking message permission:', error)
      return { canMessage: false, reason: 'Error checking permissions' }
    }

    if (!data) {
      return { 
        canMessage: false, 
        reason: 'This user does not accept messages from you. You need to be mutual connections or they need to enable "Allow messages from anyone".' 
      }
    }

    return { canMessage: true }
  }

  // Get or create a conversation with another user
  async getOrCreateConversation(otherUserId: string): Promise<Conversation> {
    const supabase = this.getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Check if user can message the other user
    const { canMessage, reason } = await this.canMessageUser(otherUserId)
    if (!canMessage) {
      throw new Error(reason || 'Cannot message this user')
    }

    // Check if conversation already exists
    const { data: existingConversations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id)

    if (existingConversations) {
      for (const conv of existingConversations) {
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conv.conversation_id)

        const participantIds = participants?.map(p => p.user_id) || []
        
        // Check if it's a 1-on-1 with the target user
        if (
          participantIds.length === 2 &&
          participantIds.includes(user.id) &&
          participantIds.includes(otherUserId)
        ) {
          // Conversation exists, return it
          const { data: conversation } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', conv.conversation_id)
            .single()

          return conversation as Conversation
        }
      }
    }

    // Create new conversation
    return this.createConversation({
      participant_ids: [user.id, otherUserId]
    })
  }

  // Create a new conversation
  async createConversation(data: CreateConversationData): Promise<Conversation> {
    const supabase = this.getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert([{
        is_group: data.is_group || false,
        group_name: data.group_name || null
      }])
      .select()
      .single()

    if (convError) {
      console.error('Error creating conversation:', convError)
      throw new Error(`Failed to create conversation: ${convError.message}`)
    }

    // Add participants
    const participants = data.participant_ids.map(userId => ({
      conversation_id: conversation.id,
      user_id: userId,
      is_admin: userId === user.id
    }))

    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert(participants)

    if (partError) {
      console.error('Error adding participants:', partError)
      throw new Error(`Failed to add participants: ${partError.message}`)
    }

    return conversation as Conversation
  }

  // Delete a conversation
  async deleteConversation(conversationId: string): Promise<void> {
    const supabase = this.getSupabaseClient()

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)

    if (error) {
      console.error('Error deleting conversation:', error)
      throw new Error(`Failed to delete conversation: ${error.message}`)
    }
  }

  // Search users to start a conversation
  async searchUsers(query: string): Promise<Array<{
    id: string
    first_name: string | null
    last_name: string | null
    username: string
    avatar_url: string | null
  }>> {
    const supabase = this.getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, username, avatar_url')
      .neq('id', user.id)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,username.ilike.%${query}%`)
      .limit(10)

    if (error) {
      console.error('Error searching users:', error)
      return []
    }

    return data || []
  }
}

export const conversationService = new ConversationService()
