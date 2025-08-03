-- Targeted Database Optimization Script
-- Based on actual database structure analysis
-- Run this in Supabase SQL Editor

-- 1. Add indexes for blogs table (high cardinality columns)
CREATE INDEX IF NOT EXISTS idx_blogs_featured ON blogs(featured);
CREATE INDEX IF NOT EXISTS idx_blogs_date ON blogs(date);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_author ON blogs(author);
CREATE INDEX IF NOT EXISTS idx_blogs_views ON blogs(views DESC);

-- 2. Add indexes for products table (high cardinality columns)
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_difficulty ON products(difficulty);
CREATE INDEX IF NOT EXISTS idx_products_platform ON products(platform);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- 3. Add indexes for profiles table (high cardinality columns)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_codeunia_id ON profiles(codeunia_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_complete ON profiles(profile_complete);
CREATE INDEX IF NOT EXISTS idx_profiles_username_set ON profiles(username_set);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);

-- 4. Add indexes for user_activity_log table (high cardinality columns)
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_type ON user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_points_awarded ON user_activity_log(points_awarded DESC);

-- 5. Add indexes for user_points table (high cardinality columns)
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_rank ON user_points(rank);
CREATE INDEX IF NOT EXISTS idx_user_points_last_updated ON user_points(last_updated);
CREATE INDEX IF NOT EXISTS idx_user_points_created_at ON user_points(created_at);

-- 6. Add composite indexes for common query patterns
-- Blogs: featured + date for featured blog queries
CREATE INDEX IF NOT EXISTS idx_blogs_featured_date ON blogs(featured, date DESC);

-- User points: rank + total_points for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_points_rank_points ON user_points(rank, total_points DESC);

-- User activity: user_id + created_at for user activity queries
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_created ON user_activity_log(user_id, created_at DESC);

-- Profiles: username + profile_complete for setup queries
CREATE INDEX IF NOT EXISTS idx_profiles_username_complete ON profiles(username, profile_complete);

-- 7. Add partial indexes for filtered queries
-- Only active blogs
CREATE INDEX IF NOT EXISTS idx_blogs_active ON blogs(date, featured) WHERE featured = true;

-- Only premium users
CREATE INDEX IF NOT EXISTS idx_profiles_premium ON profiles(id, is_premium) WHERE is_premium = true;

-- Only admin users
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(id, is_admin) WHERE is_admin = true;

-- Only users with points
CREATE INDEX IF NOT EXISTS idx_user_points_with_points ON user_points(user_id, total_points) WHERE total_points > 0;

-- 8. Add indexes for foreign key relationships (if they exist)
-- Check if these tables exist and have foreign keys
DO $$
BEGIN
    -- Check if test_attempts table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'test_attempts') THEN
        CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON test_attempts(user_id);
        CREATE INDEX IF NOT EXISTS idx_test_attempts_created_at ON test_attempts(created_at);
    END IF;
    
    -- Check if test_registrations table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'test_registrations') THEN
        CREATE INDEX IF NOT EXISTS idx_test_registrations_user_id ON test_registrations(user_id);
    END IF;
    
    -- Check if certificates table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'certificates') THEN
        CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
        CREATE INDEX IF NOT EXISTS idx_certificates_created_at ON certificates(created_at);
    END IF;
    
    -- Check if pending_payments table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pending_payments') THEN
        CREATE INDEX IF NOT EXISTS idx_pending_payments_user_id ON pending_payments(user_id);
        CREATE INDEX IF NOT EXISTS idx_pending_payments_created_at ON pending_payments(created_at);
    END IF;
    
    -- Check if hackathons table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hackathons') THEN
        CREATE INDEX IF NOT EXISTS idx_hackathons_featured ON hackathons(featured);
        CREATE INDEX IF NOT EXISTS idx_hackathons_date ON hackathons(date);
        CREATE INDEX IF NOT EXISTS idx_hackathons_slug ON hackathons(slug);
    END IF;
    
    -- Check if tests table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tests') THEN
        CREATE INDEX IF NOT EXISTS idx_tests_public ON tests(is_public);
        CREATE INDEX IF NOT EXISTS idx_tests_active ON tests(is_active);
        CREATE INDEX IF NOT EXISTS idx_tests_created_at ON tests(created_at);
    END IF;
END $$;

-- 9. Show all created indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 10. Show optimization summary
SELECT 
    'Database optimization completed successfully' as status,
    COUNT(*) as total_indexes_created
FROM pg_indexes 
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';

-- 11. Show table statistics for verification
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public'
    AND tablename IN ('blogs', 'products', 'profiles', 'user_activity_log', 'user_points')
ORDER BY tablename, n_distinct DESC; 