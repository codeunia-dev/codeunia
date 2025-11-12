# Company Storage Utilities

This directory contains utilities for handling file uploads and storage for the multi-company event hosting system.

## Overview

The storage utilities provide secure file upload, validation, optimization, and management for:
- **Company Documents**: Verification documents (PDFs, images)
- **Company Assets**: Logos and banners

## Features

### File Validation
- File type validation
- File size limits
- Empty file detection
- Image dimension validation

### Security
- Virus scanning (configurable)
- Malicious signature detection
- Script content detection
- Secure file naming

### Image Optimization
- Automatic resizing
- WebP conversion
- Quality optimization
- SVG support (no optimization)

### Storage Management
- Secure file access with signed URLs
- File listing and deletion
- Metadata extraction

## Usage

### Company Documents

```typescript
import {
  uploadVerificationDocument,
  uploadVerificationDocuments,
  deleteVerificationDocument,
  getSignedDocumentUrl,
  listCompanyDocuments,
  validateFile,
} from '@/lib/storage/company-documents'

// Upload a single document
const result = await uploadVerificationDocument(file, companyId)
console.log('Document uploaded:', result.url)

// Upload multiple documents
const results = await uploadVerificationDocuments(files, companyId)

// Get secure access to a document
const signedUrl = await getSignedDocumentUrl(path, 3600) // 1 hour expiry

// List all documents for a company
const documents = await listCompanyDocuments(companyId)

// Delete a document
await deleteVerificationDocument(path)

// Validate a file before upload
const errors = validateFile(file, 'document')
if (errors.length > 0) {
  console.error('Validation errors:', errors)
}
```

### Company Assets

```typescript
import {
  uploadCompanyLogo,
  uploadCompanyBanner,
  deleteCompanyAsset,
  listCompanyAssets,
  getImageMetadata,
  validateImageDimensions,
} from '@/lib/storage/company-assets'

// Upload and optimize a logo
const logo = await uploadCompanyLogo(file, companyId)
console.log('Logo uploaded:', logo.url)

// Upload without optimization
const logo = await uploadCompanyLogo(file, companyId, false)

// Upload a banner
const banner = await uploadCompanyBanner(file, companyId)

// Get image metadata
const metadata = await getImageMetadata(file)
console.log('Dimensions:', metadata.width, 'x', metadata.height)

// Validate image dimensions
const errors = await validateImageDimensions(file, 200, 200)
if (errors.length > 0) {
  console.error('Image too small:', errors)
}

// List all assets
const assets = await listCompanyAssets(companyId)

// Delete an asset
await deleteCompanyAsset(path)
```

## Configuration

### Environment Variables

```bash
# Virus Scanning (optional)
ENABLE_VIRUS_SCANNING=true
VIRUS_SCAN_API_URL=https://your-virus-scan-api.com/scan
VIRUS_SCAN_API_KEY=your-api-key
```

### File Size Limits

**Documents:**
- Maximum size: 10MB
- Allowed types: PDF, JPEG, PNG, WebP

**Assets:**
- Logo maximum: 5MB (before optimization)
- Banner maximum: 10MB (before optimization)
- Allowed types: JPEG, PNG, WebP, SVG

### Image Optimization Settings

**Logo:**
- Target size: 400x400px
- Format: WebP
- Quality: 90%

**Banner:**
- Target size: 1200x400px
- Format: WebP
- Quality: 85%

## Virus Scanning

The system includes basic virus scanning capabilities:

### Built-in Checks
- Executable file signature detection (PE/EXE, ELF, Mach-O)
- Script content detection
- Suspicious pattern matching

### External Service Integration

To enable full virus scanning, configure an external service:

1. Set `ENABLE_VIRUS_SCANNING=true`
2. Configure `VIRUS_SCAN_API_URL` and `VIRUS_SCAN_API_KEY`
3. Implement the service-specific response parsing in `scanWithExternalService()`

