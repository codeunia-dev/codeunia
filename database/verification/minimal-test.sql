-- Minimal Test Script
-- Run this first to identify which query causes the array_agg error
-- Run each query individually to find the problematic one

-- Test 1: Basic profiles table check
SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' LIMIT 5;

-- Test 2: Check for display_name column
SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'display_name';

-- Test 3: Check leaderboard view
SELECT column_name FROM information_schema.columns WHERE table_name = 'leaderboard_view' LIMIT 5;

-- Test 4: Test leaderboard data
SELECT rank, user_id, display_name FROM leaderboard_view LIMIT 3;

-- Test 5: Check user points
SELECT user_id, total_points FROM user_points LIMIT 3;

-- Test 6: Check profiles with username
SELECT id, username, first_name, last_name FROM profiles WHERE username IS NOT NULL LIMIT 3;

-- Test 7: Simple count test
SELECT COUNT(*) FROM tests;

-- Test 8: Another simple count
SELECT COUNT(*) FROM user_points; 