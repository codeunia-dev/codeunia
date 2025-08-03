# 🏆 Enhanced Certificate Generation System

A comprehensive, automated certificate generation tool for CodeUnia that supports multiple event types (Tests, Events, Hackathons, Contests) with dynamic placeholder insertion, QR code verification, and email integration.

## ✨ Features

### 🎯 Core Functionality
- **Multi-Context Support**: Generate certificates for tests, events, and hackathons
- **Template Management**: Upload and manage certificate templates (PNG, JPG, PDF)
- **Dynamic Placeholders**: Replace placeholders with participant data automatically
- **QR Code Integration**: Automatic QR code generation for verification
- **Email Integration**: Send certificates directly to recipients
- **Public Verification**: Verify certificates via public URLs
- **Bulk Operations**: Generate and send certificates for multiple participants
- **Admin Dashboard**: Comprehensive management interface

### 🛠 Technical Features
- **Responsive UI**: Modern, accessible interface with dark/light theme support
- **Real-time Preview**: Preview certificates before generation
- **Placeholder Configuration**: Advanced positioning and styling controls
- **Audit Trail**: Track certificate generation and delivery
- **Storage Integration**: Secure file storage with Supabase
- **Database Integration**: Store metadata and certificate records
- **Performance Optimized**: Efficient bulk operations with rate limiting

## 🚀 Quick Start

### 1. Admin Access
Navigate to `/admin/certificates` to access the certificate management dashboard.

### 2. Template Upload
1. Click "Upload Template" button
2. Provide template name and select file (PNG, JPG, PDF)
3. Configure available placeholders
4. Upload and activate template

### 3. Certificate Generation
1. Select participants from the eligible list
2. Choose a certificate template
3. Configure placeholder positions and styling
4. Generate certificates in bulk
5. Send emails to participants

## 📋 Available Placeholders

The system supports the following dynamic placeholders:

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{name}` | Participant's full name | "Deepak Pandey" |
| `{email}` | Participant's email | "deepak@example.com" |
| `{event_name}` | Event/test/hackathon name | "CodeSprint Round 1" |
| `{score}` | Participant's score | "92" |
| `{rank}` | Participant's rank | "1" |
| `{date}` | Certificate issue date | "2025-01-27" |
| `{cert_id}` | Unique certificate ID | "CU-TEST-20250127-DEEPAK" |
| `{qr_code}` | QR code for verification | [QR Code Image] |
| `{organizer}` | Event organizer | "CodeUnia" |
| `{total_registrations}` | Total participants | "150" |
| `{duration}` | Event duration | "60 minutes" |
| `{institution}` | Participant's institution | "University of Technology" |
| `{department}` | Participant's department | "Computer Science" |
| `{experience_level}` | Participant's experience | "Intermediate" |

## 🎨 Template Configuration

### Placeholder Positioning
Configure the exact position (x, y coordinates) of each placeholder on your template:

```json
{
  "{name}": {
    "x": 400,
    "y": 300,
    "fontSize": 48,
    "fontFamily": "Arial",
    "color": "#000000",
    "textAlign": "center"
  }
}
```

### Supported Fonts
- Arial
- Times New Roman
- Courier
- Georgia
- Verdana

### Color Support
- Hex color codes (#000000)
- RGB values
- Named colors

## 🔧 API Endpoints

### Generate Single Certificate
```http
POST /api/certificates/generate
Content-Type: application/json

