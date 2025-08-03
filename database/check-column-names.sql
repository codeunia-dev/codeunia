-- Diagnostic Script to Check Column Names
-- Run this first to see what columns are available

-- 1. Check what columns exist in pg_stats
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pg_stats' 
ORDER BY ordinal_position;

-- 2. Check what columns exist in pg_indexes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pg_indexes' 
ORDER BY ordinal_position;

-- 3. Check what columns exist in pg_stat_user_tables
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pg_stat_user_tables' 
ORDER BY ordinal_position;

-- 4. Try a simple query to see what works
SELECT * FROM pg_stats LIMIT 1;

-- 5. Check if we can access the tables directly
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('blogs', 'products', 'profiles', 'user_activity_log', 'user_points')
ORDER BY table_name; 