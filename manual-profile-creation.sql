-- Manual Profile Creation Test
-- Run this in your Supabase SQL Editor

-- First, let's check if we have any users in auth.users
SELECT 'Auth users count:' as info, COUNT(*) as count FROM auth.users;

-- Let's see the structure of the profiles table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Let's try to manually create a profile for the first user (if any exist)
DO $$
DECLARE
    first_user_id uuid;
    first_user_email text;
BEGIN
    -- Get the first user from auth.users
    SELECT id, email INTO first_user_id, first_user_email 
    FROM auth.users 
    LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Try to insert a profile manually
        INSERT INTO profiles (id, name, email, role)
        VALUES (first_user_id, 'Test User', first_user_email, 'user')
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email;
        
        RAISE NOTICE 'Successfully created/updated profile for user: %', first_user_email;
    ELSE
        RAISE NOTICE 'No users found in auth.users table';
    END IF;
END $$;

-- Check if profiles table has any data
SELECT 'Profiles count:' as info, COUNT(*) as count FROM profiles;

-- Show any existing profiles
SELECT id, name, email, role, created_at FROM profiles LIMIT 5; 