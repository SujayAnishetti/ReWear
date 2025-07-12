-- Fix items table to allow NULL user_id temporarily
-- Run this in your Supabase SQL Editor

-- First, drop the existing foreign key constraint
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_user_id_fkey;

-- Modify the user_id column to allow NULL values
ALTER TABLE items ALTER COLUMN user_id DROP NOT NULL;

-- Re-add the foreign key constraint with ON DELETE SET NULL
ALTER TABLE items ADD CONSTRAINT items_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- Now you can run the add-sample-data-simple.sql script 