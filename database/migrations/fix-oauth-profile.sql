-- Fix OAuth Profile Creation Function
-- Remove display_name references and fix the function

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
BEGIN
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
    
    -- Generate safe username from first and last name
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
        first_name,
        last_name,
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

-- Also fix the email profile creation function
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
BEGIN
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
    
    -- Generate safe username from first and last name
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
        TRUE, -- Allow one-time edit
        NULL, -- Email not confirmed yet
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
        -- Profile already exists, update if needed
        UPDATE profiles 
        SET auth_provider = 'email',
            updated_at = NOW()
        WHERE id = user_id;
        RETURN TRUE;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create email profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
 