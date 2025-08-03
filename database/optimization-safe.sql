-- Safe Database Optimization Script
-- This script only creates indexes for columns that exist
-- Run this AFTER checking the database structure

-- 1. Add indexes for hackathons table (only if columns exist)
DO $$
BEGIN
    -- Check if hackathons table exists and has featured column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hackathons' 
        AND column_name = 'featured'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_hackathons_featured_date ON hackathons(featured, date);
    END IF;
    
    -- Check if hackathons table exists and has date column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hackathons' 
        AND column_name = 'date'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_hackathons_date ON hackathons(date);
    END IF;
    
    -- Check if hackathons table exists and has slug column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hackathons' 
        AND column_name = 'slug'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_hackathons_slug ON hackathons(slug);
    END IF;
    
    -- Check if hackathons table exists and has category column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hackathons' 
        AND column_name = 'category'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_hackathons_category ON hackathons(category);
    END IF;
END $$;

-- 2. Add indexes for tests table (only if columns exist)
DO $$
BEGIN
    -- Check if tests table exists and has is_public column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tests' 
        AND column_name = 'is_public'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_tests_public ON tests(is_public);
    END IF;
    
    -- Check if tests table exists and has is_active column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tests' 
        AND column_name = 'is_active'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_tests_active ON tests(is_active);
    END IF;
    
    -- Check if tests table exists and has created_at column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tests' 
        AND column_name = 'created_at'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_tests_created_at ON tests(created_at);
    END IF;
END $$;

-- 3. Add indexes for profiles table (only if columns exist)
DO $$
BEGIN
    -- Check if profiles table exists and has username column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'username'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
    END IF;
    
    -- Check if profiles table exists and has codeunia_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'codeunia_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_profiles_codeunia_id ON profiles(codeunia_id);
    END IF;
    
    -- Check if profiles table exists and has email column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'email'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
    END IF;
END $$;

-- 4. Add indexes for user_points table (only if columns exist)
DO $$
BEGIN
    -- Check if user_points table exists and has user_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_points' 
        AND column_name = 'user_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
    END IF;
    
    -- Check if user_points table exists and has points column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_points' 
        AND column_name = 'points'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_user_points_points ON user_points(points DESC);
    END IF;
    
    -- Check if user_points table exists and has updated_at column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_points' 
        AND column_name = 'updated_at'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_user_points_updated_at ON user_points(updated_at);
    END IF;
END $$;

-- 5. Add indexes for test_attempts table (only if columns exist)
DO $$
BEGIN
    -- Check if test_attempts table exists and has user_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'test_attempts' 
        AND column_name = 'user_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON test_attempts(user_id);
    END IF;
    
    -- Check if test_attempts table exists and has test_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'test_attempts' 
        AND column_name = 'test_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_test_attempts_test_id ON test_attempts(test_id);
    END IF;
    
    -- Check if test_attempts table exists and has created_at column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'test_attempts' 
        AND column_name = 'created_at'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_test_attempts_created_at ON test_attempts(created_at);
    END IF;
END $$;

-- 6. Add indexes for test_registrations table (only if columns exist)
DO $$
BEGIN
    -- Check if test_registrations table exists and has user_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'test_registrations' 
        AND column_name = 'user_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_test_registrations_user_id ON test_registrations(user_id);
    END IF;
    
    -- Check if test_registrations table exists and has test_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'test_registrations' 
        AND column_name = 'test_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_test_registrations_test_id ON test_registrations(test_id);
    END IF;
END $$;

-- 7. Add indexes for pending_payments table (only if columns exist)
DO $$
BEGIN
    -- Check if pending_payments table exists and has user_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_payments' 
        AND column_name = 'user_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_pending_payments_user_id ON pending_payments(user_id);
    END IF;
    
    -- Check if pending_payments table exists and has created_at column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_payments' 
        AND column_name = 'created_at'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_pending_payments_created_at ON pending_payments(created_at);
    END IF;
END $$;

-- 8. Add indexes for certificates table (only if columns exist)
DO $$
BEGIN
    -- Check if certificates table exists and has user_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'certificates' 
        AND column_name = 'user_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
    END IF;
    
    -- Check if certificates table exists and has test_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'certificates' 
        AND column_name = 'test_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_certificates_test_id ON certificates(test_id);
    END IF;
    
    -- Check if certificates table exists and has created_at column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'certificates' 
        AND column_name = 'created_at'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_certificates_created_at ON certificates(created_at);
    END IF;
END $$;

-- Show what indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Show optimization results
SELECT 'Safe database optimization completed successfully' as status; 