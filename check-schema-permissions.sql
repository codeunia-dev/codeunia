-- =====================================================
-- CHECK SCHEMA AND PERMISSIONS
-- =====================================================
-- Copy and paste this query to check schema and permissions

-- 1. Check current schema
SELECT 
    'Current Schema' as check_type,
    current_schema() as schema_name,
    'Current schema being used' as info;

-- 2. Check if profiles table exists in different schemas
SELECT 
    'Table Schema Check' as check_type,
    table_schema,
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_name = 'profiles'
ORDER BY table_schema;

-- 3. Check table permissions for current user
SELECT 
    'Table Permissions' as check_type,
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_name = 'profiles'
AND table_schema = 'public';

-- 4. Check function permissions
SELECT 
    'Function Permissions' as check_type,
    routine_name,
    privilege_type,
    grantee
FROM information_schema.routine_privileges 
WHERE routine_name = 'update_username'
AND routine_schema = 'public';

-- 5. Check if we can access profiles table directly
SELECT 
    'Direct Access Test' as check_type,
    COUNT(*) as row_count,
    'Can access profiles table' as info
FROM public.profiles;

-- 6. Check search_path
SELECT 
    'Search Path' as check_type,
    setting as search_path,
    'Current search path' as info
FROM pg_settings 
WHERE name = 'search_path';
