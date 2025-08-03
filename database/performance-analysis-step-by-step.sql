-- Step-by-Step Performance Analysis
-- Based on what we know works

-- Step 1: Table sizes (this works!)
SELECT 
    schemaname,
    relname as table_name,
    n_live_tup as row_count
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
    AND relname IN ('blogs', 'products', 'profiles', 'user_activity_log', 'user_points')
ORDER BY n_live_tup DESC;

-- Step 2: Check existing indexes
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes 
WHERE schemaname = 'public'
    AND tablename IN ('blogs', 'products', 'profiles', 'user_activity_log', 'user_points')
ORDER BY tablename, indexname;

-- Step 3: Check column statistics for high cardinality columns
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    CASE 
        WHEN n_distinct > 50 THEN 'HIGH - Add index'
        WHEN n_distinct > 20 THEN 'MEDIUM - Consider index'
        WHEN n_distinct > 5 THEN 'LOW - May help'
        ELSE 'MINIMAL - Skip'
    END as priority
FROM pg_stats 
WHERE schemaname = 'public'
    AND tablename IN ('blogs', 'products', 'profiles', 'user_activity_log', 'user_points')
    AND n_distinct > 5
ORDER BY n_distinct DESC; 