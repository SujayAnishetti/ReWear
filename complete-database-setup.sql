-- Complete ReWear Database Setup
-- Run this entire script in your Supabase SQL Editor

-- Drop existing tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS swap_requests CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Create profiles table
CREATE TABLE profiles (
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

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Create items table (allowing NULL user_id temporarily)
CREATE TABLE items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES categories(id),
  size text NOT NULL,
  condition text NOT NULL CHECK (condition IN ('Like New', 'Excellent', 'Good', 'Fair')),
  points integer NOT NULL CHECK (points > 0),
  tags text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'swapped', 'pending', 'rejected')),
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create swap_requests table
CREATE TABLE swap_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  buyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  points integer NOT NULL,
  type text NOT NULL CHECK (type IN ('swap', 'purchase')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Insert default categories
INSERT INTO categories (name, description, icon) VALUES
  ('Tops', 'T-shirts, blouses, sweaters, and other upper body clothing', 'shirt'),
  ('Bottoms', 'Pants, jeans, skirts, and shorts', 'pants'),
  ('Dresses', 'Casual and formal dresses', 'dress'),
  ('Outerwear', 'Jackets, coats, and blazers', 'jacket'),
  ('Shoes', 'Sneakers, boots, heels, and sandals', 'shoe'),
  ('Accessories', 'Bags, jewelry, scarves, and other accessories', 'accessory'),
  ('Activewear', 'Sportswear and athletic clothing', 'sport'),
  ('Formal', 'Business and formal attire', 'formal');

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Categories policies
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Items policies
CREATE POLICY "Anyone can view active items"
  ON items FOR SELECT
  TO authenticated
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can create items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
  ON items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage any item"
  ON items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Swap requests policies
CREATE POLICY "Users can view own swap requests"
  ON swap_requests FOR SELECT
  TO authenticated
  USING (requester_id = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "Users can create swap requests"
  ON swap_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Item owners can update swap requests"
  ON swap_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all swap requests"
  ON swap_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Admins can view all transactions"
  ON transactions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_swap_requests_updated_at BEFORE UPDATE ON swap_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
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

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_swap_requests_item_id ON swap_requests(item_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_requester_id ON swap_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_owner_id ON swap_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);

-- Add sample items
INSERT INTO items (title, description, category_id, size, condition, points, tags, images, status) VALUES
('Vintage Denim Jacket', 'Classic blue denim jacket with a comfortable fit. Perfect for layering in any season.', 
 (SELECT id FROM categories WHERE name = 'Outerwear' LIMIT 1), 'M', 'Excellent', 45, 
 ARRAY['denim', 'vintage', 'jacket'], ARRAY['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400'], 'active'),

('Cotton T-Shirt Collection', 'Set of 3 high-quality cotton t-shirts in various colors. Soft and comfortable.', 
 (SELECT id FROM categories WHERE name = 'Tops' LIMIT 1), 'L', 'Like New', 25, 
 ARRAY['cotton', 't-shirt', 'casual'], ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'], 'active'),

('Wool Sweater', 'Warm wool sweater perfect for cold weather. Classic design that never goes out of style.', 
 (SELECT id FROM categories WHERE name = 'Tops' LIMIT 1), 'S', 'Good', 35, 
 ARRAY['wool', 'sweater', 'winter'], ARRAY['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400'], 'active'),

('Summer Floral Dress', 'Beautiful floral print dress perfect for summer events. Light and breezy fabric.', 
 (SELECT id FROM categories WHERE name = 'Dresses' LIMIT 1), 'M', 'Excellent', 55, 
 ARRAY['floral', 'summer', 'dress'], ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400'], 'active'),

('Cocktail Dress', 'Elegant black cocktail dress suitable for formal events. Timeless design.', 
 (SELECT id FROM categories WHERE name = 'Dresses' LIMIT 1), 'S', 'Like New', 75, 
 ARRAY['cocktail', 'formal', 'black'], ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'], 'active'),

('High-Waisted Jeans', 'Comfortable high-waisted jeans with a modern fit. Great for casual and semi-formal occasions.', 
 (SELECT id FROM categories WHERE name = 'Bottoms' LIMIT 1), 'M', 'Good', 40, 
 ARRAY['jeans', 'high-waisted', 'casual'], ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'], 'active'),

('White Sneakers', 'Clean white sneakers in excellent condition. Versatile and comfortable for everyday wear.', 
 (SELECT id FROM categories WHERE name = 'Shoes' LIMIT 1), '8', 'Like New', 50, 
 ARRAY['sneakers', 'white', 'casual'], ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'], 'active'),

('Leather Handbag', 'Elegant leather handbag with multiple compartments. Perfect for work or casual use.', 
 (SELECT id FROM categories WHERE name = 'Accessories' LIMIT 1), 'One Size', 'Like New', 60, 
 ARRAY['handbag', 'leather', 'elegant'], ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400'], 'active'),

('Business Suit', 'Professional business suit suitable for formal occasions. Classic black design.', 
 (SELECT id FROM categories WHERE name = 'Formal' LIMIT 1), 'M', 'Like New', 120, 
 ARRAY['suit', 'business', 'formal'], ARRAY['https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400'], 'active'),

('Yoga Pants', 'Comfortable yoga pants perfect for workouts or casual wear. High-quality fabric.', 
 (SELECT id FROM categories WHERE name = 'Activewear' LIMIT 1), 'M', 'Good', 35, 
 ARRAY['yoga', 'pants', 'workout'], ARRAY['https://images.unsplash.com/photo-1506629905607-13e6f5c1c47c?w=400'], 'active');

-- Success message
SELECT 'Database setup completed successfully! You can now register users and browse items.' as message; 