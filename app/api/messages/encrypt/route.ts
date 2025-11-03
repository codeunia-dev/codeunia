import { NextRequest, NextResponse } from 'next/server'
import { encryptMessage } from '@/lib/utils/encryption'

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const encrypted = encryptMessage(content)

    return NextResponse.json({ encrypted })
  } catch (error) {
    console.error('Encryption API error:', error)
    return NextResponse.json(
      { error: 'Failed to encrypt message' },
      { status: 500 }
    )
  }
}