**Supported Services:**
- ClamAV (open-source)
- VirusTotal API
- AWS GuardDuty
- Azure Defender
- Custom virus scanning APIs

### Example: ClamAV Integration

```typescript
// Install ClamAV
// macOS: brew install clamav
// Ubuntu: apt-get install clamav clamav-daemon

// Start the daemon
// clamd

// Configure environment
ENABLE_VIRUS_SCANNING=true
VIRUS_SCAN_API_URL=http://localhost:3310/scan
```

## Storage Buckets

The system uses two Supabase Storage buckets:

### company-documents
- **Purpose**: Verification documents
- **Access**: Private (signed URLs)
- **Structure**: `{companyId}/verification/{timestamp}-{randomId}.{ext}`
- **Cache**: 1 hour

### company-assets
- **Purpose**: Logos and banners
- **Access**: Public
- **Structure**: `{companyId}/{type}-{timestamp}.{ext}`
- **Cache**: 1 year

## Error Handling

All functions throw descriptive errors:

```typescript
try {
  const result = await uploadCompanyLogo(file, companyId)
} catch (error) {
  if (error.message.includes('File size')) {
    // Handle size error
  } else if (error.message.includes('security scan')) {
    // Handle virus scan failure
  } else if (error.message.includes('Invalid file type')) {
    // Handle type error
  }
}
```

## Security Best Practices

1. **Always validate files** before upload
2. **Enable virus scanning** in production
3. **Use signed URLs** for private documents
4. **Implement rate limiting** on upload endpoints
5. **Monitor storage usage** and set quotas
6. **Regularly audit** uploaded files
7. **Implement file retention policies**

## Performance Considerations

### Image Optimization
- Reduces file size by 60-80%
- Converts to WebP format
- Maintains visual quality
- Improves page load times

### Caching
- Assets cached for 1 year (immutable)
- Documents cached for 1 hour
- Use versioned filenames for cache busting

### Upload Limits
- Consider implementing chunked uploads for large files
- Use client-side compression before upload
- Implement progress indicators for better UX

## Testing

```typescript
// Test file validation
const testFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
const errors = validateFile(testFile, 'document')
expect(errors).toHaveLength(0)

// Test image optimization
const imageFile = new File([buffer], 'logo.png', { type: 'image/png' })
const result = await uploadCompanyLogo(imageFile, 'test-company-id')
expect(result.url).toContain('.webp')

// Test virus scanning
const maliciousFile = new File([executableBuffer], 'virus.exe', { type: 'application/octet-stream' })
await expect(uploadVerificationDocument(maliciousFile, 'test-company-id')).rejects.toThrow('security scan')
```

## Troubleshooting

### Sharp Installation Issues

If you encounter issues with sharp:

```bash
# Reinstall sharp
npm uninstall sharp
npm install sharp

# For Apple Silicon Macs
npm install --platform=darwin --arch=arm64 sharp

# For Intel Macs
npm install --platform=darwin --arch=x64 sharp
```

### Virus Scanning Timeouts

If virus scanning is slow:

1. Increase timeout limits
2. Implement async scanning with webhooks
3. Use a faster scanning service
4. Cache scan results for known-good files

### Storage Quota Issues

Monitor storage usage:

```typescript
const { data } = await supabase.storage.from('company-assets').list()
const totalSize = data.reduce((sum, file) => sum + file.metadata.size, 0)
console.log('Total storage:', totalSize / 1024 / 1024, 'MB')
```

## Future Enhancements

- [ ] Implement chunked uploads for large files
- [ ] Add image format detection and conversion
- [ ] Implement automatic thumbnail generation
- [ ] Add support for video uploads
- [ ] Implement CDN integration
- [ ] Add file deduplication
- [ ] Implement automatic file cleanup for deleted companies
- [ ] Add support for multiple verification document types
- [ ] Implement watermarking for sensitive documents
- [ ] Add audit logging for all file operations
