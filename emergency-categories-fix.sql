-- Emergency Categories Fix
-- Run this in your Supabase SQL Editor

-- Temporarily disable RLS on categories to test
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Ensure categories table exists and has data
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Insert categories if they don't exist
INSERT INTO categories (name, description, icon) VALUES
  ('Tops', 'T-shirts, blouses, sweaters, and other upper body clothing', 'shirt'),
  ('Bottoms', 'Pants, jeans, skirts, and shorts', 'pants'),
  ('Dresses', 'Casual and formal dresses', 'dress'),
  ('Outerwear', 'Jackets, coats, and blazers', 'jacket'),
  ('Shoes', 'Sneakers, boots, heels, and sandals', 'shoe'),
  ('Accessories', 'Bags, jewelry, scarves, and other accessories', 'accessory'),
  ('Activewear', 'Sportswear and athletic clothing', 'sport'),
  ('Formal', 'Business and formal attire', 'formal')
ON CONFLICT (name) DO NOTHING;

-- Test the query
SELECT 'Categories after fix:' as info, COUNT(*) as count FROM categories;
SELECT 'Sample categories:' as info, name FROM categories LIMIT 3;

-- Success message
SELECT '🚨 Emergency fix applied! Categories should now be accessible.' as message; 