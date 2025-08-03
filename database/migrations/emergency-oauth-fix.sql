-- Emergency OAuth Fix
-- This fixes the immediate authentication issue

-- First, let's check if the generate_safe_username function exists and works
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

-- Now fix the OAuth profile creation function with better error handling
CREATE OR REPLACE FUNCTION create_oauth_profile(
    user_id UUID,
    email TEXT,
    auth_provider VARCHAR(50),
    user_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    first_name TEXT;
    last_name TEXT;
    generated_username TEXT;
    existing_profile BOOLEAN;
BEGIN
    -- Check if profile already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO existing_profile;
    
    IF existing_profile THEN
        -- Profile exists, just update auth provider
        UPDATE profiles 
        SET auth_provider = create_oauth_profile.auth_provider,
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            updated_at = NOW()
        WHERE id = user_id;
        RETURN TRUE;
    END IF;

    -- Extract first and last name from metadata
    first_name := COALESCE(
        user_metadata->>'first_name',
        user_metadata->>'given_name',
        ''
    );
    
    last_name := COALESCE(
        user_metadata->>'last_name',
        user_metadata->>'family_name',
        ''
    );
    
    -- Generate safe username
    generated_username := generate_safe_username(first_name, last_name, user_id);
    
    -- Insert new profile for OAuth user
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
        user_id,
        email,
        auth_provider,
        first_name,
        last_name,
        generated_username,
        TRUE,
        NOW(),
        generate_codeunia_id(),
        FALSE,
        FALSE,
        TRUE,
        TRUE,
        0,
        NOW(),
        NOW()
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the authentication
        RAISE LOG 'Error creating OAuth profile for user %: %', user_id, SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the email profile creation function
CREATE OR REPLACE FUNCTION create_email_profile(
    user_id UUID,
    email TEXT,
    user_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    first_name TEXT;
    last_name TEXT;
    generated_username TEXT;
    existing_profile BOOLEAN;
BEGIN
    -- Check if profile already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO existing_profile;
    
    IF existing_profile THEN
        -- Profile exists, just update
        UPDATE profiles 
        SET auth_provider = 'email',
            updated_at = NOW()
        WHERE id = user_id;
        RETURN TRUE;
    END IF;

    -- Extract first and last name from metadata
    first_name := COALESCE(
        user_metadata->>'first_name',
        user_metadata->>'given_name',
        ''
    );
    
    last_name := COALESCE(
        user_metadata->>'last_name',
        user_metadata->>'family_name',
        ''
    );
    
    -- Generate safe username
    generated_username := generate_safe_username(first_name, last_name, user_id);
    
    -- Insert new profile for email user
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
        user_id,
        email,
        'email',
        first_name,
        last_name,
        generated_username,
        TRUE,
        NULL,
        generate_codeunia_id(),
        FALSE,
        FALSE,
        TRUE,
        TRUE,
        0,
        NOW(),
        NOW()
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the authentication
        RAISE LOG 'Error creating email profile for user %: %', user_id, SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the functions
SELECT 'Functions created successfully' as status; 