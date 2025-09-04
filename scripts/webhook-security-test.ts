/**
 * Webhook Security Test - Signature Verification Buffer Safety
 * 
 * This test demonstrates the security improvement where we check buffer lengths
 * before calling crypto.timingSafeEqual() to prevent Node.js errors.
 */

import crypto from 'crypto'

// Improved signature verification (what we implemented)
function safeVerifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const digest = `sha256=${hmac.digest('hex')}`
  
  // Check buffer lengths before comparison to prevent Node.js errors
  if (signature.length !== digest.length) return false
  
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

// Old vulnerable version (what we fixed)
function vulnerableVerifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const digest = `sha256=${hmac.digest('hex')}`
  
  // This throws an error if signature.length !== digest.length
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

// Test cases
const testPayload = '{"test": "data"}'
const testSecret = 'test-webhook-secret'

// Generate valid signature
const hmac = crypto.createHmac('sha256', testSecret)
hmac.update(testPayload)
const validSignature = `sha256=${hmac.digest('hex')}`

console.log('🔒 Webhook Security Test Results:')
console.log('================================')

// Test 1: Valid signature
const test1 = safeVerifySignature(testPayload, validSignature, testSecret)
console.log(`✅ Valid signature: ${test1}`)

// Test 2: Invalid signature (different length)
const invalidSignature = 'sha256=invalid'
const test2 = safeVerifySignature(testPayload, invalidSignature, testSecret)
console.log(`❌ Invalid signature (short): ${test2}`)

// Test 3: Empty signature
const test3 = safeVerifySignature(testPayload, '', testSecret)
console.log(`❌ Empty signature: ${test3}`)

// Test 4: Malformed signature
const test4 = safeVerifySignature(testPayload, 'malformed', testSecret)
console.log(`❌ Malformed signature: ${test4}`)

console.log('\n🛡️  Security Improvement:')
console.log('- Added buffer length check before crypto.timingSafeEqual()')
console.log('- Prevents Node.js errors from mismatched buffer lengths')
console.log('- Fails fast for invalid signatures')
console.log('- Applied to both GitHub and Razorpay webhook verification')

export { safeVerifySignature, vulnerableVerifySignature }
