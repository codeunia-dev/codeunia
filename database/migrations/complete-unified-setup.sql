-- Complete Unified Setup Flow Migration
-- This implements the mandatory username + Codeunia ID setup flow

-- 1. Update profiles table to ensure all required fields exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username_editable BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS username_set BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS setup_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE;

-- 2. Create unique index on username (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique 
ON profiles (LOWER(username)) 
WHERE username IS NOT NULL;

-- 3. Create unique index on codeunia_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_codeunia_id_unique 
ON profiles (codeunia_id) 
WHERE codeunia_id IS NOT NULL;

-- 4. Update the generate_safe_username function to handle fallback mechanism
CREATE OR REPLACE FUNCTION generate_safe_username(first_name TEXT, last_name TEXT, user_id UUID)
RETURNS TEXT AS $$
DECLARE
    base_username TEXT;
    final_username TEXT;
    counter INTEGER := 0;
    full_name TEXT;
    uuid_part TEXT;
BEGIN
    -- Combine first_name and last_name
    full_name := CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''));
    full_name := TRIM(full_name);

    -- If no name provided, use UUID-based fallback
    IF full_name = '' THEN
        uuid_part := SUBSTRING(user_id::TEXT, 1, 8);
        base_username := 'user-' || uuid_part;
    ELSE
        -- Convert to safe username format
        base_username := LOWER(REGEXP_REPLACE(full_name, '[^a-zA-Z0-9]', '', 'g'));
        
        -- If empty after cleaning, use UUID-based fallback
        IF base_username = '' THEN
            uuid_part := SUBSTRING(user_id::TEXT, 1, 8);
            base_username := 'user-' || uuid_part;
        END IF;
    END IF;

    -- Limit length to 30 characters
    base_username := LEFT(base_username, 30);

    -- Try base username first
    final_username := base_username;

    -- If username exists, add random suffix
    WHILE EXISTS (SELECT 1 FROM profiles WHERE LOWER(username) = LOWER(final_username)) LOOP
        counter := counter + 1;
        final_username := base_username || '_' || LPAD(counter::TEXT, 3, '0');

        -- Prevent infinite loop
        IF counter > 999 THEN
            uuid_part := SUBSTRING(user_id::TEXT, 1, 8);
            final_username := 'user-' || uuid_part || '_' || FLOOR(RANDOM() * 1000)::TEXT;
            EXIT;
        END IF;
    END LOOP;

    RETURN final_username;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to check username availability (case-insensitive)
