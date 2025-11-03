import { NextRequest, NextResponse } from 'next/server'
import { decryptMessage } from '@/lib/utils/encryption'

export async function POST(request: NextRequest) {
  try {
    const { encrypted } = await request.json()

    if (!encrypted || typeof encrypted !== 'string') {
      return NextResponse.json(
        { error: 'Encrypted content is required' },
        { status: 400 }
      )
    }

    const decrypted = decryptMessage(encrypted)

    return NextResponse.json({ decrypted })
  } catch (error) {
    console.error('Decryption API error:', error)
    return NextResponse.json(
      { error: 'Failed to decrypt message' },
      { status: 500 }
    )
  }
}
