-- =====================================================
-- DATABASE STATUS CHECK
-- =====================================================
-- Copy and paste this entire query into your Supabase SQL Editor
-- and share the results with me

-- 1. Check if profiles table exists
SELECT 
    'Table Check' as check_type,
    table_name,
    CASE 
        WHEN table_name = 'profiles' THEN 'EXISTS'
        ELSE 'OTHER TABLE'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- 2. Check if update_username function exists
SELECT 
    'Function Check' as check_type,
    proname as function_name,
    CASE 
        WHEN proname = 'update_username' THEN 'EXISTS'
        ELSE 'OTHER FUNCTION'
    END as status
FROM pg_proc 
WHERE proname = 'update_username';

-- 3. Check if set_username function exists
SELECT 
    'Function Check' as check_type,
    proname as function_name,
    CASE 
        WHEN proname = 'set_username' THEN 'EXISTS'
        ELSE 'OTHER FUNCTION'
    END as status
FROM pg_proc 
WHERE proname = 'set_username';

-- 4. List all tables in public schema
SELECT 
    'All Tables' as check_type,
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 5. List all functions in public schema
SELECT 
    'All Functions' as check_type,
    proname as function_name,
    'EXISTS' as status
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;
