-- Fix RLS Policies for Items Visibility
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active items" ON items;
DROP POLICY IF EXISTS "Users can create items" ON items;
DROP POLICY IF EXISTS "Users can update own items" ON items;

-- Create a simple policy that allows viewing all active items
CREATE POLICY "View all active items"
  ON items FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Create policy for creating items
CREATE POLICY "Create items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create policy for updating own items
CREATE POLICY "Update own items"
  ON items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Also fix categories policy to allow viewing
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "View categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Test the policies
SELECT 'RLS policies updated successfully!' as message; 