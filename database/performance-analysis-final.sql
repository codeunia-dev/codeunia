-- Final Performance Analysis Script
-- This will work in any Supabase setup

-- 1. Check existing indexes
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 2. Check table row counts (using correct column names)
SELECT 
    schemaname,
    relname as table_name,
    n_live_tup as row_count
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
    AND relname IN ('blogs', 'products', 'profiles', 'user_activity_log', 'user_points')
ORDER BY n_live_tup DESC;

-- 3. Check column statistics (simplified)
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct
FROM pg_stats 
WHERE schemaname = 'public'
    AND tablename IN ('blogs', 'products', 'profiles', 'user_activity_log', 'user_points')
    AND n_distinct > 10
ORDER BY n_distinct DESC;

-- 4. Show which columns need indexes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    CASE 
        WHEN n_distinct > 100 THEN 'HIGH - Add index'
        WHEN n_distinct > 50 THEN 'MEDIUM - Consider index'
        ELSE 'LOW - May help'
    END as priority
FROM pg_stats 
WHERE schemaname = 'public'
    AND tablename IN ('blogs', 'products', 'profiles', 'user_activity_log', 'user_points')
    AND n_distinct > 10
ORDER BY n_distinct DESC; 