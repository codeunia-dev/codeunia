'use client'

import React from 'react'

interface TypingIndicatorProps {
  usernames: string[]
}

export function TypingIndicator({ usernames }: TypingIndicatorProps) {
  if (usernames.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 bg-black">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>Typing...</span>
    </div>
  )
}
