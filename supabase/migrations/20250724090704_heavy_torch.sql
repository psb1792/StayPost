/*
  # Create Store Profiles Table

  1. New Tables
    - `store_profiles`
      - `id` (uuid, primary key)
      - `store_name` (text, the original Korean store name)
      - `slug` (text, unique URL-friendly identifier)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `store_profiles` table
    - Add policy for public read access to slugs
    - Add policy for authenticated users to create/update stores
*/

CREATE TABLE IF NOT EXISTS store_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text NOT NULL,
  store_slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.store_profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access for slug checking
CREATE POLICY "Allow public read access for slugs"
  ON public.store_profiles
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert stores
CREATE POLICY "Allow authenticated users to create stores"
  ON public.store_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their own stores
CREATE POLICY "Allow authenticated users to update stores"
  ON public.store_profiles
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_store_profiles_slug ON public.store_profiles(store_slug);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_store_profiles_updated_at
  BEFORE UPDATE ON public.store_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();