import { createClient } from '@/lib/supabase/client'
import type { Message, SendMessageData } from '@/types/messaging'

export class MessageService {
  private getSupabaseClient() {
    return createClient()
  }

  // Encrypt message content via API
  private async encryptContent(content: string): Promise<string> {
    try {
      const response = await fetch('/api/messages/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (!response.ok) {
        throw new Error('Encryption failed')
      }

      const { encrypted } = await response.json()
      return encrypted
    } catch (error) {
      console.error('Error encrypting message:', error)
      throw new Error('Failed to encrypt message')
    }
  }

  // Decrypt message content via API
  private async decryptContent(encrypted: string): Promise<string> {
    try {
      const response = await fetch('/api/messages/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encrypted })
      })

      if (!response.ok) {
        throw new Error('Decryption failed')
      }

      const { decrypted } = await response.json()
      return decrypted
    } catch (error) {
      console.error('Error decrypting message:', error)
      return '[Message could not be decrypted]'
    }
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

    // Decrypt all messages
    const decryptedMessages = await Promise.all(
      data.map(async (message) => ({
        ...message,
        content: await this.decryptContent(message.content)
      }))
    )

    return decryptedMessages as Message[]
  }

  // Send a message
  async sendMessage(data: SendMessageData): Promise<Message> {
    const supabase = this.getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Encrypt the message content before sending
    const encryptedContent = await this.encryptContent(data.content)

    const messageData = {
      conversation_id: data.conversation_id,
      sender_id: user.id,
      content: encryptedContent,
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

    // Decrypt the content before returning
    const decryptedMessage = {
      ...message,
      content: await this.decryptContent(message.content)
    }

    return decryptedMessage as Message
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

    // Encrypt the deletion message
    const encryptedDeletedMessage = await this.encryptContent('This message was deleted')

    const { error } = await supabase
      .from('messages')
      .update({ 
        is_deleted: true,
        content: encryptedDeletedMessage,
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

    // Encrypt the new content
    const encryptedContent = await this.encryptContent(newContent)

    const { error } = await supabase
      .from('messages')
      .update({ 
        content: encryptedContent,
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
