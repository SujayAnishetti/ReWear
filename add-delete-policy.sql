-- Add Delete Policy for Items
-- Run this in your Supabase SQL Editor

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Items - Allow deleting" ON items;

-- Create policy for deleting items (users can only delete their own items)
CREATE POLICY "Items - Allow deleting"
  ON items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Test the policy
SELECT 'Delete policy added successfully!' as message; 