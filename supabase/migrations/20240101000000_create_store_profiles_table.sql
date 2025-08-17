-- 새로운 AI 시스템용 가게 정보 테이블
CREATE TABLE IF NOT EXISTS store_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_slug text UNIQUE NOT NULL,
  store_name text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  phone text,
  location text,
  customer_profile text, -- 손님들 특징
  meta_info text, -- 가게 메타정보
  instagram_style text, -- 인스타 스타일
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE store_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy: allow authenticated users to manage their own stores
DROP POLICY IF EXISTS "Allow all inserts for now" ON public.store_profiles;
CREATE POLICY "store_profiles_insert_own"
  ON public.store_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "store_profiles_update_own"
  ON public.store_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "store_profiles_select_all"
  ON public.store_profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);