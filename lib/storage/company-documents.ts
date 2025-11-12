/**
 * Company document upload and management utilities
 * Handles verification documents and other company-related files
 */

import { createClient } from '@/lib/supabase/server'

// Allowed file types for verification documents
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Virus scanning configuration
const ENABLE_VIRUS_SCANNING = process.env.ENABLE_VIRUS_SCANNING === 'true'
const VIRUS_SCAN_API_URL = process.env.VIRUS_SCAN_API_URL
const VIRUS_SCAN_API_KEY = process.env.VIRUS_SCAN_API_KEY

export interface UploadResult {
  path: string
  url: string
}

export interface ValidationError {
  field: string
  message: string
}

export interface VirusScanResult {
  clean: boolean
  threats?: string[]
  scanTime?: number
}

/**
 * Validate a file for upload
 * @param file File to validate
 * @param type Type of file (document or asset)
 * @returns Array of validation errors (empty if valid)
 */
export function validateFile(
  file: File,
  type: 'document' | 'asset' = 'document'
): ValidationError[] {
  const errors: ValidationError[] = []

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push({
      field: 'file',
      message: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    })
  }

  // Check file type
  if (type === 'document' && !ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    errors.push({
      field: 'file',
      message: `Invalid file type. Allowed types: ${ALLOWED_DOCUMENT_TYPES.join(', ')}`,
    })
  }

  // Check for empty files
  if (file.size === 0) {
    errors.push({
      field: 'file',
      message: 'File is empty',
    })
  }

  return errors
}

/**
 * Scan a file for viruses and malware
 * @param buffer File buffer to scan
 * @param filename Original filename
 * @returns Scan result indicating if file is clean
 */
async function scanFileForViruses(
  buffer: Buffer,
  filename: string
): Promise<VirusScanResult> {
  // If virus scanning is disabled, return clean result
  if (!ENABLE_VIRUS_SCANNING) {
    return { clean: true }
  }

  try {
    // Basic file signature checks (magic bytes)
    const signatures = detectMaliciousSignatures(buffer)
    if (signatures.length > 0) {
      return {
        clean: false,
        threats: signatures,
      }
    }

    // If external virus scanning API is configured, use it
    if (VIRUS_SCAN_API_URL && VIRUS_SCAN_API_KEY) {
      const startTime = Date.now()
      const result = await scanWithExternalService(buffer, filename)
      const scanTime = Date.now() - startTime

      return {
        ...result,
        scanTime,
      }
    }

    // Default to clean if no scanning service is available
    return { clean: true }
  } catch (error) {
    console.error('Error scanning file for viruses:', error)
    // In production, you might want to fail closed (reject the file)
    // For now, we'll log the error and allow the upload
    return { clean: true }
  }
}

/**
 * Detect malicious file signatures (magic bytes)
 * This is a basic check and should be supplemented with proper antivirus scanning
 * @param buffer File buffer
 * @returns Array of detected threats
 */
