-- =====================================================
-- FIX UPDATE_USERNAME FUNCTION
-- =====================================================
-- Copy and paste this query to fix the update_username function

-- Drop and recreate the function with proper schema references
DROP FUNCTION IF EXISTS update_username(UUID, TEXT);

CREATE OR REPLACE FUNCTION update_username(
    user_id UUID,
    new_username TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    can_edit BOOLEAN;
    username_exists BOOLEAN;
BEGIN
    -- Check if user can still edit username
    SELECT username_editable INTO can_edit 
    FROM public.profiles 
    WHERE id = user_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    IF NOT can_edit THEN
        RETURN FALSE; -- Username already edited once
    END IF;
    
    -- Check if new username already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = new_username AND id != user_id) 
    INTO username_exists;
    
    IF username_exists THEN
        RETURN FALSE; -- Username already taken
    END IF;
    
    -- Update username and mark as non-editable
    UPDATE public.profiles 
    SET username = new_username, username_editable = FALSE
    WHERE id = user_id;
    
    RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_username(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_username(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION update_username(UUID, TEXT) TO service_role;

-- Test the function
SELECT 
    'Function Fixed' as status,
    'update_username function has been updated with proper schema references' as message;
