/**
 * Storage utilities index
 * Exports all storage-related functions for easy importing
 */

// Company documents
export {
  uploadVerificationDocument,
  uploadVerificationDocuments,
  deleteVerificationDocument,
  getSignedDocumentUrl,
  listCompanyDocuments,
  validateFile,
  type UploadResult as DocumentUploadResult,
  type ValidationError as DocumentValidationError,
  type VirusScanResult,
} from './company-documents'

// Company assets
export {
  uploadCompanyLogo,
  uploadCompanyBanner,
  deleteCompanyAsset,
  listCompanyAssets,
  getImageMetadata,
  validateImageDimensions,
  validateImageFile,
  type UploadResult as AssetUploadResult,
  type ValidationError as AssetValidationError,
} from './company-assets'
