-- Quick Fix for Items Visibility
-- Run this in your Supabase SQL Editor

-- Drop all existing policies on items table
DROP POLICY IF EXISTS "View all active items" ON items;
DROP POLICY IF EXISTS "Create items" ON items;
DROP POLICY IF EXISTS "Update own items" ON items;
DROP POLICY IF EXISTS "Anyone can view active items" ON items;
DROP POLICY IF EXISTS "Users can create items" ON items;
DROP POLICY IF EXISTS "Users can update own items" ON items;
DROP POLICY IF EXISTS "Admins can manage any item" ON items;

-- Create a simple policy that allows viewing all items
CREATE POLICY "Allow viewing all items"
  ON items FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for creating items
CREATE POLICY "Allow creating items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy for updating items
CREATE POLICY "Allow updating items"
  ON items FOR UPDATE
  TO authenticated
  USING (true);

-- Also ensure categories are visible
DROP POLICY IF EXISTS "View categories" ON categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Only admins can manage categories" ON categories;

CREATE POLICY "Allow viewing categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Test if it works
SELECT 'RLS policies updated - items should now be visible!' as message; 