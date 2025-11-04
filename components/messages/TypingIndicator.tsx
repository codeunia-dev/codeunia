'use client'

import React from 'react'

interface TypingIndicatorProps {
  usernames: string[]
}

export function TypingIndicator({ usernames }: TypingIndicatorProps) {
  if (usernames.length === 0) return null

  const getTypingText = () => {
    if (usernames.length === 1) {
      return `${usernames[0]} is typing...`
    } else if (usernames.length === 2) {
      return `${usernames[0]} and ${usernames[1]} are typing...`
    } else {
      return `${usernames[0]} and ${usernames.length - 1} others are typing...`
    }
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{getTypingText()}</span>
    </div>
  )
}
