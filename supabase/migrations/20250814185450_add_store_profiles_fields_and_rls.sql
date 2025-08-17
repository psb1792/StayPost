-- 1) 컬럼 추가 (기존 데이터 고려해 NULL 허용으로 시작)
ALTER TABLE public.store_profiles 
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS pension_introduction text,
  ADD COLUMN IF NOT EXISTS default_style_profile jsonb DEFAULT '{}'::jsonb;

-- 2) RLS 켜기(이미 켜져 있으면 스킵)
ALTER TABLE public.store_profiles ENABLE ROW LEVEL SECURITY;

-- 3) 기존 과허용 정책 제거(있을 경우)
DROP POLICY IF EXISTS "Allow authenticated users to update stores" ON public.store_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to create stores" ON public.store_profiles;

-- 4) 새 정책: 본인 소유만 INSERT/UPDATE (이미 존재하면 스킵)
DROP POLICY IF EXISTS "store_profiles_insert_own" ON public.store_profiles;
CREATE POLICY "store_profiles_insert_own"
ON public.store_profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "store_profiles_update_own" ON public.store_profiles;
CREATE POLICY "store_profiles_update_own"
ON public.store_profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- (선택) SELECT는 모두 읽기 허용(퍼블릭 노출 필요한 경우)
DROP POLICY IF EXISTS "store_profiles_select_all" ON public.store_profiles;
CREATE POLICY "store_profiles_select_all"
ON public.store_profiles FOR SELECT
TO anon, authenticated
USING (true);
