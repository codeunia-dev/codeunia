-- Simple Performance Analysis Script
-- Safe to run in Supabase SQL Editor

-- 1. Check current database statistics
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    CASE 
        WHEN n_distinct = -1 THEN 'All values unique'
        WHEN n_distinct = 0 THEN 'No values'
        ELSE n_distinct::text || ' distinct values'
    END as distinct_summary
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

-- 3. Check for missing indexes on high cardinality columns
SELECT 
    s.schemaname,
    s.tablename,
    s.attname,
    s.n_distinct,
    CASE 
        WHEN s.n_distinct > 100 THEN 'HIGH - Add index immediately'
        WHEN s.n_distinct > 50 THEN 'MEDIUM - Consider adding index'
        WHEN s.n_distinct > 10 THEN 'LOW - May benefit from index'
        ELSE 'MINIMAL - Index unlikely to help'
    END as priority
FROM pg_stats s
WHERE s.schemaname = 'public'
    AND s.n_distinct > 10
    AND s.tablename IN ('blogs', 'products', 'profiles', 'user_activity_log', 'user_points')
ORDER BY s.n_distinct DESC;

-- 4. Check for foreign key relationships that need indexes
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public';

-- 5. Check table sizes and row counts
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

-- 6. Check for potential optimization opportunities
SELECT 
    'OPTIMIZATION OPPORTUNITIES' as analysis_type,
    COUNT(DISTINCT tablename) as tables_analyzed,
    COUNT(*) as total_columns_analyzed,
    COUNT(CASE WHEN n_distinct > 100 THEN 1 END) as high_cardinality_columns,
    COUNT(CASE WHEN n_distinct > 50 THEN 1 END) as medium_cardinality_columns,
    COUNT(CASE WHEN correlation > 0.8 THEN 1 END) as high_correlation_columns
FROM pg_stats 
WHERE schemaname = 'public'
    AND tablename IN ('blogs', 'products', 'profiles', 'user_activity_log', 'user_points');

-- 7. Show specific recommendations
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    CASE 
        WHEN n_distinct > 100 AND correlation > 0.5 THEN 'CREATE INDEX idx_' || tablename || '_' || attname || ' ON ' || tablename || '(' || attname || ');'
        WHEN n_distinct > 50 THEN 'Consider: CREATE INDEX idx_' || tablename || '_' || attname || ' ON ' || tablename || '(' || attname || ');'
        ELSE 'No index needed'
    END as recommendation
FROM pg_stats 
WHERE schemaname = 'public'
    AND tablename IN ('blogs', 'products', 'profiles', 'user_activity_log', 'user_points')
    AND n_distinct > 50
ORDER BY n_distinct DESC; 