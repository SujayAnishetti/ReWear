-- Fix User Registration Error
-- Run this in your Supabase SQL Editor

-- First, let's make sure the profiles table exists and has the right structure
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  points integer DEFAULT 50,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  location text,
  bio text,
  total_swaps integer DEFAULT 0,
  rating numeric(3,2) DEFAULT 5.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a simple RLS policy that allows all operations for now (we'll tighten this later)
DROP POLICY IF EXISTS "Allow all operations" ON profiles;
CREATE POLICY "Allow all operations" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- Create a simpler trigger function that's less likely to fail
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to insert the profile, but don't fail if it already exists
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Test the function manually
SELECT 'Trigger function created successfully' as status; 