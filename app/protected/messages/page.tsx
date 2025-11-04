'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ConversationList } from '@/components/messages/ConversationList'
import { ConversationView } from '@/components/messages/ConversationView'
import { NewMessageDialog } from '@/components/messages/NewMessageDialog'
import { UserStatusIndicator } from '@/components/messages/UserStatusIndicator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useConversations } from '@/hooks/useConversations'
import { useMyPresence } from '@/hooks/useUserPresence'
import { Plus, Search, MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const { conversations, loading } = useConversations()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Track user's online presence
  useMyPresence()

  // Get conversation from URL params
  useEffect(() => {
    const conversationId = searchParams.get('conversation')
    if (conversationId) {
      setSelectedConversationId(conversationId)
    }
  }, [searchParams])

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    const name = conv.is_group
      ? conv.group_name || ''
      : conv.other_user
      ? `${conv.other_user.first_name || ''} ${conv.other_user.last_name || ''} ${conv.other_user.username || ''}`
      : ''
    
    return name.toLowerCase().includes(query) || 
           conv.last_message_content?.toLowerCase().includes(query)
  })

  const selectedConversation = conversations.find(c => c.id === selectedConversationId)
  const conversationName = selectedConversation?.is_group
    ? selectedConversation.group_name || 'Group Chat'
    : selectedConversation?.other_user
    ? `${selectedConversation.other_user.first_name || ''} ${selectedConversation.other_user.last_name || ''}`.trim() || selectedConversation.other_user.username
    : 'Unknown'

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold">Messages</h1>
          </div>
          <Button onClick={() => setShowNewMessage(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Message</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex">
          {/* Sidebar - Conversation List (Hidden on mobile when conversation is selected) */}
          <div className={`
            w-full md:w-80 md:border-r flex flex-col bg-background
            ${selectedConversationId ? 'hidden md:flex' : 'flex'}
          `}>
            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              <ConversationList
                conversations={filteredConversations}
                selectedId={selectedConversationId}
                onSelect={setSelectedConversationId}
                loading={loading}
              />
            </div>
          </div>

          {/* Main Area - Conversation View (Hidden on mobile when no conversation selected) */}
          <div className={`
            flex-1 bg-background flex flex-col
            ${selectedConversationId ? 'flex' : 'hidden md:flex'}
          `}>
            {selectedConversationId && selectedConversation && (
              <div className="border-b p-3 md:p-4 bg-muted/50 flex-shrink-0">
                <div className="flex items-center gap-2 md:gap-3">
                  {/* Back button for mobile */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedConversationId(null)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                  </Button>
                  <h2 className="font-semibold text-sm md:text-base truncate">{conversationName}</h2>
                  {!selectedConversation.is_group && selectedConversation.other_user && selectedConversation.other_user.id ? (
                    <UserStatusIndicator 
                      userId={selectedConversation.other_user.id}
                      showLastSeen={true}
                      size="sm"
                    />
                  ) : !selectedConversation.is_group && (
                    <span className="text-xs text-red-500">No user data</span>
                  )}
                </div>
              </div>
            )}
            <div className="flex-1 min-h-0">
              <ConversationView
                conversationId={selectedConversationId}
                conversationName={conversationName}
              />
            </div>
          </div>
        </div>
      </div>

      {/* New Message Dialog */}
      <NewMessageDialog
        open={showNewMessage}
        onOpenChange={setShowNewMessage}
      />
    </div>
  )
}
