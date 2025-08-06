/*
  # Update Store Profiles RLS Policies

  Allow public users to create stores for demo purposes
  In production, this should be restricted to authenticated users only
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to create stores" ON store_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update stores" ON store_profiles;

-- Allow public users to insert stores (for demo purposes)
CREATE POLICY "Allow public users to create stores"
  ON store_profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public users to update stores (for demo purposes)
CREATE POLICY "Allow public users to update stores"
  ON store_profiles
  FOR UPDATE
  TO public
  USING (true); 