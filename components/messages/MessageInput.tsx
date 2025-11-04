'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  disabled?: boolean
  placeholder?: string
  onTyping?: (isTyping: boolean) => void
}

export function MessageInput({ onSend, disabled, placeholder = 'Type a message...', onTyping }: MessageInputProps) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || sending || disabled) return

    try {
      setSending(true)
      await onSend(content)
      setContent('')
      
      // Stop typing indicator
      setIsTyping(false)
      onTyping?.(false)
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [content])

  // Handle typing indicator
  useEffect(() => {
    if (content.trim() && !isTyping) {
      setIsTyping(true)
      onTyping?.(true)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    if (content.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        onTyping?.(false)
      }, 2000)
    } else if (isTyping) {
      setIsTyping(false)
      onTyping?.(false)
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [content, isTyping, onTyping])

  return (
    <form onSubmit={handleSubmit} className="border-t bg-background p-2 md:p-3">
      <div className="flex gap-2 items-end max-w-full">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || sending}
          className="min-h-[40px] md:min-h-[44px] max-h-[120px] resize-none flex-1 text-sm md:text-base"
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!content.trim() || sending || disabled}
          className="flex-shrink-0 h-10 w-10 md:h-11 md:w-11"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-[10px] md:text-xs text-muted-foreground mt-1 md:mt-1.5 hidden sm:block">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  )
}
