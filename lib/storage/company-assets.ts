/**
 * Company asset upload and management utilities
 * Handles logos, banners, and other company branding assets
 */

import { createClient } from '@/lib/supabase/server'
import sharp from 'sharp'

// Allowed image types for company assets
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]

// Maximum file sizes (before optimization)
const MAX_LOGO_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_BANNER_SIZE = 10 * 1024 * 1024 // 10MB

// Image optimization settings
const IMAGE_SIZES = {
  logo: { width: 400, height: 400 },
  banner: { width: 1200, height: 400 },
}

const IMAGE_QUALITY = {
  logo: 90,
  banner: 85,
}

export interface UploadResult {
  path: string
  url: string
}

export interface ValidationError {
  field: string
  message: string
}

/**
 * Validate an image file for upload
 * @param file File to validate
 * @param assetType Type of asset (logo or banner)
 * @returns Array of validation errors (empty if valid)
 */
export function validateImageFile(
  file: File,
  assetType: 'logo' | 'banner'
): ValidationError[] {
  const errors: ValidationError[] = []

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    errors.push({
      field: 'file',
      message: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    })
  }

  // Check file size
  const maxSize = assetType === 'logo' ? MAX_LOGO_SIZE : MAX_BANNER_SIZE
  if (file.size > maxSize) {
    errors.push({
      field: 'file',
      message: `File size must be less than ${maxSize / 1024 / 1024}MB`,
    })
  }

  return errors
}

/**
 * Optimize an image for web use
 * @param file Image file to optimize
 * @param type Type of asset (logo or banner)
 * @returns Optimized image buffer
 */
async function optimizeImage(
  file: File,
  type: 'logo' | 'banner'
): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { width, height } = IMAGE_SIZES[type]
  const quality = IMAGE_QUALITY[type]

  // Skip optimization for SVG files
  if (file.type === 'image/svg+xml') {
    return buffer
  }

  try {
    // Resize and optimize image
    const optimized = await sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
        withoutEnlargement: true, // Don't upscale smaller images
      })
      .webp({ quality })
      .toBuffer()

    return optimized
  } catch (error) {
    console.error('Error optimizing image:', error)
    // If optimization fails, return original buffer
    return buffer
  }
}

/**
 * Upload a company logo
 * @param file Logo file to upload
 * @param companyId Company ID
 * @param optimize Whether to optimize the image (default: true)
 * @returns Upload result with path and URL
 */
export async function uploadCompanyLogo(
  file: File,
  companyId: string,
  optimize: boolean = true
): Promise<UploadResult> {
  // Validate file
  const validationErrors = validateImageFile(file, 'logo')
  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0].message)
  }

  const supabase = await createClient()

  // Generate filename
  const timestamp = Date.now()
  const isSvg = file.type === 'image/svg+xml'
  const ext = isSvg ? 'svg' : 'webp'
  const filename = `${companyId}/logo-${timestamp}.${ext}`

  // Optimize image if requested and not SVG
  let buffer: Buffer
  let contentType: string

  if (optimize && !isSvg) {
    buffer = await optimizeImage(file, 'logo')
    contentType = 'image/webp'
  } else {
    const arrayBuffer = await file.arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
    contentType = file.type
  }

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('company-assets')
    .upload(filename, buffer, {
      contentType,
      cacheControl: '31536000', // 1 year
      upsert: true, // Allow overwriting
    })

  if (error) {
    console.error('Error uploading company logo:', error)
    throw new Error('Failed to upload logo')
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('company-assets').getPublicUrl(data.path)

  return {
    path: data.path,
    url: publicUrl,
  }
}

/**
 * Upload a company banner
 * @param file Banner file to upload
 * @param companyId Company ID
 * @param optimize Whether to optimize the image (default: true)
 * @returns Upload result with path and URL
 */
export async function uploadCompanyBanner(
  file: File,
  companyId: string,
  optimize: boolean = true
): Promise<UploadResult> {
  // Validate file
  const validationErrors = validateImageFile(file, 'banner')
  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0].message)
  }

  const supabase = await createClient()

  // Generate filename
  const timestamp = Date.now()
  const isSvg = file.type === 'image/svg+xml'
  const ext = isSvg ? 'svg' : 'webp'
  const filename = `${companyId}/banner-${timestamp}.${ext}`

  // Optimize image if requested and not SVG
  let buffer: Buffer
  let contentType: string

  if (optimize && !isSvg) {
    buffer = await optimizeImage(file, 'banner')
    contentType = 'image/webp'
  } else {
    const arrayBuffer = await file.arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
    contentType = file.type
  }

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('company-assets')
    .upload(filename, buffer, {
      contentType,
      cacheControl: '31536000', // 1 year
      upsert: true, // Allow overwriting
    })

  if (error) {
    console.error('Error uploading company banner:', error)
    throw new Error('Failed to upload banner')
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('company-assets').getPublicUrl(data.path)

  return {
    path: data.path,
    url: publicUrl,
  }
}

/**
 * Delete a company asset
 * @param path Path to the asset in storage
 */
export async function deleteCompanyAsset(path: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.storage.from('company-assets').remove([path])

  if (error) {
    console.error('Error deleting company asset:', error)
    throw new Error('Failed to delete asset')
  }
}

/**
 * List all assets for a company
 * @param companyId Company ID
 * @returns Array of asset paths
 */
export async function listCompanyAssets(companyId: string): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from('company-assets')
    .list(companyId)

  if (error) {
    console.error('Error listing company assets:', error)
    throw new Error('Failed to list assets')
  }

  return data.map((file) => `${companyId}/${file.name}`)
}

/**
 * Get image metadata and dimensions
 * @param file Image file
 * @returns Image metadata
 */
export async function getImageMetadata(file: File): Promise<{
  width: number
  height: number
  format: string
  size: number
}> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  try {
    const metadata = await sharp(buffer).metadata()

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: file.size,
    }
  } catch (error) {
    console.error('Error getting image metadata:', error)
    throw new Error('Failed to read image metadata')
  }
}

/**
 * Validate image dimensions
 * @param file Image file
 * @param minWidth Minimum width
 * @param minHeight Minimum height
 * @returns Validation errors
 */
export async function validateImageDimensions(
  file: File,
  minWidth: number = 100,
  minHeight: number = 100
): Promise<ValidationError[]> {
  const errors: ValidationError[] = []

  try {
    const metadata = await getImageMetadata(file)

    if (metadata.width < minWidth) {
      errors.push({
        field: 'file',
        message: `Image width must be at least ${minWidth}px (current: ${metadata.width}px)`,
      })
    }

    if (metadata.height < minHeight) {
      errors.push({
        field: 'file',
        message: `Image height must be at least ${minHeight}px (current: ${metadata.height}px)`,
      })
    }
  } catch {
    errors.push({
      field: 'file',
      message: 'Unable to read image dimensions',
    })
  }

  return errors
}
