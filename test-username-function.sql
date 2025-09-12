-- =====================================================
-- TEST USERNAME FUNCTION
-- =====================================================
-- Copy and paste this query to test the update_username function

-- 1. First, let's see the current user and their profile
SELECT 
    'Current User' as test_type,
    auth.uid() as user_id,
    'User ID from auth' as info;

-- 2. Check if current user has a profile
SELECT 
    'Profile Check' as test_type,
    id,
    username,
    username_editable,
    username_set,
    first_name,
    last_name
FROM profiles 
WHERE id = auth.uid();

-- 3. Test the update_username function with a dummy call
-- (This will show us the exact error if any)
SELECT 
    'Function Test' as test_type,
    update_username(auth.uid(), 'test_username_123') as result;

-- 4. Check function definition
SELECT 
    'Function Definition' as test_type,
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'update_username';
