-- 가게 정책 테이블 생성
CREATE TABLE IF NOT EXISTS store_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_slug text UNIQUE NOT NULL REFERENCES store_profiles(store_slug) ON DELETE CASCADE,
  forbidden_words text[] DEFAULT '{}', -- 금지어
  required_words text[] DEFAULT '{}', -- 필수어
  brand_names text[] DEFAULT '{}', -- 브랜드명
  location_names text[] DEFAULT '{}', -- 지역명
  tone_preferences text[] DEFAULT '{}', -- 톤 선호도
  target_audience text[] DEFAULT '{}', -- 타겟 고객
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE store_policies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "store_policies_insert_own"
  ON store_policies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM store_profiles 
      WHERE store_slug = store_policies.store_slug 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "store_policies_update_own"
  ON store_policies
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_profiles 
      WHERE store_slug = store_policies.store_slug 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "store_policies_select_all"
  ON store_policies
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_store_policies_updated_at 
  BEFORE UPDATE ON store_policies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
