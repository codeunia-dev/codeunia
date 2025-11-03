#!/usr/bin/env node

/**
 * Test script to verify message encryption is working
 * Run: node scripts/test-encryption.js
 */

async function testEncryption() {
  console.log('\n🔐 Testing Message Encryption...\n')

  const testMessage = 'Hello, this is a secret message! 🔒'
  console.log('Original message:', testMessage)

  try {
    // Test encryption
    console.log('\n1. Encrypting message...')
    const encryptResponse = await fetch('http://localhost:3000/api/messages/encrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: testMessage })
    })

    if (!encryptResponse.ok) {
      throw new Error('Encryption failed')
    }

    const { encrypted } = await encryptResponse.json()
    console.log('✅ Encrypted:', encrypted)

    // Test decryption
    console.log('\n2. Decrypting message...')
    const decryptResponse = await fetch('http://localhost:3000/api/messages/decrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ encrypted })
    })

    if (!decryptResponse.ok) {
      throw new Error('Decryption failed')
    }

    const { decrypted } = await decryptResponse.json()
    console.log('✅ Decrypted:', decrypted)

    // Verify
    console.log('\n3. Verifying...')
    if (decrypted === testMessage) {
      console.log('✅ SUCCESS! Encryption and decryption working correctly!\n')
    } else {
      console.log('❌ FAILED! Decrypted message does not match original\n')
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.log('\nMake sure:')
    console.log('1. Your dev server is running (npm run dev)')
    console.log('2. MESSAGE_ENCRYPTION_KEY is set in .env.local')
    console.log('3. You have restarted the server after adding the key\n')
    process.exit(1)
  }
}

testEncryption()
