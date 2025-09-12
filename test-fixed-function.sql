-- =====================================================
-- TEST THE FIXED FUNCTION
-- =====================================================
-- Copy and paste this query to test the fixed function

-- 1. Test the function with a dummy call (this should work now)
SELECT 
    'Function Test' as test_type,
    update_username(auth.uid(), 'test_username_456') as result,
    'Should return true or false, not error' as expected;

-- 2. Check if the function definition is correct now
SELECT 
    'Function Definition' as test_type,
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments,
    'Function should reference public.profiles' as expected
FROM pg_proc 
WHERE proname = 'update_username';

-- 3. Verify we can still access the profiles table
SELECT 
    'Table Access' as test_type,
    COUNT(*) as row_count,
    'Should show number of profiles' as expected
FROM public.profiles;
