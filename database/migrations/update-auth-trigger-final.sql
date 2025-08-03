-- Update Auth Trigger for Unified Setup Flow
-- This updates the trigger to work with your current table structure

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    first_name TEXT;
    last_name TEXT;
    provided_username TEXT;
    final_username TEXT;
    username_exists BOOLEAN;
    uuid_part TEXT;
    auth_provider TEXT;
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
    
    -- Determine auth provider
    auth_provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
    
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
        auth_provider,
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
            WHEN auth_provider != 'email' THEN NOW()
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

-- Update the trigger (it should already exist, but this ensures it's correct)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Test the trigger
SELECT 'Auth trigger updated successfully for unified setup flow' as status; 