{
  "templateUrl": "https://...",
  "placeholders": {
    "{name}": "Deepak Pandey",
    "{score}": "92",
    "{event_name}": "CodeSprint Round 1"
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

### Bulk Certificate Generation
```http
POST /api/certificates/bulk-generate
Content-Type: application/json

{
  "templateId": "template-uuid",
  "participants": [
    {
      "id": "participant-1",
      "name": "Deepak Pandey",
      "email": "deepak@example.com",
      "score": 92,
      "cert_id": "CU-TEST-20250127-DEEPAK"
    }
  ],
  "context": "test"
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
  "certId": "CU-TEST-20250127-DEEPAK",
  "context": "test"
}
```

### Bulk Email Sending
```http
POST /api/certificates/bulk-send-email
Content-Type: application/json

{
  "certificates": [
    {
      "certId": "CU-TEST-20250127-DEEPAK",
      "email": "deepak@example.com",
      "name": "Deepak Pandey",
      "certificateUrl": "https://..."
    }
  ],
  "context": "test"
}
```

## 🗄️ Database Schema

### Certificates Table
```sql
CREATE TABLE certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

### Certificate Templates Table
```sql
CREATE TABLE certificate_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    template_url TEXT NOT NULL,
    placeholders JSONB,
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Certificate Verification

### Public Verification Page
Certificates can be verified at: `https://codeunia.com/verify/cert/{cert_id}`

### Verification Features
- **Public Access**: No authentication required
- **QR Code Scanning**: Scan QR code for instant verification
- **Certificate Status**: Valid/Invalid/Expired status
- **Download Option**: Download certificate PDF
- **Verification URL**: Shareable verification link

### Verification API
```http
GET /api/verify/cert/{certId}
```

Response:
```json
{
  "certificate": {
    "id": "uuid",
    "cert_id": "CU-TEST-20250127-DEEPAK",
    "issued_at": "2025-01-27T10:00:00Z",
    "is_valid": true,
    "certificate_url": "https://..."
  },
  "user": {
    "first_name": "Deepak",
    "last_name": "Pandey",
    "email": "deepak@example.com"
  },
  "assessment": {
    "title": "CodeSprint Round 1",
    "description": "Web Development Assessment"
  }
}
```

## 📧 Email Integration

### Email Templates
The system includes professional email templates for different contexts:

- **Test Certificates**: Academic achievement focus
- **Event Certificates**: Participation and learning focus
- **Hackathon Certificates**: Innovation and collaboration focus

### Email Features
- **Responsive Design**: Works on all devices
- **Verification Links**: Direct links to certificate verification
- **Social Sharing**: Links to share on LinkedIn, Twitter
- **Professional Branding**: CodeUnia branding and styling

### Email Content Example
```
Subject: Your CodeUnia Certificate - Test Completion

Dear Deepak Pandey,

Congratulations! Your certificate for CodeSprint Round 1 is ready! 🎉

Download your certificate: [Download Link]

Certificate Verification:
- URL: https://codeunia.com/verify/cert/CU-TEST-20250127-DEEPAK
- Certificate ID: CU-TEST-20250127-DEEPAK

Share your achievement on social media using #CodeUnia!

Thank you for participating in our test!
```

## 🎯 Admin Workflow

### 1. Participant Data Auto-Fill
- System automatically populates participant data from existing records
- No manual data entry required
- Supports tests, events, and hackathons

### 2. Template Management
- Upload certificate templates (PNG, JPG, PDF)
- Configure placeholder positions and styling
- Preview templates before use
- Manage active/inactive templates

### 3. Bulk Operations
- Select multiple participants
- Generate certificates in bulk
- Send emails in bulk
- Track progress and errors

### 4. Certificate Management
- View all generated certificates
- Track email delivery status
- Download certificates
- Verify certificate authenticity

## 🔄 Integration Points

### Test Management
- Integrated with existing test system
- Automatic certificate generation for passed tests
- Score and rank inclusion

### Event Management
- Support for future event system
- Participant registration data
- Event-specific templates

### Hackathon Management
- Support for future hackathon system
- Team and individual certificates
- Project-based achievements

## 🚀 Deployment

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site URL
NEXT_PUBLIC_SITE_URL=https://codeunia.com

# Email Service (optional)
RESEND_API_KEY=your_resend_api_key
SENDGRID_API_KEY=your_sendgrid_api_key
```

### Storage Setup
1. Create Supabase storage bucket named `certificates`
2. Set up RLS policies for secure access
3. Configure public access for certificate URLs

### Database Setup
Run the certificate migration SQL files:
- `certificate-storage-migration.sql`
- `database-migration.sql`

## 🔮 Future Enhancements

### Planned Features
- **Advanced Templates**: Drag-and-drop template editor
- **Digital Signatures**: Add digital signatures to certificates
- **Analytics Dashboard**: Certificate generation and verification analytics
- **WhatsApp Integration**: Send certificates via WhatsApp
- **Blockchain Verification**: Store certificate hashes on blockchain
- **Multi-language Support**: Support for multiple languages
- **Certificate Expiry**: Automatic certificate expiration
- **Batch Re-send**: Re-send failed emails
- **ZIP Download**: Download all certificates as ZIP
- **Role-based Access**: Different access levels for organizers

### Technical Improvements
- **PDF Processing**: Enhanced PDF manipulation with pdf-lib
- **Image Processing**: Advanced image manipulation with sharp
- **Caching**: Implement certificate caching for better performance
- **CDN Integration**: Use CDN for faster certificate delivery
- **Webhook Support**: Webhooks for certificate events
- **API Rate Limiting**: Implement rate limiting for API endpoints

## 📞 Support

For technical support or questions about the certificate system:

- **Email**: support@codeunia.com
- **Documentation**: This README file
- **Issues**: Create an issue in the repository
- **Admin Panel**: `/admin/certificates`

## 📄 License

This certificate generation system is part of the CodeUnia platform and follows the same licensing terms.

---

**Built with ❤️ for CodeUnia** 