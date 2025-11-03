#!/usr/bin/env node

/**
 * Generate a secure encryption key for message encryption
 * Run this script once and add the key to your .env.local file
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

// Generate a 32-byte (256-bit) key
const key = crypto.randomBytes(32).toString('hex')

console.log('\n🔐 Message Encryption Key Generated!\n')
console.log('Copy this key to your .env.local file:\n')
console.log(`MESSAGE_ENCRYPTION_KEY=${key}\n`)
console.log('⚠️  IMPORTANT:')
console.log('1. Keep this key SECRET and SECURE')
console.log('2. Never commit it to version control')
console.log('3. Back it up somewhere safe')
console.log('4. If you lose it, all encrypted messages will be unreadable\n')

// Try to append to .env.local
const envPath = path.join(process.cwd(), '.env.local')

try {
  let envContent = ''
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8')
    
    // Check if key already exists
    if (envContent.includes('MESSAGE_ENCRYPTION_KEY=')) {
      console.log('⚠️  MESSAGE_ENCRYPTION_KEY already exists in .env.local')
      console.log('If you want to replace it, do so manually.\n')
      process.exit(0)
    }
  }
  
  // Append the key
  const newLine = envContent.endsWith('\n') ? '' : '\n'
  fs.appendFileSync(envPath, `${newLine}\n# Message Encryption Key (DO NOT SHARE)\nMESSAGE_ENCRYPTION_KEY=${key}\n`)
  
  console.log('✅ Key has been added to .env.local\n')
} catch (error) {
  console.log('❌ Could not write to .env.local automatically')
  console.log('Please add the key manually to your .env.local file\n')
}
