-- Basic Database Verification Script
-- Run this in Supabase SQL Editor to verify all tables and relationships
-- This version avoids any system functions that might cause aggregate errors

-- 1. Verify profiles table structure (post display_name migration)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Check that display_name column is completely removed
SELECT 
    column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'display_name';

-- 3. Verify leaderboard_view structure
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'leaderboard_view' 
ORDER BY ordinal_position;

-- 4. Test leaderboard_view data
SELECT 
    rank,
    user_id,
    display_name,
    total_points,
    badge
FROM leaderboard_view 
LIMIT 5;

-- 5. Check user points data
SELECT 
    up.user_id,
    up.total_points,
    up.rank,
    p.username,
    p.first_name,
    p.last_name
FROM user_points up
LEFT JOIN profiles p ON up.user_id = p.id
ORDER BY up.rank
LIMIT 5;

-- 6. Check if tables exist and have data
SELECT 'tests' as table_name, COUNT(*) as record_count FROM tests;

SELECT 'test_attempts' as table_name, COUNT(*) as record_count FROM test_attempts;

SELECT 'test_questions' as table_name, COUNT(*) as record_count FROM test_questions;

SELECT 'test_answers' as table_name, COUNT(*) as record_count FROM test_answers;

SELECT 'test_registrations' as table_name, COUNT(*) as record_count FROM test_registrations;

SELECT 'certificates' as table_name, COUNT(*) as record_count FROM certificates;

SELECT 'certificate_templates' as table_name, COUNT(*) as record_count FROM certificate_templates;

SELECT 'pending_payments' as table_name, COUNT(*) as record_count FROM pending_payments;

SELECT 'user_activity_log' as table_name, COUNT(*) as record_count FROM user_activity_log;

SELECT 'user_activity' as table_name, COUNT(*) as record_count FROM user_activity;

SELECT 'user_points' as table_name, COUNT(*) as record_count FROM user_points;

-- 7. Test username generation function
SELECT 
    id,
    first_name,
    last_name,
    username,
    username_editable
FROM profiles 
WHERE username IS NOT NULL
LIMIT 5;

-- 8. Check for orphaned records (simple version)
SELECT 
    'test_attempts without user' as issue,
    COUNT(*) as count
FROM test_attempts ta
LEFT JOIN auth.users u ON ta.user_id = u.id
WHERE u.id IS NULL;

SELECT 
    'test_answers without attempt' as issue,
    COUNT(*) as count
FROM test_answers ta
LEFT JOIN test_attempts tatt ON ta.attempt_id = tatt.id
WHERE tatt.id IS NULL;

SELECT 
    'certificates without user' as issue,
    COUNT(*) as count
FROM certificates c
LEFT JOIN auth.users u ON c.user_id = u.id
WHERE u.id IS NULL;

-- 9. Final verification - sample data integrity
SELECT 
    p.id,
    p.username,
    p.first_name,
    p.last_name,
    p.username_editable,
    up.total_points,
    up.rank
FROM profiles p
LEFT JOIN user_points up ON p.id = up.user_id
WHERE p.username IS NOT NULL
LIMIT 5; 