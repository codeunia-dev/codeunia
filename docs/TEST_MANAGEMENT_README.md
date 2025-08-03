# Test Management System

A comprehensive test management system for Codeunia that allows admins to create, manage, and analyze tests with full CRUD operations, question management, and result tracking.

## 🎯 Features

### ✅ **Admin Dashboard Integration**
- **Tests** section added to admin navigation (Management → Tests)
- **Active Tests** statistics card on main admin dashboard
- **Test-related activities** in recent activity feed
- Consistent design with existing admin sections

### ✅ **Complete Test Management**
- **Create/Edit/Delete Tests** with full configuration
- **Question Management** - Add multiple choice questions with explanations
- **Registration Tracking** - Monitor user registrations and status
- **Results Analysis** - View detailed test results and analytics
- **Certificate Generation** - Automatic certificate creation for passed attempts
- **Leaderboard System** - Real-time leaderboard updates

### ✅ **Advanced Features**
- **Multiple Attempt Support** - Configure max attempts per test
- **Time Management** - Set test duration and scheduling
- **Security Features** - Violation tracking and admin overrides
- **Public/Private Tests** - Control test visibility
- **Leaderboard Toggle** - Enable/disable leaderboards per test

## 🗄️ Database Schema

### Core Tables
- **`tests`** - Main test information and configuration
- **`test_questions`** - Multiple choice questions with explanations
- **`test_registrations`** - User registrations and status tracking
- **`test_attempts`** - Individual test attempts and results
- **`test_answers`** - Detailed answer tracking per attempt
- **`test_leaderboard`** - Real-time leaderboard rankings

### Key Features
- **Row Level Security (RLS)** - Secure access control
- **Automatic Indexing** - Optimized query performance
- **Foreign Key Constraints** - Data integrity
- **Audit Trail** - Created/updated timestamps

## 🚀 Setup Instructions

### 1. **Apply Database Migration**
Run the migration script in your Supabase SQL Editor:

```sql
-- Run this in Supabase SQL Editor
-- File: apply-test-migration.sql
```

This will:
- Create all necessary test tables
- Set up indexes for performance
- Enable Row Level Security
- Create RLS policies for secure access

### 2. **Add Sample Data (Optional)**
To see the system in action, add sample tests:

```sql
-- Run this in Supabase SQL Editor
-- File: sample-test-data.sql
```

This creates:
- 3 sample tests (JavaScript, React, Python)
- 15 sample questions (5 per test)
- Various difficulty levels and configurations

### 3. **Verify Installation**
Check if tables were created successfully:

```sql
-- Run this in Supabase SQL Editor
-- File: check-test-tables.sql
```

## 📋 Admin Interface

### **Access Test Management**
1. Go to your admin dashboard: `http://localhost:3000/admin`
2. Navigate to **Management → Tests**
3. You'll see the complete test management interface

### **Create a New Test**
1. Click **"Create New Test"** button
2. Fill in test details:
   - **Name & Description**
   - **Duration** (in minutes)
   - **Registration Period** (start/end dates)
   - **Test Period** (start/end dates)
   - **Passing Score** (default: 70%)
   - **Max Attempts** (default: 1)
   - **Public/Private** toggle
   - **Leaderboard** toggle

3. **Add Questions**:
   - Click **"Add Question"** for each question
   - Enter question text and 4 options (A, B, C, D)
   - Select correct answer(s)
   - Add explanation (optional)
   - Set point value

4. **Save Test** - Your test is now ready!

### **Manage Existing Tests**
- **Overview Tab**: Test details and statistics
- **Registrations Tab**: View and manage user registrations
- **Results Tab**: Analyze test results and performance
- **Certificates Tab**: Generate certificates for passed attempts

## 🔧 API Endpoints

### **Admin Test Management**
- `GET /api/admin/tests` - List all tests
- `POST /api/admin/tests` - Create new test
- `PUT /api/admin/tests/[id]` - Update test
- `DELETE /api/admin/tests/[id]` - Delete test

### **Test Questions**
- `GET /api/admin/tests/[id]/questions` - Get test questions
- `POST /api/admin/tests/[id]/questions` - Add question
- `PUT /api/admin/tests/[id]/questions/[qid]` - Update question
- `DELETE /api/admin/tests/[id]/questions/[qid]` - Delete question

### **Test Results**
- `GET /api/admin/tests/[id]/results` - Get test results
- `GET /api/admin/tests/[id]/leaderboard` - Get leaderboard

