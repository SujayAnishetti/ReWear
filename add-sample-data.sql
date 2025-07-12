-- Add Sample Items to ReWear Database
-- Run this in your Supabase SQL Editor after running setup-database.sql

-- First, let's get the category IDs
DO $$
DECLARE
    tops_id uuid;
    bottoms_id uuid;
    dresses_id uuid;
    outerwear_id uuid;
    shoes_id uuid;
    accessories_id uuid;
    activewear_id uuid;
    formal_id uuid;
    test_user_id uuid;
BEGIN
    -- Get category IDs
    SELECT id INTO tops_id FROM categories WHERE name = 'Tops' LIMIT 1;
    SELECT id INTO bottoms_id FROM categories WHERE name = 'Bottoms' LIMIT 1;
    SELECT id INTO dresses_id FROM categories WHERE name = 'Dresses' LIMIT 1;
    SELECT id INTO outerwear_id FROM categories WHERE name = 'Outerwear' LIMIT 1;
    SELECT id INTO shoes_id FROM categories WHERE name = 'Shoes' LIMIT 1;
    SELECT id INTO accessories_id FROM categories WHERE name = 'Accessories' LIMIT 1;
    SELECT id INTO activewear_id FROM categories WHERE name = 'Activewear' LIMIT 1;
    SELECT id INTO formal_id FROM categories WHERE name = 'Formal' LIMIT 1;
    
    -- Get or create a test user (we'll use the first user in auth.users or create a dummy one)
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    -- If no users exist, we'll need to create items without user_id for now
    -- (you can update these later when you register a user)
    
    -- Insert sample items
    INSERT INTO items (title, description, category_id, size, condition, points, tags, images, user_id, status) VALUES
    -- Tops
    ('Vintage Denim Jacket', 'Classic blue denim jacket with a comfortable fit. Perfect for layering in any season.', outerwear_id, 'M', 'Excellent', 45, ARRAY['denim', 'vintage', 'jacket'], ARRAY['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400'], test_user_id, 'active'),
    
    ('Cotton T-Shirt Collection', 'Set of 3 high-quality cotton t-shirts in various colors. Soft and comfortable.', tops_id, 'L', 'Like New', 25, ARRAY['cotton', 't-shirt', 'casual'], ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'], test_user_id, 'active'),
    
    ('Wool Sweater', 'Warm wool sweater perfect for cold weather. Classic design that never goes out of style.', tops_id, 'S', 'Good', 35, ARRAY['wool', 'sweater', 'winter'], ARRAY['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400'], test_user_id, 'active'),
    
    -- Dresses
    ('Summer Floral Dress', 'Beautiful floral print dress perfect for summer events. Light and breezy fabric.', dresses_id, 'M', 'Excellent', 55, ARRAY['floral', 'summer', 'dress'], ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400'], test_user_id, 'active'),
    
    ('Cocktail Dress', 'Elegant black cocktail dress suitable for formal events. Timeless design.', dresses_id, 'S', 'Like New', 75, ARRAY['cocktail', 'formal', 'black'], ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'], test_user_id, 'active'),
    
    -- Bottoms
    ('High-Waisted Jeans', 'Comfortable high-waisted jeans with a modern fit. Great for casual and semi-formal occasions.', bottoms_id, 'M', 'Good', 40, ARRAY['jeans', 'high-waisted', 'casual'], ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'], test_user_id, 'active'),
    
    ('Pleated Skirt', 'Classic pleated skirt in navy blue. Perfect for office wear or casual outings.', bottoms_id, 'S', 'Excellent', 30, ARRAY['skirt', 'pleated', 'office'], ARRAY['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400'], test_user_id, 'active'),
    
    -- Shoes
    ('White Sneakers', 'Clean white sneakers in excellent condition. Versatile and comfortable for everyday wear.', shoes_id, '8', 'Like New', 50, ARRAY['sneakers', 'white', 'casual'], ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'], test_user_id, 'active'),
    
    ('Leather Boots', 'Stylish leather boots perfect for autumn and winter. Durable and fashionable.', shoes_id, '7', 'Good', 65, ARRAY['boots', 'leather', 'winter'], ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'], test_user_id, 'active'),
    
    -- Outerwear
    ('Wool Winter Coat', 'Warm wool coat perfect for cold weather. Classic design with modern details.', outerwear_id, 'L', 'Excellent', 80, ARRAY['coat', 'wool', 'winter'], ARRAY['https://images.unsplash.com/photo-1544966503-7ad532c3efef?w=400'], test_user_id, 'active'),
    
    ('Lightweight Jacket', 'Versatile lightweight jacket suitable for spring and autumn. Water-resistant material.', outerwear_id, 'M', 'Good', 45, ARRAY['jacket', 'lightweight', 'spring'], ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'], test_user_id, 'active'),
    
    -- Accessories
    ('Leather Handbag', 'Elegant leather handbag with multiple compartments. Perfect for work or casual use.', accessories_id, 'One Size', 'Like New', 60, ARRAY['handbag', 'leather', 'elegant'], ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400'], test_user_id, 'active'),
    
    ('Silk Scarf', 'Beautiful silk scarf with a unique pattern. Adds elegance to any outfit.', accessories_id, 'One Size', 'Excellent', 25, ARRAY['scarf', 'silk', 'elegant'], ARRAY['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400'], test_user_id, 'active'),
    
    -- Activewear
    ('Yoga Pants', 'Comfortable yoga pants perfect for workouts or casual wear. High-quality fabric.', activewear_id, 'M', 'Good', 35, ARRAY['yoga', 'pants', 'workout'], ARRAY['https://images.unsplash.com/photo-1506629905607-13e6f5c1c47c?w=400'], test_user_id, 'active'),
    
    ('Sports Jacket', 'Lightweight sports jacket ideal for outdoor activities. Breathable and comfortable.', activewear_id, 'L', 'Excellent', 40, ARRAY['sports', 'jacket', 'outdoor'], ARRAY['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400'], test_user_id, 'active'),
    
    -- Formal
    ('Business Suit', 'Professional business suit suitable for formal occasions. Classic black design.', formal_id, 'M', 'Like New', 120, ARRAY['suit', 'business', 'formal'], ARRAY['https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400'], test_user_id, 'active'),
    
    ('Evening Gown', 'Stunning evening gown perfect for special events. Elegant and sophisticated design.', formal_id, 'S', 'Excellent', 150, ARRAY['gown', 'evening', 'elegant'], ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'], test_user_id, 'active');

    RAISE NOTICE 'Sample items added successfully!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding sample items: %', SQLERRM;
END $$; 