# 📜 Certificate Storage Bucket Setup Guide

This guide will help you set up the certificate storage bucket in Supabase for your Codeunia application.

## 🎯 Overview

The certificate system uses Supabase Storage to store:
- **Generated Certificates** (PDF files)
- **QR Codes** (PNG files for verification)
- **Certificate Templates** (PDF/Image files)
- **Certificate Assets** (logos, backgrounds, etc.)

## 🚀 Step-by-Step Setup

### 1. Create the Storage Bucket

#### Option A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Enter the following details:
   - **Name**: `certificates`
   - **Public bucket**: ✅ **Check this** (certificates need to be publicly accessible for verification)
   - **File size limit**: `50 MB` (adjust as needed)
   - **Allowed MIME types**: `application/pdf,image/png,image/jpeg,image/jpg`
5. Click **"Create bucket"**

#### Option B: Using Supabase CLI
```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Create the bucket
supabase storage create certificates --public
```

### 2. Set Up Storage Policies

Run the following SQL in your Supabase SQL Editor:

```sql
-- Allow public read access to certificates (for verification)
CREATE POLICY "Certificates are publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificates');

-- Allow authenticated users to upload certificates
CREATE POLICY "Authenticated users can upload certificates" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'certificates' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own certificates
CREATE POLICY "Users can update their own certificates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'certificates' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow admins to manage all certificates
CREATE POLICY "Admins can manage all certificates" ON storage.objects
  FOR ALL USING (
    bucket_id = 'certificates' 
    AND auth.jwt() ->> 'role' = 'admin'
  );

-- Allow users to delete their own certificates
CREATE POLICY "Users can delete their own certificates" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'certificates' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 3. Create Folder Structure

The bucket will automatically create folders as needed, but you can manually create this structure:

```
certificates/
├── templates/           # Certificate templates
├── generated/           # Generated certificates
├── qr-codes/           # QR codes for verification
├── assets/             # Logos, backgrounds, etc.
└── temp/               # Temporary files
```

### 4. Test the Setup

Create a simple test script to verify everything works:

```typescript
// test-certificate-bucket.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testCertificateBucket() {
  try {
    // Test upload
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const { data, error } = await supabase.storage
      .from('certificates')
      .upload('test/test.txt', testFile)
    
    if (error) {
      console.error('Upload error:', error)
      return
    }
    
    console.log('✅ Upload successful:', data)
    
    // Test public URL
    const { data: { publicUrl } } = supabase.storage
      .from('certificates')
      .getPublicUrl('test/test.txt')
    
    console.log('✅ Public URL:', publicUrl)
    
    // Test download
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('certificates')
      .download('test/test.txt')
    
    if (downloadError) {
      console.error('Download error:', downloadError)
      return
    }
    
    console.log('✅ Download successful')
    
    // Clean up
    await supabase.storage
      .from('certificates')
      .remove(['test/test.txt'])
    
    console.log('✅ Cleanup successful')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testCertificateBucket()
```

## 🔧 Configuration

### Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Update Certificate Service

The certificate service is already configured to use the `certificates` bucket. Here's how it works:

```typescript
// Upload certificate
const { error: uploadError } = await supabase.storage
  .from('certificates')
  .upload(fileName, processedCertificate, {
    contentType: 'application/pdf'
  })

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('certificates')
  .getPublicUrl(fileName)
```

## 📁 File Organization

### Recommended File Structure

```
certificates/
├── templates/
│   ├── default-template.pdf
│   ├── test-completion.pdf
│   └── hackathon-winner.pdf
├── generated/
│   ├── CU-TEST-20250127-001/
│   │   ├── certificate.pdf
│   │   └── qr-code.png
│   └── CU-HACK-20250127-001/
│       ├── certificate.pdf
│       └── qr-code.png
├── qr-codes/
│   ├── CU-TEST-20250127-001.png
│   └── CU-HACK-20250127-001.png
└── assets/
    ├── logo.png
    ├── background.jpg
    └── signature.png
```

### File Naming Convention

- **Certificates**: `{cert_id}/certificate.pdf`
- **QR Codes**: `{cert_id}/qr-code.png`
- **Templates**: `templates/{template_name}.pdf`
- **Assets**: `assets/{asset_name}.{extension}`

## 🔐 Security Considerations

### Public Access
- Certificates are publicly readable for verification
- Only admins can upload templates
- Users can only manage their own certificates

### File Validation
- Validate file types on upload
- Check file size limits
- Sanitize file names

### Cleanup
- Implement automatic cleanup of expired certificates
- Remove orphaned files
- Archive old certificates

## 🚀 Usage Examples

### Upload Certificate Template
```typescript
const uploadTemplate = async (file: File) => {
  const fileName = `templates/${Date.now()}-${file.name}`
  
  const { error } = await supabase.storage
    .from('certificates')
    .upload(fileName, file)
  
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('certificates')
    .getPublicUrl(fileName)
  
  return publicUrl
}
```

### Generate Certificate
```typescript
const generateCertificate = async (certId: string, pdfBuffer: ArrayBuffer) => {
  const fileName = `generated/${certId}/certificate.pdf`
  
  const { error } = await supabase.storage
    .from('certificates')
    .upload(fileName, pdfBuffer, {
      contentType: 'application/pdf'
    })
  
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('certificates')
    .getPublicUrl(fileName)
  
  return publicUrl
}
```

### Get Certificate URL
```typescript
const getCertificateUrl = (certId: string) => {
  const { data: { publicUrl } } = supabase.storage
    .from('certificates')
    .getPublicUrl(`generated/${certId}/certificate.pdf`)
  
  return publicUrl
}
```

## 🔍 Troubleshooting

### Common Issues

1. **"Bucket not found" error**
   - Make sure the bucket name is exactly `certificates`
   - Check if the bucket exists in your Supabase dashboard

2. **"Permission denied" error**
   - Verify storage policies are correctly set
   - Check if user is authenticated
   - Ensure admin role is set correctly

3. **"File too large" error**
   - Increase file size limit in bucket settings
   - Compress files before upload

4. **"Invalid file type" error**
   - Check allowed MIME types in bucket settings
   - Validate file type before upload

### Debug Commands

```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE bucket_id = 'certificates';

-- Check storage policies
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- List files in bucket
SELECT * FROM storage.objects WHERE bucket_id = 'certificates';
```

## 📊 Monitoring

### Storage Usage
Monitor your storage usage in the Supabase dashboard:
- Go to **Storage** → **Buckets** → **certificates**
- Check file count and total size
- Set up alerts for storage limits

### Certificate Analytics
Use the `certificate_stats` view to monitor:
- Total certificates generated
- Valid vs invalid certificates
- Email delivery rates
- Average generation time

## 🎉 Next Steps

1. **Run the migration**: Execute `certificate-storage-migration.sql`
2. **Test the setup**: Use the test script above
3. **Upload templates**: Add your certificate templates
4. **Generate certificates**: Test the full certificate generation flow
5. **Monitor usage**: Set up monitoring and alerts

Your certificate storage bucket is now ready to use! 🚀 