-- Test Categories Access
-- Run this in your Supabase SQL Editor

-- Check if categories table exists
SELECT 'Categories table exists:' as info, 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') 
  THEN 'YES' ELSE 'NO' END as result;

-- Check categories count
SELECT 'Categories count:' as info, COUNT(*) as count FROM categories;

-- Show all categories
SELECT id, name, description FROM categories ORDER BY name;

-- Check RLS policies on categories
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'categories';

-- Test a simple query
SELECT 'Test query result:' as info, COUNT(*) as count FROM categories WHERE name IS NOT NULL; 