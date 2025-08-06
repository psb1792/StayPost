alter table public.emotion_cards
add column if not exists seo_meta jsonb;

-- Enable RLS on emotion_cards table
ALTER TABLE emotion_cards ENABLE ROW LEVEL SECURITY;

-- Allow public read access for demo purposes
CREATE POLICY "Allow public read access on emotion_cards"
  ON emotion_cards
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert for demo purposes (in production, restrict to authenticated users)
CREATE POLICY "Allow public insert on emotion_cards"
  ON emotion_cards
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public update for demo purposes
CREATE POLICY "Allow public update on emotion_cards"
  ON emotion_cards
  FOR UPDATE
  TO public
  USING (true);
