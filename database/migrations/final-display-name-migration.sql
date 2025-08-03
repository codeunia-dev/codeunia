-- Final Migration: Remove display_name and use username instead
-- Run this script in your Supabase SQL Editor step by step

-- Step 1: Check current data (optional - just to see what we have)
SELECT 
    id,
    first_name,
    last_name,
    display_name,
    username
FROM profiles 
WHERE display_name IS NOT NULL
LIMIT 5;

-- Step 2: Drop the leaderboard_view first (since it depends on display_name)
DROP VIEW IF EXISTS leaderboard_view;

-- Step 3: Remove display_name column
ALTER TABLE profiles DROP COLUMN IF EXISTS display_name;

-- Step 4: Create the generate_safe_username function
CREATE OR REPLACE FUNCTION generate_safe_username(first_name TEXT, last_name TEXT, user_id UUID)
RETURNS TEXT AS $$
DECLARE
    base_username TEXT;
    final_username TEXT;
    counter INTEGER := 0;
    full_name TEXT;
BEGIN
    -- Combine first_name and last_name
    full_name := CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''));
    full_name := TRIM(full_name);
    
    -- If no name provided, use 'user' as base
    IF full_name = '' THEN
        full_name := 'user';
    END IF;
    
    -- Convert to safe username format
    base_username := LOWER(REGEXP_REPLACE(full_name, '[^a-zA-Z0-9]', '', 'g'));
    
    -- If empty after cleaning, use 'user' as base
    IF base_username = '' THEN
        base_username := 'user';
    END IF;
    
    -- Limit length to 30 characters
    base_username := LEFT(base_username, 30);
    
    -- Try base username first
    final_username := base_username;
    
    -- If username exists, add random suffix
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
        counter := counter + 1;
        final_username := base_username || '_' || LPAD(counter::TEXT, 3, '0');
        
        -- Prevent infinite loop
        IF counter > 999 THEN
            final_username := base_username || '_' || SUBSTRING(user_id::TEXT, 1, 8);
            EXIT;
        END IF;
    END LOOP;
    
    RETURN final_username;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Update existing users who don't have usernames
UPDATE profiles 
SET username = generate_safe_username(first_name, last_name, id),
    username_editable = TRUE
WHERE username IS NULL;

-- Step 6: Recreate the leaderboard_view with username
CREATE VIEW leaderboard_view AS
SELECT 
  up.rank,
  up.user_id,
  COALESCE(p.username, CONCAT(p.first_name, ' ', p.last_name)) as display_name,
  up.total_points,
  up.last_updated,
  CASE 
    WHEN up.total_points >= 2500 THEN 'diamond'
    WHEN up.total_points >= 1000 THEN 'platinum'
    WHEN up.total_points >= 500 THEN 'gold'
    WHEN up.total_points >= 100 THEN 'silver'
    ELSE 'bronze'
  END as badge
FROM user_points up
LEFT JOIN profiles p ON up.user_id = p.id
WHERE p.is_public = true OR p.id = auth.uid()
ORDER BY up.total_points DESC, up.last_updated ASC;

-- Step 7: Grant permissions
GRANT SELECT ON leaderboard_view TO authenticated;
GRANT EXECUTE ON FUNCTION generate_safe_username(TEXT, TEXT, UUID) TO authenticated;

-- Step 8: Show the final structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('first_name', 'last_name', 'username', 'username_editable')
ORDER BY ordinal_position;

-- Step 9: Test the leaderboard view
SELECT * FROM leaderboard_view LIMIT 5; 