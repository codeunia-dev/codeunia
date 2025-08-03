-- Create Auth Trigger for Automatic Profile Creation
-- This trigger will automatically create profiles when users sign up

-- Enable the pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function that will be called by the trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    first_name TEXT;
    last_name TEXT;
    generated_username TEXT;
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
    
    -- Generate safe username
    generated_username := generate_safe_username(first_name, last_name, NEW.id);
    
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
        generated_username,
        TRUE,
        CASE 
            WHEN NEW.raw_app_meta_data->>'provider' IS NOT NULL THEN NOW()
            ELSE NULL
        END,
        generate_codeunia_id(),
        FALSE,
        FALSE,
        TRUE,
        TRUE,
        0,
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

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Test the trigger
SELECT 'Auth trigger created successfully' as status; 