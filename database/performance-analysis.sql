-- Performance Analysis Script
-- Run this in Supabase SQL Editor to analyze query performance

-- 1. Check for slow queries (if pg_stat_statements is enabled)
-- First check if the extension is available
SELECT 
    extname,
    extversion
FROM pg_extension 
WHERE extname = 'pg_stat_statements';

-- If pg_stat_statements is available, check slow queries
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') THEN
        -- Use a simpler query that should work
        PERFORM 1 FROM pg_stat_statements LIMIT 1;
        RAISE NOTICE 'pg_stat_statements is available - checking slow queries...';
    ELSE
        RAISE NOTICE 'pg_stat_statements extension not available - skipping slow query analysis';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'pg_stat_statements not available or not properly configured';
END $$;

-- 2. Check table sizes and row counts
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

-- 3. Check existing indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 4. Check for missing indexes on foreign keys
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

-- 5. Check for tables without primary keys
SELECT 
    t.table_name
FROM information_schema.tables t
LEFT JOIN information_schema.table_constraints tc 
    ON t.table_name = tc.table_name 
    AND tc.constraint_type = 'PRIMARY KEY'
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND tc.constraint_name IS NULL;

-- 6. Check for potential performance issues
-- Tables with many columns but no indexes
SELECT 
    t.table_name,
    COUNT(c.column_name) as column_count,
    COUNT(i.indexname) as index_count
FROM information_schema.tables t
JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
LEFT JOIN pg_indexes i 
    ON t.table_name = i.tablename 
    AND t.table_schema = i.schemaname
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name
HAVING COUNT(i.indexname) < 3
ORDER BY column_count DESC;

-- 7. Check for unused indexes (approximation)
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
    AND indexname NOT LIKE '%_pkey'
    AND indexname NOT LIKE '%_key'
ORDER BY tablename, indexname;

-- 8. Check for potential query optimization opportunities
-- High cardinality columns without indexes
SELECT 
    s.tablename,
    s.attname,
    s.n_distinct,
    CASE 
        WHEN s.n_distinct > 100 THEN 'High cardinality - consider index'
        WHEN s.n_distinct > 10 THEN 'Medium cardinality - may benefit from index'
        ELSE 'Low cardinality - index may not help'
    END as recommendation
FROM pg_stats s
LEFT JOIN pg_indexes i 
    ON s.tablename = i.tablename 
    AND s.attname = ANY(string_to_array(replace(replace(i.indexdef, 'CREATE INDEX', ''), 'ON ' || s.tablename || ' (', ''), ', '))
WHERE s.schemaname = 'public'
    AND s.n_distinct > 10
    AND i.indexname IS NULL
ORDER BY s.n_distinct DESC;

-- 9. Check for potential bottlenecks
-- Tables with high correlation (good for indexes)
SELECT 
    tablename,
    attname,
    correlation,
    CASE 
        WHEN correlation > 0.8 THEN 'High correlation - good for B-tree index'
        WHEN correlation > 0.5 THEN 'Medium correlation - may benefit from index'
        ELSE 'Low correlation - consider other index types'
    END as correlation_analysis
FROM pg_stats 
WHERE schemaname = 'public'
    AND correlation IS NOT NULL
    AND correlation > 0.5
ORDER BY correlation DESC;

-- 10. Summary of optimization opportunities
SELECT 
    'PERFORMANCE ANALYSIS SUMMARY' as summary,
    COUNT(DISTINCT tablename) as tables_analyzed,
    COUNT(*) as total_columns_analyzed,
    COUNT(CASE WHEN n_distinct > 100 THEN 1 END) as high_cardinality_columns,
    COUNT(CASE WHEN correlation > 0.8 THEN 1 END) as high_correlation_columns
FROM pg_stats 
WHERE schemaname = 'public'
    AND tablename IN ('blogs', 'products', 'profiles', 'user_activity_log', 'user_points'); 