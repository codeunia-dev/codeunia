import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16

/**
 * Get encryption key from environment variable
 * The key should be a 64-character hex string (32 bytes)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.MESSAGE_ENCRYPTION_KEY
  
  if (!key) {
    throw new Error('MESSAGE_ENCRYPTION_KEY environment variable is not set')
  }
  
  if (key.length !== 64) {
    throw new Error('MESSAGE_ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
  }
  
  return Buffer.from(key, 'hex')
}

/**
 * Encrypt a message using AES-256-GCM
 * @param text - Plain text message to encrypt
 * @returns Encrypted message in format: iv:authTag:encryptedData
 */
export function encryptMessage(text: string): string {
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    // Return format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt message')
  }
}

/**
 * Decrypt a message using AES-256-GCM
 * @param encryptedText - Encrypted message in format: iv:authTag:encryptedData
 * @returns Decrypted plain text message
 */
export function decryptMessage(encryptedText: string): string {
  try {
    const key = getEncryptionKey()
    const parts = encryptedText.split(':')
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted message format')
    }
    
    const [ivHex, authTagHex, encrypted] = parts
    
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(ivHex, 'hex')
    )
    
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    // Return a placeholder for corrupted/invalid encrypted messages
    return '[Message could not be decrypted]'
  }
}

/**
 * Generate a new encryption key (for initial setup)
 * Run this once and store the result in your .env file
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Check if a message is encrypted (has the expected format)
 */
export function isEncrypted(text: string): boolean {
  const parts = text.split(':')
  return parts.length === 3 && parts[0].length === 32 && parts[1].length === 32
}
