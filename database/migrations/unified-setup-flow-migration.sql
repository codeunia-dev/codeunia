-- Unified Setup Flow Migration
-- Adds email confirmation tracking and enhances the setup flow

-- Add email confirmation tracking to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS setup_completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for email confirmation status
CREATE INDEX IF NOT EXISTS idx_profiles_email_confirmed ON profiles(email_confirmed_at);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_provider ON profiles(auth_provider);
CREATE INDEX IF NOT EXISTS idx_profiles_setup_completed ON profiles(setup_completed_at);

-- Function to check if user setup is complete
CREATE OR REPLACE FUNCTION is_user_setup_complete(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    profile_record RECORD;
BEGIN
    -- Get user profile
    SELECT * INTO profile_record 
    FROM profiles 
    WHERE id = user_id;
    
    -- If no profile exists, setup is not complete
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- For email/password users, email must be confirmed
    IF profile_record.auth_provider = 'email' THEN
        RETURN profile_record.email_confirmed_at IS NOT NULL 
               AND profile_record.username IS NOT NULL 
               AND profile_record.codeunia_id IS NOT NULL 
               AND profile_record.username_set = TRUE;
    END IF;
    
    -- For OAuth users (Google, GitHub), only username setup is required
    RETURN profile_record.username IS NOT NULL 
           AND profile_record.codeunia_id IS NOT NULL 
           AND profile_record.username_set = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark email as confirmed
CREATE OR REPLACE FUNCTION mark_email_confirmed(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE profiles 
    SET email_confirmed_at = NOW(),
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark setup as completed
CREATE OR REPLACE FUNCTION mark_setup_completed(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE profiles 
    SET setup_completed_at = NOW(),
        profile_complete = TRUE,
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user setup status
CREATE OR REPLACE FUNCTION get_user_setup_status(user_id UUID)
RETURNS TABLE(
    user_id UUID,
    auth_provider VARCHAR(50),
    email_confirmed BOOLEAN,
    username_set BOOLEAN,
    codeunia_id_set BOOLEAN,
    setup_complete BOOLEAN,
    can_proceed BOOLEAN,
    next_step VARCHAR(100)
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
            'create_profile'::VARCHAR(100);
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
            ELSIF profile_record.username IS NULL OR profile_record.username_set = FALSE THEN
                next_step_text := 'setup_username';
                can_proceed_bool := FALSE;
            ELSE
                next_step_text := 'setup_complete';
                can_proceed_bool := TRUE;
            END IF;
        ELSE
            -- For OAuth users
            IF profile_record.username IS NULL OR profile_record.username_set = FALSE THEN
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
            next_step_text;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the existing set_username function to mark setup as completed
CREATE OR REPLACE FUNCTION set_username(user_id UUID, new_username VARCHAR(50))
RETURNS BOOLEAN AS $$
DECLARE
    profile_record RECORD;
    username_exists BOOLEAN;
BEGIN
    -- Get current profile
    SELECT * INTO profile_record 
    FROM profiles 
    WHERE id = user_id;
    
    -- Check if profile exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profile not found for user %', user_id;
    END IF;
    
    -- Check if username is already set
    IF profile_record.username_set THEN
        RAISE EXCEPTION 'Username already set for user %', user_id;
    END IF;
    
    -- Validate username format
    IF NOT validate_username(new_username) THEN
        RAISE EXCEPTION 'Invalid username format: %', new_username;
    END IF;
    
    -- Check if username is already taken
    SELECT EXISTS(
        SELECT 1 FROM profiles 
        WHERE username = new_username 
        AND id != user_id
    ) INTO username_exists;
    
    IF username_exists THEN
        RAISE EXCEPTION 'Username already taken: %', new_username;
    END IF;
    
    -- Update profile with username and mark setup as completed
    UPDATE profiles 
    SET username = new_username,
        username_set = TRUE,
        setup_completed_at = NOW(),
        profile_complete = TRUE,
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle OAuth user profile creation
CREATE OR REPLACE FUNCTION create_oauth_profile(
    user_id UUID,
    email TEXT,
    auth_provider VARCHAR(50),
    user_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    display_name TEXT;
    generated_username TEXT;
BEGIN
    -- Generate display name from metadata
    display_name := COALESCE(
        user_metadata->>'full_name',
        user_metadata->>'name',
        email::TEXT
    );
    
    -- Generate safe username from display name
    generated_username := generate_safe_username(display_name, user_id);
    
    -- Insert new profile for OAuth user
    INSERT INTO profiles (
        id,
        email,
        auth_provider,
        first_name,
        last_name,
        display_name,
        username,
        username_editable,
        email_confirmed_at, -- OAuth emails are pre-confirmed
        codeunia_id,
        username_set,
        profile_complete,
        is_public,
        email_notifications,
        profile_completion_percentage,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        email,
        auth_provider,
        user_metadata->>'first_name',
        user_metadata->>'last_name',
        display_name,
        generated_username,
        TRUE, -- Allow one-time edit
        NOW(), -- OAuth emails are pre-confirmed
        generate_codeunia_id(),
        FALSE, -- Username not set yet
        FALSE, -- Profile not complete until username is set
        TRUE,
        TRUE,
        0,
        NOW(),
        NOW()
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN unique_violation THEN
        -- Profile already exists, update auth provider if needed
        UPDATE profiles 
        SET auth_provider = create_oauth_profile.auth_provider,
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            updated_at = NOW()
        WHERE id = user_id;
        RETURN TRUE;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create OAuth profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle email user profile creation
CREATE OR REPLACE FUNCTION create_email_profile(
    user_id UUID,
    email TEXT,
    user_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    display_name TEXT;
    generated_username TEXT;
BEGIN
    -- Generate display name from metadata
    display_name := COALESCE(
        user_metadata->>'full_name',
        user_metadata->>'name',
        email::TEXT
    );
    
    -- Generate safe username from display name
    generated_username := generate_safe_username(display_name, user_id);
    
    -- Insert new profile for email user
    INSERT INTO profiles (
        id,
        email,
        auth_provider,
        first_name,
        last_name,
        display_name,
        username,
        username_editable,
        email_confirmed_at, -- Will be NULL until email is confirmed
        codeunia_id,
        username_set,
        profile_complete,
        is_public,
        email_notifications,
        profile_completion_percentage,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        email,
        'email',
        user_metadata->>'first_name',
        user_metadata->>'last_name',
        display_name,
        generated_username,
        TRUE, -- Allow one-time edit
        NULL, -- Email not confirmed yet
        generate_codeunia_id(),
        FALSE, -- Username not set yet
        FALSE, -- Profile not complete until email confirmed and username set
        TRUE,
        TRUE,
        0,
        NOW(),
        NOW()
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN unique_violation THEN
        -- Profile already exists, just return success
        RETURN TRUE;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create email profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for incomplete setups
CREATE OR REPLACE VIEW incomplete_setups AS
SELECT 
    p.id,
    p.email,
    p.auth_provider,
    p.email_confirmed_at,
    p.username,
    p.codeunia_id,
    p.username_set,
    p.setup_completed_at,
    CASE 
        WHEN p.auth_provider = 'email' AND p.email_confirmed_at IS NULL THEN 'email_confirmation_required'
        WHEN p.username IS NULL OR p.username_set = FALSE THEN 'username_setup_required'
        ELSE 'setup_complete'
    END as setup_status
FROM profiles p
WHERE p.setup_completed_at IS NULL;

-- Create view for setup statistics
CREATE OR REPLACE VIEW setup_statistics AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE auth_provider = 'email') as email_users,
    COUNT(*) FILTER (WHERE auth_provider IN ('google', 'github')) as oauth_users,
    COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as email_confirmed,
    COUNT(*) FILTER (WHERE username_set = TRUE) as usernames_set,
    COUNT(*) FILTER (WHERE setup_completed_at IS NOT NULL) as setup_completed,
    COUNT(*) FILTER (WHERE auth_provider = 'email' AND email_confirmed_at IS NULL) as pending_email_confirmation,
    COUNT(*) FILTER (WHERE username IS NULL OR username_set = FALSE) as pending_username_setup
FROM profiles;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_user_setup_complete(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_email_confirmed(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_setup_completed(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_setup_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_oauth_profile(UUID, TEXT, VARCHAR(50), JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION create_email_profile(UUID, TEXT, JSONB) TO authenticated;

-- Grant view permissions
GRANT SELECT ON incomplete_setups TO authenticated;
GRANT SELECT ON setup_statistics TO authenticated;

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND 
        (
            -- Allow updates to most fields
            (username IS NULL OR username_set = FALSE) OR 
            (username_set = TRUE AND username = OLD.username)
        ) AND
        -- Prevent direct updates to system-managed fields
        email_confirmed_at = OLD.email_confirmed_at AND
        setup_completed_at = OLD.setup_completed_at AND
        auth_provider = OLD.auth_provider
    );

-- Add policy for email confirmation
CREATE POLICY "Users can confirm their own email" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND 
        auth_provider = 'email' AND
        email_confirmed_at IS NULL
    );

COMMENT ON TABLE profiles IS 'User profiles with unified setup flow support';
COMMENT ON COLUMN profiles.email_confirmed_at IS 'Timestamp when email was confirmed (NULL for unconfirmed email users)';
COMMENT ON COLUMN profiles.auth_provider IS 'Authentication provider: email, google, github';
COMMENT ON COLUMN profiles.setup_completed_at IS 'Timestamp when user setup was completed'; 