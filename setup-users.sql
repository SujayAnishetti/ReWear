-- Setup Users and Profiles for ReWear App
-- This script creates the demo user and admin user with proper profiles

-- First, let's check if the profiles table exists and has the right structure
-- If not, we'll create it

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  points INTEGER DEFAULT 1000,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  location TEXT,
  bio TEXT,
  total_swaps INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update all profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    CASE 
      WHEN NEW.email = 'admin@rewear.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert demo user profile (if not exists)
INSERT INTO profiles (id, name, email, role, points, total_swaps, rating)
VALUES (
  'demo-user-id', -- This will be replaced with actual UUID when user signs up
  'Demo User',
  'demo@rewear.com',
  'user',
  1000,
  0,
  5.0
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  points = EXCLUDED.points,
  total_swaps = EXCLUDED.total_swaps,
  rating = EXCLUDED.rating;

-- Insert admin user profile (if not exists)
INSERT INTO profiles (id, name, email, role, points, total_swaps, rating)
VALUES (
  'admin-user-id', -- This will be replaced with actual UUID when user signs up
  'Admin User',
  'admin@rewear.com',
  'admin',
  9999,
  0,
  5.0
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  points = EXCLUDED.points,
  total_swaps = EXCLUDED.total_swaps,
  rating = EXCLUDED.rating;

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

-- Create some sample items for the demo user
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
    'demo-user-id',
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
    'demo-user-id',
    'active',
    0
  )
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Enable RLS on items table if not already enabled
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for items
DROP POLICY IF EXISTS "Users can view active items" ON items;
CREATE POLICY "Users can view active items" ON items
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Users can view their own items" ON items;
CREATE POLICY "Users can view their own items" ON items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own items" ON items;
CREATE POLICY "Users can insert their own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own items" ON items;
CREATE POLICY "Users can update their own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own items" ON items;
CREATE POLICY "Users can delete their own items" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on categories table if not already enabled
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for categories (allow all authenticated users to read)
DROP POLICY IF EXISTS "Users can view categories" ON categories;
CREATE POLICY "Users can view categories" ON categories
  FOR SELECT USING (true);

COMMENT ON TABLE profiles IS 'User profiles with role-based access control';
COMMENT ON TABLE items IS 'Items available for swapping with RLS policies';
COMMENT ON TABLE categories IS 'Item categories for organization'; 