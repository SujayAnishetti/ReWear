-- Create Demo and Admin Users for ReWear App
-- Run this script in your Supabase SQL Editor

-- First, let's create the users in auth.users (this needs to be done manually in Supabase Auth)
-- You'll need to create these users through the Supabase Dashboard or Auth API

-- Then, we'll create their profiles

-- Create demo user profile
INSERT INTO profiles (id, name, email, role, points, total_swaps, rating, location, bio)
VALUES (
  gen_random_uuid(), -- This will be replaced with the actual user ID from auth.users
  'Demo User',
  'demo@rewear.com',
  'user',
  1000,
  0,
  5.0,
  'New York, NY',
  'Demo user for testing the ReWear app'
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  points = EXCLUDED.points,
  total_swaps = EXCLUDED.total_swaps,
  rating = EXCLUDED.rating,
  location = EXCLUDED.location,
  bio = EXCLUDED.bio;

-- Create admin user profile
INSERT INTO profiles (id, name, email, role, points, total_swaps, rating, location, bio)
VALUES (
  gen_random_uuid(), -- This will be replaced with the actual user ID from auth.users
  'Admin User',
  'admin@rewear.com',
  'admin',
  9999,
  0,
  5.0,
  'San Francisco, CA',
  'Administrator of the ReWear app'
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  points = EXCLUDED.points,
  total_swaps = EXCLUDED.total_swaps,
  rating = EXCLUDED.rating,
  location = EXCLUDED.location,
  bio = EXCLUDED.bio;

-- Create categories if they don't exist
INSERT INTO categories (name, description) VALUES
  ('Clothing', 'Apparel and fashion items'),
  ('Shoes', 'Footwear and sneakers'),
  ('Accessories', 'Jewelry, bags, and other accessories'),
  ('Electronics', 'Gadgets and electronic devices'),
  ('Books', 'Books and educational materials'),
  ('Sports', 'Sports equipment and athletic gear'),
  ('Home & Garden', 'Home decor and gardening items'),
  ('Toys & Games', 'Entertainment and gaming items')
ON CONFLICT (name) DO NOTHING;

-- Create sample items for demo user
-- Note: You'll need to replace 'demo-user-id' with the actual user ID after creating the user
INSERT INTO items (
  title, 
  description, 
  category_id, 
  size, 
  condition, 
  points, 
  tags, 
  images, 
  user_id, 
  status, 
  views
) VALUES
  (
    'Vintage Denim Jacket',
    'Classic blue denim jacket in excellent condition. Perfect for layering.',
    (SELECT id FROM categories WHERE name = 'Clothing' LIMIT 1),
    'M',
    'Excellent',
    500,
    ARRAY['denim', 'vintage', 'jacket'],
    ARRAY['https://images.unsplash.com/photo-1544022613-e87ca540b5c5?w=400'],
    (SELECT id FROM profiles WHERE email = 'demo@rewear.com' LIMIT 1),
    'active',
    0
  ),
  (
    'Nike Air Max Sneakers',
    'Comfortable running shoes with great cushioning. Size 10.',
    (SELECT id FROM categories WHERE name = 'Shoes' LIMIT 1),
    '10',
    'Good',
    300,
    ARRAY['nike', 'running', 'sneakers'],
    ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
    (SELECT id FROM profiles WHERE email = 'demo@rewear.com' LIMIT 1),
    'active',
    0
  ),
  (
    'Leather Crossbody Bag',
    'Stylish leather bag perfect for everyday use. Brown color.',
    (SELECT id FROM categories WHERE name = 'Accessories' LIMIT 1),
    'One Size',
    'Like New',
    400,
    ARRAY['leather', 'bag', 'crossbody'],
    ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400'],
    (SELECT id FROM profiles WHERE email = 'demo@rewear.com' LIMIT 1),
    'active',
    0
  )
ON CONFLICT DO NOTHING;

-- Create sample items for admin user
INSERT INTO items (
  title, 
  description, 
  category_id, 
  size, 
  condition, 
  points, 
  tags, 
  images, 
  user_id, 
  status, 
  views
) VALUES
  (
    'MacBook Pro 2019',
    'Excellent condition MacBook Pro. Great for work or school.',
    (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1),
    '13 inch',
    'Excellent',
    2000,
    ARRAY['macbook', 'laptop', 'apple'],
    ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],
    (SELECT id FROM profiles WHERE email = 'admin@rewear.com' LIMIT 1),
    'active',
    0
  ),
  (
    'Wireless Headphones',
    'High-quality wireless headphones with noise cancellation.',
    (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1),
    'One Size',
    'Good',
    800,
    ARRAY['headphones', 'wireless', 'audio'],
    ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
    (SELECT id FROM profiles WHERE email = 'admin@rewear.com' LIMIT 1),
    'active',
    0
  )
ON CONFLICT DO NOTHING;

-- Update the user IDs in profiles to match the actual auth.users IDs
-- You'll need to run this after creating the users in Supabase Auth
-- Replace the UUIDs with the actual user IDs from auth.users

-- Example (replace with actual UUIDs):
-- UPDATE profiles SET id = 'actual-demo-user-uuid' WHERE email = 'demo@rewear.com';
-- UPDATE profiles SET id = 'actual-admin-user-uuid' WHERE email = 'admin@rewear.com';

-- Also update the items to use the correct user IDs:
-- UPDATE items SET user_id = 'actual-demo-user-uuid' WHERE user_id IN (SELECT id FROM profiles WHERE email = 'demo@rewear.com');
-- UPDATE items SET user_id = 'actual-admin-user-uuid' WHERE user_id IN (SELECT id FROM profiles WHERE email = 'admin@rewear.com');

COMMENT ON TABLE profiles IS 'User profiles with role-based access control';
COMMENT ON TABLE items IS 'Items available for swapping with RLS policies';
COMMENT ON TABLE categories IS 'Item categories for organization'; 