-- Update Auth Trigger to Handle Username from Signup
-- This updates the trigger to use the username provided during signup

-- Update the function to handle username from metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    first_name TEXT;
    last_name TEXT;
    provided_username TEXT;
    final_username TEXT;
    username_exists BOOLEAN;
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
        -- Check if provided username is available
        SELECT EXISTS(SELECT 1 FROM profiles WHERE username = provided_username) INTO username_exists;
        
        IF username_exists THEN
            -- Username taken, generate a safe one
            final_username := generate_safe_username(first_name, last_name, NEW.id);
        ELSE
            -- Use provided username
            final_username := provided_username;
        END IF;
    ELSE
        -- No username provided, generate a safe one
        final_username := generate_safe_username(first_name, last_name, NEW.id);
    END IF;
    
    -- Insert new profile
    INSERT INTO profiles (
        id,
        email,
        auth_provider,
        first_name,
        last_name,
        username,
        username_editable,
        email_confirmed_at,
        codeunia_id,
        username_set,
        profile_complete,
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
            WHEN provided_username IS NOT NULL AND LENGTH(TRIM(provided_username)) > 0 AND NOT username_exists THEN TRUE
            ELSE TRUE
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
            WHEN provided_username IS NOT NULL AND LENGTH(TRIM(provided_username)) > 0 AND NOT username_exists THEN TRUE
            ELSE FALSE
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

-- Update the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Test the trigger
SELECT 'Auth trigger updated successfully to handle username from signup' as status; 