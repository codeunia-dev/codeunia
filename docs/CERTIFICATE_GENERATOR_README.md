# 🏆 CodeUnia Certificate Generator

A comprehensive, modular certificate generation system for CodeUnia that supports tests, events, and hackathons with dynamic placeholder insertion, QR code verification, and email integration.

## ✨ Features

### 🎯 Core Functionality
- **Multi-Context Support**: Generate certificates for tests, events, and hackathons
- **Template Management**: Upload and manage certificate templates (PNG, JPG, PDF)
- **Dynamic Placeholders**: Replace placeholders with user data dynamically
- **QR Code Integration**: Automatic QR code generation for verification
- **Email Integration**: Send certificates directly to recipients
- **Public Verification**: Verify certificates via public URLs

### 🛠 Technical Features
- **Responsive UI**: Modern, accessible interface with dark/light theme support
- **Real-time Preview**: Preview certificates before generation
- **Bulk Operations**: Generate certificates for multiple users
- **Audit Trail**: Track certificate generation and delivery
- **Storage Integration**: Secure file storage with Supabase
- **Database Integration**: Store metadata and certificate records

## 🚀 Quick Start

### 1. Component Usage

```tsx
import { CertificateGenerator } from '@/components/CertificateGenerator';

// Basic usage
<CertificateGenerator
  context="test"
  userData={{
    name: 'Deepak Pandey',
    score: 92,
    testName: 'CodeSprint Round 1',
    cert_id: 'CU-TEST-20250701-DEEPAK',
    email: 'deepak@example.com'
  }}
  onComplete={(certURL) => console.log('Certificate generated:', certURL)}
/>
```

### 2. Advanced Usage

```tsx
<CertificateGenerator
  context="hackathon"
  userData={{
    name: 'Alex Chen',
    hackathonName: 'Innovation Hack 2024',
    cert_id: 'CU-HACK-20241115-ALEX',
    email: 'alex@example.com',
    rank: 2,
    category: 'AI/ML',
    duration: '48 hours'
  }}
  templateId="template-uuid"
  showPreview={true}
  autoGenerate={false}
  onComplete={(certURL) => {
    // Handle successful generation
  }}
  onError={(error) => {
    // Handle errors
  }}
/>
```

## 📋 Available Placeholders

### Common Placeholders
- `{name}` - User's full name
- `{date}` - Issue date
- `{cert_id}` - Unique certificate ID
- `{qr_code}` - QR code image
- `{organization}` - Organization name

### Context-Specific Placeholders

#### Test Certificates
- `{score}` - Test score percentage
- `{test_name}` - Name of the test
- `{duration}` - Test duration
- `{category}` - Test category

#### Event Certificates
- `{event_name}` - Event name
- `{category}` - Participation category
- `{duration}` - Event duration

#### Hackathon Certificates
- `{hackathon_name}` - Hackathon name
- `{rank}` - Final ranking
- `{category}` - Project category
- `{duration}` - Hackathon duration

## 🗄 Database Schema

### Certificate Templates Table
```sql
CREATE TABLE certificate_templates (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    template_url TEXT NOT NULL,
    placeholders JSONB,
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Certificates Table
```sql
CREATE TABLE certificates (
    id UUID PRIMARY KEY,
    cert_id TEXT UNIQUE NOT NULL,
    test_id UUID REFERENCES tests(id),
    user_id UUID REFERENCES auth.users(id),
    attempt_id UUID REFERENCES test_attempts(id),
    template_id UUID REFERENCES certificate_templates(id),
    certificate_url TEXT,
    qr_code_url TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_valid BOOLEAN DEFAULT true,
    sent_via_email BOOLEAN DEFAULT false,
    sent_via_whatsapp BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 API Endpoints

### Generate Certificate
```http
POST /api/certificates/generate
Content-Type: application/json

{
  "templateUrl": "https://...",
  "placeholders": {
    "{name}": "Deepak Pandey",
    "{score}": "92",
    "{date}": "2025-01-27"
  },
  "configs": {
    "{name}": {
      "x": 400,
      "y": 300,
      "fontSize": 48,
      "fontFamily": "Arial",
      "color": "#000000"
    }
  }
}
```

### Send Email
```http
POST /api/certificates/send-email
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "Deepak Pandey",
  "certificateUrl": "https://...",
  "certId": "CU-TEST-20250701-DEEPAK",
  "context": "test"
}
```

## 🎨 UI Components

### Main Components
- `CertificateGenerator` - Main component for certificate generation
- `TemplateUpload` - Template upload and management
- `PlaceholderConfig` - Placeholder positioning and styling
- `CertificatePreview` - Real-time certificate preview
- `EmailTemplate` - Professional email templates

### Admin Interface
- `/admin/certificates` - Certificate generator demo page
- Integrated into test management system
- Bulk certificate generation
- Template management

## 🔐 Security Features

### Certificate Verification
- **Public Verification**: `https://codeunia.com/verify/cert/{cert_id}`
- **QR Code Integration**: Scan QR code for instant verification
- **Database Validation**: Server-side certificate validation
- **Expiration Support**: Optional certificate expiration dates

### Access Control
- **Admin-Only**: Certificate generation restricted to admins
- **RLS Policies**: Row-level security for certificate data
- **Audit Logging**: Track all certificate operations

## 📧 Email Integration

### Supported Email Services
- **Resend** (recommended)
- **SendGrid**
- **Mailgun**
- **Supabase Edge Functions**

### Email Template Features
- **Professional Design**: Responsive HTML email templates
- **Context-Aware**: Different templates for tests, events, hackathons
- **Verification Links**: Direct links to certificate verification
- **Social Sharing**: Links to share on LinkedIn, Twitter

## 🚀 Deployment

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Service (choose one)
RESEND_API_KEY=your_resend_api_key
SENDGRID_API_KEY=your_sendgrid_api_key
MAILGUN_API_KEY=your_mailgun_api_key

# Site URL
NEXT_PUBLIC_SITE_URL=https://codeunia.com
```

### Storage Setup
1. Create Supabase storage bucket named `certificates`
2. Set up RLS policies for secure access
3. Configure public access for certificate URLs

## 🔄 Future Enhancements

### Planned Features
- **Bulk Generation**: Generate certificates for multiple users at once
- **Advanced Templates**: Drag-and-drop template editor
- **Digital Signatures**: Add digital signatures to certificates
- **Analytics**: Certificate generation and verification analytics
- **WhatsApp Integration**: Send certificates via WhatsApp
- **Blockchain Verification**: Store certificate hashes on blockchain

### Technical Improvements
- **PDF Processing**: Enhanced PDF manipulation with pdf-lib
- **Image Processing**: Advanced image manipulation with sharp
- **Caching**: Implement certificate caching for better performance
- **CDN Integration**: Use CDN for faster certificate delivery

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`
5. Access certificate generator at `/admin/certificates`

### Code Structure
```
components/
├── CertificateGenerator.tsx     # Main component
├── ui/                          # UI components
└── admin/                       # Admin components

app/
├── api/certificates/            # API routes
│   ├── generate/route.ts
│   └── send-email/route.ts
├── admin/certificates/          # Admin pages
└── verify/cert/                 # Verification pages

types/
└── test-management.ts           # Type definitions
```

## 📞 Support

For questions, issues, or feature requests:
- **Email**: support@codeunia.com
- **Documentation**: [docs.codeunia.com](https://docs.codeunia.com)
- **GitHub Issues**: [github.com/codeunia/certificates](https://github.com/codeunia/certificates)

---

**Built with ❤️ by the CodeUnia Team** 