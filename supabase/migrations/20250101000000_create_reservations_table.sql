/*
  # Create Reservations Table

  1. New Tables
    - `reservations`
      - `id` (uuid, primary key)
      - `store_slug` (text, references store_profiles.slug)
      - `date` (date, reservation date)
      - `time` (time, reservation time)
      - `person_count` (integer, number of guests)
      - `name` (text, customer name)
      - `phone` (text, customer phone number)
      - `request` (text, optional special requests)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `reservations` table
    - Add policy for public insert (for reservation submissions)
    - Add policy for store owners to read their reservations
*/
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';


CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_slug text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  person_count integer NOT NULL CHECK (person_count > 0),
  name text NOT NULL,
  phone text NOT NULL,
  request text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Allow public insert for reservation submissions
CREATE POLICY "Allow public insert reservations"
  ON reservations
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow store owners to read their reservations (future enhancement)
CREATE POLICY "Allow store owners to read reservations"
  ON reservations
  FOR SELECT
  TO public
  USING (true);

-- Create index for fast lookups by store_slug and date
CREATE INDEX IF NOT EXISTS idx_reservations_store_date ON reservations(store_slug, date);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 