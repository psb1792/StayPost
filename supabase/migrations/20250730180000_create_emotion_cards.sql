-- 새로운 AI 시스템용 감정 카드 테이블
create table if not exists public.emotion_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  store_slug text not null,
  image_url text not null,
  caption text not null,
  hashtags text[], -- 해시태그 배열
  selected_template text, -- 선택된 템플릿
  ai_reasoning jsonb, -- AI 결정 근거 (JSON 형태로 저장)
  created_at timestamp with time zone default timezone('utc', now())
);

-- Enable RLS
ALTER TABLE emotion_cards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "emotion_cards_insert_own"
  ON emotion_cards FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "emotion_cards_select_own"
  ON emotion_cards FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "emotion_cards_delete_own"
  ON emotion_cards FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
