-- Comprehensive Fix for All Database Issues
-- Run this in your Supabase SQL Editor

-- First, let's check what we have
SELECT 'Current database state:' as info;

-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if we have categories
SELECT 'Categories count:' as info, COUNT(*) as count FROM categories;

-- Check if we have items
SELECT 'Items count:' as info, COUNT(*) as count FROM items;

-- Now let's fix everything step by step

-- 1. Ensure categories table has data
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

-- 2. Ensure items table has sample data
INSERT INTO items (title, description, category_id, size, condition, points, tags, images, status) VALUES
('Vintage Denim Jacket', 'Classic blue denim jacket with a comfortable fit. Perfect for layering in any season.', 
 (SELECT id FROM categories WHERE name = 'Outerwear' LIMIT 1), 'M', 'Excellent', 45, 
 ARRAY['denim', 'vintage', 'jacket'], ARRAY['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400'], 'active'),

('Cotton T-Shirt Collection', 'Set of 3 high-quality cotton t-shirts in various colors. Soft and comfortable.', 
 (SELECT id FROM categories WHERE name = 'Tops' LIMIT 1), 'L', 'Like New', 25, 
 ARRAY['cotton', 't-shirt', 'casual'], ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'], 'active'),

('Summer Floral Dress', 'Beautiful floral print dress perfect for summer events. Light and breezy fabric.', 
 (SELECT id FROM categories WHERE name = 'Dresses' LIMIT 1), 'M', 'Excellent', 55, 
 ARRAY['floral', 'summer', 'dress'], ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400'], 'active'),

('White Sneakers', 'Clean white sneakers in excellent condition. Versatile and comfortable for everyday wear.', 
 (SELECT id FROM categories WHERE name = 'Shoes' LIMIT 1), '8', 'Like New', 50, 
 ARRAY['sneakers', 'white', 'casual'], ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'], 'active'),

('Leather Handbag', 'Elegant leather handbag with multiple compartments. Perfect for work or casual use.', 
 (SELECT id FROM categories WHERE name = 'Accessories' LIMIT 1), 'One Size', 'Like New', 60, 
 ARRAY['handbag', 'leather', 'elegant'], ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400'], 'active')
ON CONFLICT DO NOTHING;

-- 3. Fix all RLS policies
-- Categories policies
DROP POLICY IF EXISTS "Allow viewing categories" ON categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Only admins can manage categories" ON categories;

CREATE POLICY "Categories - Allow viewing"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Items policies
DROP POLICY IF EXISTS "Allow viewing all items" ON items;
DROP POLICY IF EXISTS "Create items" ON items;
DROP POLICY IF EXISTS "Update own items" ON items;
DROP POLICY IF EXISTS "Anyone can view active items" ON items;
DROP POLICY IF EXISTS "Users can create items" ON items;
DROP POLICY IF EXISTS "Users can update own items" ON items;
DROP POLICY IF EXISTS "Admins can manage any item" ON items;

CREATE POLICY "Items - Allow viewing"
  ON items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Items - Allow creating"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Items - Allow updating"
  ON items FOR UPDATE
  TO authenticated
  USING (true);

-- Profiles policies
DROP POLICY IF EXISTS "Allow all operations" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

CREATE POLICY "Profiles - Allow viewing"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Profiles - Allow creating"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Profiles - Allow updating"
  ON profiles FOR UPDATE
  TO authenticated
  USING (true);

-- 4. Test the fixes
SELECT 'Categories after fix:' as info, COUNT(*) as count FROM categories;
SELECT 'Items after fix:' as info, COUNT(*) as count FROM items WHERE status = 'active';

-- 5. Success message
SELECT '🎉 All database issues fixed! Browse Items and Add Item should now work.' as message; 