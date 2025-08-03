# 🚀 Quick Certificate Bucket Setup

## 📋 What You Need to Do

### 1. Create the Bucket (5 minutes)

**Option A: Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Click **Storage** in the left sidebar
3. Click **"New bucket"**
4. Fill in:
   - **Name**: `certificates`
   - **Public bucket**: ✅ **Check this**
   - **File size limit**: `50 MB`
   - **Allowed MIME types**: `application/pdf,image/png,image/jpeg,image/jpg`
5. Click **"Create bucket"**

**Option B: Supabase CLI**
```bash
supabase storage create certificates --public
```

### 2. Run the Setup Script (2 minutes)

```bash
# Install dependencies if needed
npm install @supabase/supabase-js dotenv

# Run the setup script
node scripts/setup-certificate-bucket.js
```

### 3. Run the SQL Migration (3 minutes)

1. Go to your Supabase SQL Editor
2. Copy the contents of `certificate-storage-migration.sql`
3. Paste and run the SQL

### 4. Test Everything (2 minutes)

```bash
node scripts/test-certificate-bucket.js
```

## ✅ What You'll Get

- **Storage Bucket**: `certificates` with proper permissions
- **Folder Structure**: `templates/`, `generated/`, `qr-codes/`, `assets/`
- **Database Functions**: For certificate path generation and validation
- **Storage Policies**: Secure access control
- **Test Scripts**: To verify everything works

## 🎯 Your Certificate System Will Support

- ✅ **PDF Certificate Generation**
- ✅ **QR Code Generation** for verification
- ✅ **Template Upload** and management
- ✅ **Public Certificate URLs** for verification
- ✅ **Secure Access Control**
- ✅ **Automatic File Organization**

## 📚 Full Documentation

For detailed instructions, see:
- `CERTIFICATE_BUCKET_SETUP.md` - Complete setup guide
- `certificate-storage-migration.sql` - Database migration
- `scripts/test-certificate-bucket.js` - Test script

## 🚀 Ready to Use!

Once setup is complete, your certificate system will be fully functional with:
- Certificate generation and storage
- QR code generation for verification
- Public certificate verification URLs
- Template management
- Secure file access

**Total setup time: ~10 minutes** ⚡ 