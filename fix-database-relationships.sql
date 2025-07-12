-- Fix Database Relationships
-- Run this in your Supabase SQL Editor

-- First, let's drop and recreate the tables with proper relationships
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS swap_requests CASCADE;
DROP TABLE IF EXISTS items CASCADE;

-- Recreate items table
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

-- Recreate swap_requests table with explicit foreign key names
CREATE TABLE swap_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add explicit constraint names
  CONSTRAINT fk_swap_requests_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  CONSTRAINT fk_swap_requests_requester FOREIGN KEY (requester_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_swap_requests_owner FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Recreate transactions table with explicit foreign key names
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  buyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  points integer NOT NULL,
  type text NOT NULL CHECK (type IN ('swap', 'purchase')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  
  -- Add explicit constraint names
  CONSTRAINT fk_transactions_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_buyer FOREIGN KEY (buyer_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_seller FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

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

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

-- Create triggers for updated_at
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_swap_requests_updated_at BEFORE UPDATE ON swap_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_swap_requests_item_id ON swap_requests(item_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_requester_id ON swap_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_owner_id ON swap_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);

-- Add sample items back
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
 ARRAY['handbag', 'leather', 'elegant'], ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400'], 'active');

SELECT 'Database relationships fixed successfully!' as message; 