CREATE OR REPLACE FUNCTION check_username_availability(username_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if username exists (case-insensitive)
    IF EXISTS (SELECT 1 FROM profiles WHERE LOWER(username) = LOWER(username_param)) THEN
        RETURN FALSE;
    ELSE
        RETURN TRUE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to set username with validation
CREATE OR REPLACE FUNCTION set_username(user_id UUID, new_username TEXT)
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
    
    -- Check if username is already set and not editable
    IF profile_record.username_set AND NOT profile_record.username_editable THEN
        RAISE EXCEPTION 'Username already set and cannot be changed for user %', user_id;
    END IF;
    
    -- Validate username format
    IF new_username !~ '^[a-zA-Z0-9_-]+$' THEN
        RAISE EXCEPTION 'Username can only contain letters, numbers, hyphens, and underscores';
    END IF;
    
    IF LENGTH(new_username) < 3 OR LENGTH(new_username) > 20 THEN
        RAISE EXCEPTION 'Username must be between 3 and 20 characters';
    END IF;
    
    -- Check if username is available (case-insensitive)
    SELECT EXISTS(SELECT 1 FROM profiles WHERE LOWER(username) = LOWER(new_username)) INTO username_exists;
    
    IF username_exists THEN
        RAISE EXCEPTION 'Username is already taken';
    END IF;
    
    -- Update profile with new username
    UPDATE profiles 
    SET 
        username = new_username,
        username_set = TRUE,
        username_editable = FALSE, -- User can only change once
        profile_complete = TRUE,
        setup_completed_at = NOW(),
        profile_completion_percentage = 100,
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error setting username for user %: %', user_id, SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update get_user_setup_status function
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

-- 8. Update the auth trigger to handle the complete flow
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    first_name TEXT;
    last_name TEXT;
    provided_username TEXT;
    final_username TEXT;
    username_exists BOOLEAN;
    uuid_part TEXT;
BEGIN
    -- Extract first and last name from user metadata
    first_name := COALESCE(
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'given_name',
        ''
    );
    
    last_name := COALESCE(
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'family_name',
        ''
    );
    
    -- Extract username from metadata (if provided during signup)
    provided_username := NEW.raw_user_meta_data->>'username';
    
    -- Determine final username
    IF provided_username IS NOT NULL AND LENGTH(TRIM(provided_username)) > 0 THEN
        -- Check if provided username is available (case-insensitive)
        SELECT EXISTS(SELECT 1 FROM profiles WHERE LOWER(username) = LOWER(provided_username)) INTO username_exists;
        
        IF username_exists THEN
            -- Username taken, generate a fallback
            uuid_part := SUBSTRING(NEW.id::TEXT, 1, 8);
            final_username := 'user-' || uuid_part;
        ELSE
            -- Use provided username
            final_username := provided_username;
        END IF;
    ELSE
        -- No username provided, generate a fallback
        uuid_part := SUBSTRING(NEW.id::TEXT, 1, 8);
        final_username := 'user-' || uuid_part;
    END IF;
    
    -- Ensure username is unique
    WHILE EXISTS (SELECT 1 FROM profiles WHERE LOWER(username) = LOWER(final_username)) LOOP
        uuid_part := SUBSTRING(NEW.id::TEXT, 1, 8);
        final_username := 'user-' || uuid_part || '_' || FLOOR(RANDOM() * 1000)::TEXT;
    END LOOP;
    
    -- Insert new profile
    INSERT INTO profiles (
        id,
        email,
        auth_provider,
        first_name,
        last_name,
        username,
        username_editable,
        username_set,
        email_confirmed_at,
        codeunia_id,
        profile_complete,
        setup_completed_at,
        is_public,
        email_notifications,
        profile_completion_percentage,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
        first_name,
        last_name,
        final_username,
        CASE 
            WHEN provided_username IS NOT NULL AND LENGTH(TRIM(provided_username)) > 0 AND NOT username_exists THEN FALSE
            ELSE TRUE
        END,
        CASE 
            WHEN provided_username IS NOT NULL AND LENGTH(TRIM(provided_username)) > 0 AND NOT username_exists THEN TRUE
            ELSE FALSE
        END,
        CASE 
            WHEN NEW.raw_app_meta_data->>'provider' IS NOT NULL THEN NOW()
            ELSE NULL
        END,
        generate_codeunia_id(),
        CASE 
            WHEN provided_username IS NOT NULL AND LENGTH(TRIM(provided_username)) > 0 AND NOT username_exists THEN TRUE
            ELSE FALSE
        END,
        CASE 
            WHEN provided_username IS NOT NULL AND LENGTH(TRIM(provided_username)) > 0 AND NOT username_exists THEN NOW()
            ELSE NULL
        END,
        TRUE,
        TRUE,
        CASE 
            WHEN provided_username IS NOT NULL AND LENGTH(TRIM(provided_username)) > 0 AND NOT username_exists THEN 100
            ELSE 50
        END,
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Profile already exists, just return
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error but don't fail the signup
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Update the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 10. Grant permissions
GRANT EXECUTE ON FUNCTION check_username_availability(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION set_username(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_setup_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_safe_username(TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_codeunia_id() TO authenticated;

-- 11. Test the setup
SELECT 'Complete unified setup flow migration applied successfully' as status; 