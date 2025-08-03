-- Add is_admin column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
        
        -- Create index for admin queries
        CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
        
        -- Create partial index for admin users
        CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(id, is_admin) WHERE is_admin = true;
        
        RAISE NOTICE 'Added is_admin column to profiles table';
    ELSE
        RAISE NOTICE 'is_admin column already exists in profiles table';
    END IF;
END $$; 