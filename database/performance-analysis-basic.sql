-- Basic Performance Analysis Script
-- Guaranteed to work in Supabase SQL Editor

-- 1. Check current database statistics for your tables
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

-- 2. Check existing indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 3. Check table sizes
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
    AND tablename IN ('blogs', 'products', 'profiles', 'user_activity_log', 'user_points')
ORDER BY n_live_tup DESC;

-- 4. Show high cardinality columns that need indexes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    CASE 
        WHEN n_distinct > 100 THEN 'HIGH PRIORITY - Add index'
        WHEN n_distinct > 50 THEN 'MEDIUM PRIORITY - Consider index'
        WHEN n_distinct > 10 THEN 'LOW PRIORITY - May help'
        ELSE 'MINIMAL - Skip'
    END as recommendation
FROM pg_stats 
WHERE schemaname = 'public'
    AND tablename IN ('blogs', 'products', 'profiles', 'user_activity_log', 'user_points')
    AND n_distinct > 10
ORDER BY n_distinct DESC;

-- 5. Summary of optimization opportunities
SELECT 
    'SUMMARY' as analysis_type,
    COUNT(DISTINCT tablename) as tables_analyzed,
    COUNT(*) as total_columns,
    COUNT(CASE WHEN n_distinct > 100 THEN 1 END) as high_cardinality,
    COUNT(CASE WHEN n_distinct > 50 THEN 1 END) as medium_cardinality
FROM pg_stats 
WHERE schemaname = 'public'
    AND tablename IN ('blogs', 'products', 'profiles', 'user_activity_log', 'user_points'); 