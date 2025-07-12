-- Test Browse Items Database Access
-- Run this in your Supabase SQL Editor

-- Check if items table exists and has data
SELECT 'Items count:' as info, COUNT(*) as count FROM items;

-- Check if categories table exists and has data
SELECT 'Categories count:' as info, COUNT(*) as count FROM categories;

-- Check active items
SELECT 'Active items count:' as info, COUNT(*) as count FROM items WHERE status = 'active';

-- Show sample items
SELECT id, title, status, created_at FROM items LIMIT 5;

-- Check RLS policies on items table
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'items';

-- Test a simple query that should work
SELECT id, title, points FROM items WHERE status = 'active' LIMIT 3; 