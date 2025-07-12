-- Diagnostic Query - Run this in Supabase SQL Editor
-- This will show us what's currently in your database

-- Check if tables exist
SELECT 
  table_name,
  CASE WHEN table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'categories', 'items', 'swap_requests', 'transactions');

-- Check if the trigger function exists
SELECT 
  routine_name,
  CASE WHEN routine_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'handle_new_user';

-- Check if the trigger exists
SELECT 
  trigger_name,
  CASE WHEN trigger_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name = 'on_auth_user_created';

-- Check if categories have data
SELECT 'Categories count:' as info, COUNT(*) as count FROM categories;

-- Check if items have data
SELECT 'Items count:' as info, COUNT(*) as count FROM items;

-- Check RLS policies on profiles table
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'; 