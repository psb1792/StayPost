CREATE TABLE store_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_slug text UNIQUE NOT NULL,
  store_name text NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE store_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy: allow all inserts during development
CREATE POLICY "Allow all inserts for now"
  ON public.store_profiles
  FOR INSERT
  TO public
  WITH CHECK (true);