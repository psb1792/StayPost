-- 20250807_add_intro_to_store_profiles.sql

ALTER TABLE store_profiles
ADD COLUMN IF NOT EXISTS intro text;

COMMENT ON COLUMN store_profiles.intro IS '펜션 소개 문장 (프롬프트에 활용됨)'; 

-- AI 학습 데이터 저장 테이블
CREATE TABLE IF NOT EXISTS ai_learning_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  step text NOT NULL, -- 'image_suitability', 'content_parameters', 'custom_caption', 'final_tags'
  input_data jsonb NOT NULL, -- AI 입력 데이터
  output_data jsonb NOT NULL, -- AI 출력 데이터
  reasoning jsonb, -- AI 결정 근거
  processing_time integer, -- 처리 시간 (ms)
  model_version text, -- AI 모델 버전
  created_at timestamptz DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE ai_learning_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "ai_learning_data_insert_own"
  ON ai_learning_data FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ai_learning_data_select_own"
  ON ai_learning_data FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Create index for fast queries
CREATE INDEX IF NOT EXISTS idx_ai_learning_data_step ON ai_learning_data(step);
CREATE INDEX IF NOT EXISTS idx_ai_learning_data_created_at ON ai_learning_data(created_at); 