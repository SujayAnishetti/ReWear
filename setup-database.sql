-- ReWear Platform Database Setup
-- Run this in your Supabase SQL Editor

-- Create profiles table
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

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES categories(id),
  size text NOT NULL,
  condition text NOT NULL CHECK (condition IN ('Like New', 'Excellent', 'Good', 'Fair')),
  points integer NOT NULL CHECK (points > 0),
  tags text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'swapped', 'pending', 'rejected')),
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create swap_requests table
CREATE TABLE IF NOT EXISTS swap_requests (
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
CREATE TABLE IF NOT EXISTS transactions (
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
  ('Formal', 'Business and formal attire', 'formal')
ON CONFLICT (name) DO NOTHING;

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