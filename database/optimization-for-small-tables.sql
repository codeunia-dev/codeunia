-- Targeted Optimization for Small Tables
-- Based on your actual database: Products(68), Profiles(51), Blogs(2), etc.

-- 1. Add indexes for products table (68 rows - most important)
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_difficulty ON products(difficulty);
CREATE INDEX IF NOT EXISTS idx_products_platform ON products(platform);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- 2. Add indexes for profiles table (51 rows - second priority)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_codeunia_id ON profiles(codeunia_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_complete ON profiles(profile_complete);
CREATE INDEX IF NOT EXISTS idx_profiles_username_set ON profiles(username_set);

-- 3. Add indexes for blogs table (2 rows - minimal optimization)
CREATE INDEX IF NOT EXISTS idx_blogs_featured ON blogs(featured);
CREATE INDEX IF NOT EXISTS idx_blogs_date ON blogs(date);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);

-- 4. Add indexes for user_activity_log table (1 row - minimal)
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_type ON user_activity_log(activity_type);

-- 5. Add indexes for user_points table (1 row - minimal)
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON user_points(total_points);

-- 6. Add composite indexes for common query patterns
-- Products: category + price for filtering
CREATE INDEX IF NOT EXISTS idx_products_category_price ON products(category, price);

-- Profiles: username + profile_complete for setup flow
CREATE INDEX IF NOT EXISTS idx_profiles_username_complete ON profiles(username, profile_complete);

-- Blogs: featured + date for featured blog queries
CREATE INDEX IF NOT EXISTS idx_blogs_featured_date ON blogs(featured, date DESC);

-- 7. Add partial indexes for filtered queries
-- Only premium users
CREATE INDEX IF NOT EXISTS idx_profiles_premium ON profiles(id, is_premium) WHERE is_premium = true;

-- Only admin users
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(id, is_admin) WHERE is_admin = true;

-- Only active products
CREATE INDEX IF NOT EXISTS idx_products_active ON products(id, category) WHERE category IS NOT NULL;

-- 8. Show all created indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 9. Show optimization summary
SELECT 
    'OPTIMIZATION COMPLETED' as status,
    COUNT(*) as total_indexes_created,
    COUNT(DISTINCT tablename) as tables_optimized
FROM pg_indexes 
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'; 