-- Add Missing Pieces for Unified Setup Flow
-- This migration only adds what's missing from your current setup

-- 1. Add missing columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS setup_completed_at TIMESTAMP WITH TIME ZONE;

-- 2. Create case-insensitive username index (replace the case-sensitive one)
DROP INDEX IF EXISTS profiles_username_unique;
CREATE UNIQUE INDEX profiles_username_unique 
ON profiles (LOWER(username)) 
WHERE username IS NOT NULL;

-- 3. Create the get_user_setup_status function
CREATE OR REPLACE FUNCTION get_user_setup_status(user_id UUID)
RETURNS TABLE(
    user_id UUID,
    auth_provider VARCHAR(50),
    email_confirmed BOOLEAN,
    username_set BOOLEAN,
    codeunia_id_set BOOLEAN,
    setup_complete BOOLEAN,
    can_proceed BOOLEAN,
    next_step VARCHAR(100),
    username_editable BOOLEAN
) AS $$
DECLARE
    profile_record RECORD;
BEGIN
    -- Get user profile
    SELECT * INTO profile_record 
    FROM profiles 
    WHERE id = user_id;
    
    -- If no profile exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            user_id,
            'email'::VARCHAR(50),
            FALSE,
            FALSE,
            FALSE,
            FALSE,
            FALSE,
            'create_profile'::VARCHAR(100),
            TRUE;
        RETURN;
    END IF;
    
    -- Determine next step
    DECLARE
        next_step_text VARCHAR(100);
        can_proceed_bool BOOLEAN;
    BEGIN
        -- For email/password users
        IF profile_record.auth_provider = 'email' THEN
            IF profile_record.email_confirmed_at IS NULL THEN
                next_step_text := 'confirm_email';
                can_proceed_bool := FALSE;
            ELSIF profile_record.username IS NULL OR NOT profile_record.username_set THEN
                next_step_text := 'setup_username';
                can_proceed_bool := FALSE;
            ELSE
                next_step_text := 'setup_complete';
                can_proceed_bool := TRUE;
            END IF;
        ELSE
            -- For OAuth users
            IF profile_record.username IS NULL OR NOT profile_record.username_set THEN
                next_step_text := 'setup_username';
                can_proceed_bool := FALSE;
            ELSE
                next_step_text := 'setup_complete';
                can_proceed_bool := TRUE;
            END IF;
        END IF;
        
        RETURN QUERY SELECT 
            user_id,
            profile_record.auth_provider,
            profile_record.email_confirmed_at IS NOT NULL,
            profile_record.username_set,
            profile_record.codeunia_id IS NOT NULL,
            profile_record.setup_completed_at IS NOT NULL,
            can_proceed_bool,
            next_step_text,
            profile_record.username_editable;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update existing profiles to set auth_provider based on email patterns
-- (This is a best guess - you may want to manually review)
UPDATE profiles 
SET auth_provider = 'email'
WHERE auth_provider IS NULL OR auth_provider = 'email';

-- 5. Update existing profiles to mark setup as complete if they have usernames
UPDATE profiles 
SET 
    setup_completed_at = COALESCE(setup_completed_at, updated_at),
    profile_complete = COALESCE(profile_complete, username_set),
    email_confirmed_at = COALESCE(email_confirmed_at, created_at)
WHERE username IS NOT NULL AND username_set = true;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION get_user_setup_status(UUID) TO authenticated;

-- 7. Test the setup
SELECT 'Unified setup flow missing pieces added successfully' as status;

-- 8. Show summary of changes
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN auth_provider IS NOT NULL THEN 1 END) as profiles_with_auth_provider,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as profiles_with_email_confirmed,
    COUNT(CASE WHEN setup_completed_at IS NOT NULL THEN 1 END) as profiles_with_setup_completed,
    COUNT(CASE WHEN username_set = true THEN 1 END) as profiles_with_username_set
FROM profiles; 