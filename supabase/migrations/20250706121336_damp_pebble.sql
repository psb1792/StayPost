/*
  # Create processed images table

  1. New Tables
    - `processed_images`
      - `id` (uuid, primary key)
      - `original_url` (text) - URL to original image in storage
      - `relighted_url` (text) - URL to relighted image in storage
      - `lighting_prompt` (text) - The prompt used for relighting
      - `image_meta` (jsonb) - Image metadata from AI analysis
      - `file_name` (text) - Original filename
      - `file_size` (bigint) - File size in bytes
      - `mime_type` (text) - File MIME type
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `processed_images` table
    - Add policy for public read access (for demo purposes)
    - Add policy for authenticated users to insert
*/

CREATE TABLE IF NOT EXISTS processed_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_url text NOT NULL,
  relighted_url text,
  lighting_prompt text,
  image_meta jsonb,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE processed_images ENABLE ROW LEVEL SECURITY;

-- Allow public read access for demo purposes
CREATE POLICY "Allow public read access"
  ON processed_images
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert for demo purposes (in production, restrict to authenticated users)
CREATE POLICY "Allow public insert"
  ON processed_images
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public update for demo purposes
CREATE POLICY "Allow public update"
  ON processed_images
  FOR UPDATE
  TO public
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_processed_images_updated_at
  BEFORE UPDATE ON processed_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();