function detectMaliciousSignatures(buffer: Buffer): string[] {
  const threats: string[] = []

  // Check for executable file signatures
  const executableSignatures = [
    { bytes: [0x4d, 0x5a], name: 'PE/EXE' }, // Windows executable
    { bytes: [0x7f, 0x45, 0x4c, 0x46], name: 'ELF' }, // Linux executable
    { bytes: [0xca, 0xfe, 0xba, 0xbe], name: 'Mach-O' }, // macOS executable
    { bytes: [0x50, 0x4b, 0x03, 0x04], name: 'ZIP/JAR' }, // Could contain executables
  ]

  for (const sig of executableSignatures) {
    if (buffer.length >= sig.bytes.length) {
      let matches = true
      for (let i = 0; i < sig.bytes.length; i++) {
        if (buffer[i] !== sig.bytes[i]) {
          matches = false
          break
        }
      }
      if (matches) {
        threats.push(`Suspicious file signature: ${sig.name}`)
      }
    }
  }

  // Check for script content in supposedly safe files
  const bufferString = buffer.toString('utf8', 0, Math.min(buffer.length, 1024))
  const scriptPatterns = [
    /<script/i,
    /javascript:/i,
    /eval\(/i,
    /exec\(/i,
  ]

  for (const pattern of scriptPatterns) {
    if (pattern.test(bufferString)) {
      threats.push('Suspicious script content detected')
      break
    }
  }

  return threats
}

/**
 * Scan file with external virus scanning service
 * This is a placeholder for integration with services like:
 * - ClamAV
 * - VirusTotal API
 * - AWS GuardDuty
 * - Azure Defender
 * @param buffer File buffer
 * @param filename Original filename
 * @returns Scan result
 */
async function scanWithExternalService(
  buffer: Buffer,
  filename: string
): Promise<VirusScanResult> {
  if (!VIRUS_SCAN_API_URL || !VIRUS_SCAN_API_KEY) {
    throw new Error('Virus scanning service not configured')
  }

  try {
    // Example implementation for a generic virus scanning API
    const formData = new FormData()
    formData.append('file', new Blob([buffer]), filename)

    const response = await fetch(VIRUS_SCAN_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VIRUS_SCAN_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Virus scan API returned ${response.status}`)
    }

    const result = await response.json()

    // Adapt this based on your virus scanning service's response format
    return {
      clean: result.clean || result.status === 'clean',
      threats: result.threats || result.detections || [],
    }
  } catch (error) {
    console.error('Error calling virus scanning service:', error)
    throw error
  }
}

/**
 * Upload a verification document to Supabase Storage
 * @param file File to upload
 * @param companyId Company ID
 * @param skipVirusScan Skip virus scanning (default: false)
 * @returns Upload result with path and URL
 */
export async function uploadVerificationDocument(
  file: File,
  companyId: string,
  skipVirusScan: boolean = false
): Promise<UploadResult> {
  // Validate file
  const validationErrors = validateFile(file, 'document')
  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0].message)
  }

  // Convert File to ArrayBuffer for upload
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Scan for viruses if enabled
  if (!skipVirusScan) {
    const scanResult = await scanFileForViruses(buffer, file.name)
    if (!scanResult.clean) {
      const threats = scanResult.threats?.join(', ') || 'Unknown threat'
      throw new Error(`File failed security scan: ${threats}`)
    }
  }

  const supabase = await createClient()

  // Generate secure filename
  const ext = file.name.split('.').pop()
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const filename = `${companyId}/verification/${timestamp}-${randomId}.${ext}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('company-documents')
    .upload(filename, buffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Error uploading verification document:', error)
    throw new Error('Failed to upload document')
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('company-documents').getPublicUrl(data.path)

  return {
    path: data.path,
    url: publicUrl,
  }
}

/**
 * Upload multiple verification documents
 * @param files Array of files to upload
 * @param companyId Company ID
 * @returns Array of upload results
 */
export async function uploadVerificationDocuments(
  files: File[],
  companyId: string
): Promise<UploadResult[]> {
  const results: UploadResult[] = []

  for (const file of files) {
    try {
      const result = await uploadVerificationDocument(file, companyId)
      results.push(result)
    } catch (error) {
      console.error('Error uploading document:', error)
      // Continue with other files even if one fails
    }
  }

  return results
}

/**
 * Delete a verification document
 * @param path Path to the document in storage
 */
export async function deleteVerificationDocument(path: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.storage.from('company-documents').remove([path])

  if (error) {
    console.error('Error deleting verification document:', error)
    throw new Error('Failed to delete document')
  }
}

/**
 * Get a signed URL for a private document
 * @param path Path to the document in storage
 * @param expiresIn Expiration time in seconds (default: 1 hour)
 * @returns Signed URL
 */
export async function getSignedDocumentUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from('company-documents')
    .createSignedUrl(path, expiresIn)

  if (error) {
    console.error('Error creating signed URL:', error)
    throw new Error('Failed to create signed URL')
  }

  return data.signedUrl
}

/**
 * List all documents for a company
 * @param companyId Company ID
 * @returns Array of document paths
 */
export async function listCompanyDocuments(companyId: string): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from('company-documents')
    .list(`${companyId}/verification`)

  if (error) {
    console.error('Error listing company documents:', error)
    throw new Error('Failed to list documents')
  }

  return data.map((file) => `${companyId}/verification/${file.name}`)
}