## 🎨 UI Components

### **TestManager Component**
- **Location**: `components/admin/TestManager.tsx`
- **Features**: Full CRUD operations, question management, result analysis
- **Tabs**: Overview, Registrations, Results, Certificates

### **Integration Points**
- **Admin Layout**: Added to navigation sidebar
- **Admin Dashboard**: Statistics card and activity feed
- **Types**: Complete TypeScript definitions in `types/test-management.ts`

## 🔐 Security Features

### **Row Level Security (RLS)**
- **Tests**: Public tests viewable by everyone, private tests admin-only
- **Questions**: Admin-only access for management
- **Registrations**: Users can view their own, admins can view all
- **Attempts**: Users can view their own, admins can view all
- **Results**: Admin-only access for detailed analysis

### **Admin Authentication**
- Requires admin role in user metadata
- Secure API endpoints with role verification
- Protected admin routes

## 📊 Analytics & Reporting

### **Test Statistics**
- Total registrations
- Attempt completion rates
- Average scores
- Pass/fail ratios
- Time analysis

### **User Performance**
- Individual user results
- Score distributions
- Time taken analysis
- Violation tracking

### **Leaderboard Features**
- Real-time rankings
- Score-based sorting
- Time-based tiebreakers
- Configurable per test

## 🎓 Certificate System

### **Automatic Generation**
- Triggered when test is completed and passed
- Configurable certificate templates
- QR code generation for verification
- Email/WhatsApp delivery options

### **Certificate Management**
- View all generated certificates
- Manual certificate generation
- Certificate verification system
- Expiration tracking

## 🚀 Future Enhancements

### **Planned Features**
- **Bulk Question Import** - CSV/Excel import
- **Advanced Analytics** - Detailed performance insights
- **Test Templates** - Reusable test configurations
- **Proctoring Features** - Screen recording, tab switching detection
- **Question Banks** - Categorized question libraries
- **Adaptive Testing** - Dynamic difficulty adjustment

### **Mobile Support**
- Responsive design for mobile devices
- Mobile-optimized test taking interface
- Touch-friendly question navigation

## 🛠️ Troubleshooting

### **Common Issues**

1. **"Loader2 is not defined" Error**
   - ✅ **Fixed**: Added `Loader2` to imports in `TestManager.tsx`

2. **"Error fetching attempts"**
   - **Cause**: Test tables don't exist in database
   - **Solution**: Run `apply-test-migration.sql` in Supabase

3. **Admin Access Denied**
   - **Cause**: User doesn't have admin role
   - **Solution**: Set `role: 'admin'` in user metadata

4. **Empty Test List**
   - **Cause**: No tests created yet
   - **Solution**: Create a test or run `sample-test-data.sql`

### **Database Verification**
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'test_%';

-- Check if sample data exists
SELECT COUNT(*) as test_count FROM tests;
SELECT COUNT(*) as question_count FROM test_questions;
```

## 📝 Usage Examples

### **Creating a Programming Test**
```typescript
// Example test configuration
const testConfig = {
  name: "JavaScript Fundamentals",
  description: "Test your JavaScript knowledge",
  duration_minutes: 30,
  passing_score: 70,
  max_attempts: 2,
  is_public: true,
  enable_leaderboard: true,
  questions: [
    {
      question_text: "What is the correct way to declare a variable?",
      option_a: "var x = 5;",
      option_b: "variable x = 5;",
      option_c: "v x = 5;",
      option_d: "declare x = 5;",
      correct_options: ["A"],
      explanation: "var, let, and const are the correct ways.",
      points: 1
    }
  ]
};
```

### **Accessing Test Data**
```typescript
// In your components
import { useContributionGraph } from '@/hooks/useContributionGraph';

// Test management is fully integrated with the contribution graph
// Test activities are automatically logged to user_activity table
```

## 🎉 Success!

Your test management system is now fully integrated with:
- ✅ **Admin Dashboard** - Complete test management interface
- ✅ **Database Schema** - All necessary tables and relationships
- ✅ **Security** - Row Level Security and admin authentication
- ✅ **Analytics** - Comprehensive reporting and statistics
- ✅ **Contribution Graph** - Test activities automatically logged
- ✅ **Certificate System** - Automatic certificate generation

**Next Steps:**
1. Run the migration scripts in Supabase
2. Add sample data to see the system in action
3. Create your first test through the admin interface
4. Test the full workflow from creation to certificate generation

The test management system is now ready for production use! 🚀 