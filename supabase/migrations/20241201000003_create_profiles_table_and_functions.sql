-- =====================================================
-- CREATE PROFILES TABLE AND USERNAME FUNCTIONS
-- =====================================================
-- This migration creates the profiles table and the required
-- username management functions that the application expects

-- =====================================================
-- STEP 1: CREATE PROFILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Basic profile info
    first_name TEXT,
    last_name TEXT,
    bio TEXT,
    
    -- Contact information
    phone TEXT,
    email TEXT,
    
    -- Social links
    github_url TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    
    -- Professional info
    current_position TEXT,
    company TEXT,
    location TEXT,
    skills TEXT[],
    
    -- Settings
    is_public BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    
    -- Metadata
    profile_completion_percentage INTEGER DEFAULT 0,
    
    -- Username and Codeunia ID system
    username TEXT UNIQUE,
    username_editable BOOLEAN DEFAULT true,
    codeunia_id TEXT UNIQUE,
    username_set BOOLEAN DEFAULT false,
    profile_complete BOOLEAN DEFAULT false,
    
    -- Unified setup flow fields
    email_confirmed_at TIMESTAMPTZ,
    auth_provider TEXT,
    setup_completed_at TIMESTAMPTZ,
    
    -- Premium membership fields
    is_premium BOOLEAN DEFAULT false,
    premium_expires_at TIMESTAMPTZ,
    premium_plan TEXT,
    premium_purchased_at TIMESTAMPTZ,
    points_multiplier DECIMAL DEFAULT 1.0,
    
    -- Membership card email fields
    membership_card_sent BOOLEAN DEFAULT false,
    membership_card_sent_at TIMESTAMPTZ,
    
    -- Admin access
    is_admin BOOLEAN DEFAULT false
);

-- =====================================================
-- STEP 2: CREATE INDEXES
-- =====================================================

-- Username index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_codeunia_id ON profiles(codeunia_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_username_editable ON profiles(username_editable);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_complete ON profiles(profile_complete);

-- =====================================================
-- STEP 3: CREATE UPDATED_AT TRIGGER
-- =====================================================

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 4: CREATE USERNAME MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to update username (for existing users)
CREATE OR REPLACE FUNCTION update_username(
    user_id UUID,
    new_username TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    profile_record RECORD;
    username_exists BOOLEAN;
BEGIN
    -- Validate input
    IF user_id IS NULL OR new_username IS NULL THEN
        RAISE EXCEPTION 'User ID and username are required';
    END IF;
    
    -- Check if username is valid format
    IF NOT (new_username ~ '^[a-zA-Z0-9_-]+$') THEN
        RAISE EXCEPTION 'Username can only contain letters, numbers, underscores, and hyphens';
    END IF;
    
    -- Check username length
    IF LENGTH(new_username) < 3 OR LENGTH(new_username) > 30 THEN
        RAISE EXCEPTION 'Username must be between 3 and 30 characters';
    END IF;
    
    -- Get the user's profile
    SELECT * INTO profile_record
    FROM profiles
    WHERE id = user_id;
    
    -- Check if user exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Check if username is already editable
    IF NOT profile_record.username_editable THEN
        RAISE EXCEPTION 'Username can only be changed once';
    END IF;
    
    -- Check if username is already taken (case-insensitive)
    SELECT EXISTS(
        SELECT 1 FROM profiles 
        WHERE LOWER(username) = LOWER(new_username) 
        AND id != user_id
    ) INTO username_exists;
    
    IF username_exists THEN
        RAISE EXCEPTION 'Username is already taken';
    END IF;
    
    -- Update the username
    UPDATE profiles
    SET 
        username = new_username,
        username_editable = false,
        username_set = true,
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN true;
END;
$$;

-- Function to set username (for new users during setup)
CREATE OR REPLACE FUNCTION set_username(
    user_id UUID,
    new_username TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    profile_record RECORD;
    username_exists BOOLEAN;
BEGIN
    -- Validate input
    IF user_id IS NULL OR new_username IS NULL THEN
        RAISE EXCEPTION 'User ID and username are required';
    END IF;
    
    -- Check if username is valid format
    IF NOT (new_username ~ '^[a-zA-Z0-9_-]+$') THEN
        RAISE EXCEPTION 'Username can only contain letters, numbers, underscores, and hyphens';
    END IF;
    
    -- Check username length
    IF LENGTH(new_username) < 3 OR LENGTH(new_username) > 30 THEN
        RAISE EXCEPTION 'Username must be between 3 and 30 characters';
    END IF;
    
    -- Check if username is already taken (case-insensitive)
    SELECT EXISTS(
        SELECT 1 FROM profiles 
        WHERE LOWER(username) = LOWER(new_username)
    ) INTO username_exists;
    
    IF username_exists THEN
        RAISE EXCEPTION 'Username is already taken';
    END IF;
    
    -- Insert or update the profile
    INSERT INTO profiles (
        id, username, username_editable, username_set, 
        profile_complete, setup_completed_at, updated_at
    )
    VALUES (
        user_id, new_username, false, true, 
        true, NOW(), NOW()
    )
    ON CONFLICT (id) 
    DO UPDATE SET
        username = EXCLUDED.username,
        username_editable = EXCLUDED.username_editable,
        username_set = EXCLUDED.username_set,
        profile_complete = EXCLUDED.profile_complete,
        setup_completed_at = EXCLUDED.setup_completed_at,
        updated_at = EXCLUDED.updated_at;
    
    RETURN true;
END;
$$;

-- Function to generate a safe random username
CREATE OR REPLACE FUNCTION generate_safe_username()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    random_username TEXT;
    username_exists BOOLEAN;
    attempts INTEGER := 0;
    max_attempts INTEGER := 10;
BEGIN
    LOOP
        -- Generate a random username
        random_username := 'user' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        
        -- Check if it exists
        SELECT EXISTS(
            SELECT 1 FROM profiles 
            WHERE LOWER(username) = LOWER(random_username)
        ) INTO username_exists;
        
        -- If it doesn't exist, return it
        IF NOT username_exists THEN
            RETURN random_username;
        END IF;
        
        -- Increment attempts
        attempts := attempts + 1;
        
        -- If we've tried too many times, raise an exception
        IF attempts >= max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique username after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$;

-- Function to mark email as confirmed
CREATE OR REPLACE FUNCTION mark_email_confirmed(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE profiles
    SET 
        email_confirmed_at = NOW(),
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN true;
END;
$$;

-- Function to create email profile
CREATE OR REPLACE FUNCTION create_email_profile(
    user_id UUID,
    user_email TEXT,
    user_metadata JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO profiles (
        id, email, first_name, last_name, 
        is_public, email_notifications, profile_completion_percentage,
        username_editable, username_set, profile_complete, is_admin
    )
    VALUES (
        user_id, 
        user_email,
        COALESCE(user_metadata->>'first_name', user_metadata->>'given_name', ''),
        COALESCE(user_metadata->>'last_name', user_metadata->>'family_name', ''),
        true, true, 0,
        true, false, false, false
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN true;
END;
$$;

-- =====================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile and public profiles
CREATE POLICY "Users can view own profile and public profiles" ON profiles
    FOR SELECT USING (
        auth.uid() = id OR is_public = true
    );

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- STEP 6: GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Add a comment to track this migration
COMMENT ON TABLE profiles IS 'User profiles table created by migration 20241201000003';
