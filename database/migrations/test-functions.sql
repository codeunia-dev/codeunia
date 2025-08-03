-- Test Database Functions
-- Run this to verify everything works

-- Test 1: Test generate_safe_username function
SELECT 
    'Test generate_safe_username' as test_name,
    generate_safe_username('John', 'Doe', '123e4567-e89b-12d3-a456-426614174000'::UUID) as result;

-- Test 2: Test generate_codeunia_id function
SELECT 
    'Test generate_codeunia_id' as test_name,
    generate_codeunia_id() as result;

-- Test 3: Test create_email_profile function (should not fail)
SELECT 
    'Test create_email_profile function exists' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'create_email_profile' 
            AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        ) THEN 'Function exists'
        ELSE 'Function missing'
    END as result;

-- Test 4: Test create_oauth_profile function (should not fail)
SELECT 
    'Test create_oauth_profile function exists' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'create_oauth_profile' 
            AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        ) THEN 'Function exists'
        ELSE 'Function missing'
    END as result;

-- Test 5: Check profiles table structure
SELECT 
    'Check profiles table structure' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'username'
        ) THEN 'Username column exists'
        ELSE 'Username column missing'
    END as result;

-- Test 6: Check that display_name is removed
SELECT 
    'Check display_name is removed' as test_name,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'display_name'
        ) THEN 'Display_name column removed'
        ELSE 'Display_name column still exists'
    END as result; 
-- Run this to verify everything works

-- Test 1: Test generate_safe_username function
SELECT 
    'Test generate_safe_username' as test_name,
    generate_safe_username('John', 'Doe', '123e4567-e89b-12d3-a456-426614174000'::UUID) as result;

-- Test 2: Test generate_codeunia_id function
SELECT 
    'Test generate_codeunia_id' as test_name,
    generate_codeunia_id() as result;

-- Test 3: Test create_email_profile function (should not fail)
SELECT 
    'Test create_email_profile function exists' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'create_email_profile' 
            AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        ) THEN 'Function exists'
        ELSE 'Function missing'
    END as result;

-- Test 4: Test create_oauth_profile function (should not fail)
SELECT 
    'Test create_oauth_profile function exists' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'create_oauth_profile' 
            AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        ) THEN 'Function exists'
        ELSE 'Function missing'
    END as result;

-- Test 5: Check profiles table structure
SELECT 
    'Check profiles table structure' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'username'
        ) THEN 'Username column exists'
        ELSE 'Username column missing'
    END as result;

-- Test 6: Check that display_name is removed
SELECT 
    'Check display_name is removed' as test_name,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'display_name'
        ) THEN 'Display_name column removed'
        ELSE 'Display_name column still exists'
    END as result; 