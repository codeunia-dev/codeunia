// Messaging System Type Definitions

export interface Conversation {
  id: string
  created_at: string
  updated_at: string
  last_message_at: string
  last_message_content: string | null
  is_group: boolean
  group_name: string | null
  group_avatar_url: string | null
  conversation_type?: 'personal' | 'mentorship' | 'group'

  // Computed fields
  unread_count?: number
  other_user?: {
    id: string
    first_name: string
    last_name: string
    username: string
    avatar_url: string | null
  }
  participants?: ConversationParticipant[]
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  joined_at: string
  last_read_at: string
  is_admin: boolean

  // User details
  user?: {
    id: string
    first_name: string
    last_name: string
    username: string
    avatar_url: string | null
  }
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  updated_at: string | null
  is_edited: boolean
  is_deleted: boolean
  reply_to_id: string | null
  attachments: MessageAttachment[] | null

  // Sender details
  sender?: {
    id: string
    first_name: string
    last_name: string
    username: string
    avatar_url: string | null
  }
}

export interface MessageAttachment {
  id: string
  type: 'image' | 'file' | 'video'
  url: string
  name: string
  size: number
  mime_type: string
}

export interface SendMessageData {
  conversation_id: string
  content: string
  reply_to_id?: string
  attachments?: MessageAttachment[]
}

export interface CreateConversationData {
  participant_ids: string[]
  is_group?: boolean
  group_name?: string
  conversation_type?: 'personal' | 'mentorship' | 'group'
  initial_message?: string
}

export interface ConversationWithDetails extends Omit<Conversation, 'other_user'> {
  participants: ConversationParticipant[]
  unread_count: number
  other_user: {
    id: string
    first_name: string
    last_name: string
    username: string
    avatar_url: string | null
  } | null
}
