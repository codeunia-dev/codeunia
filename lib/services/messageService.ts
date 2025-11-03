import { createClient } from '@/lib/supabase/client'
import type { Message, SendMessageData } from '@/types/messaging'

export class MessageService {
  private getSupabaseClient() {
    return createClient()
  }

  // Get messages for a conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    const supabase = this.getSupabaseClient()

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id (
          id,
          first_name,
          last_name,
          username,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      throw new Error(`Failed to fetch messages: ${error.message}`)
    }

    return data as Message[]
  }

  // Send a message
  async sendMessage(data: SendMessageData): Promise<Message> {
    const supabase = this.getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const messageData = {
      conversation_id: data.conversation_id,
      sender_id: user.id,
      content: data.content,
      reply_to_id: data.reply_to_id || null,
      attachments: data.attachments || null
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select(`
        *,
        sender:profiles!sender_id (
          id,
          first_name,
          last_name,
          username,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Error sending message:', error)
      throw new Error(`Failed to send message: ${error.message}`)
    }

    return message as Message
  }

  // Mark messages as read
  async markAsRead(conversationId: string): Promise<void> {
    const supabase = this.getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error marking as read:', error)
    }
  }

  // Delete a message (soft delete)
  async deleteMessage(messageId: string): Promise<void> {
    const supabase = this.getSupabaseClient()

    const { error } = await supabase
      .from('messages')
      .update({ 
        is_deleted: true,
        content: 'This message was deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)

    if (error) {
      console.error('Error deleting message:', error)
      throw new Error(`Failed to delete message: ${error.message}`)
    }
  }

  // Edit a message
  async editMessage(messageId: string, newContent: string): Promise<void> {
    const supabase = this.getSupabaseClient()

    const { error } = await supabase
      .from('messages')
      .update({ 
        content: newContent,
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)

    if (error) {
      console.error('Error editing message:', error)
      throw new Error(`Failed to edit message: ${error.message}`)
    }
  }
}

export const messageService = new MessageService()
