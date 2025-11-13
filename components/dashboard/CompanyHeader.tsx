'use client'

import React from 'react'
import { NotificationCenter } from '@/components/notifications'

export function CompanyHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-end gap-2 bg-transparent px-4">
      <NotificationCenter />
    </header>
  )
}
