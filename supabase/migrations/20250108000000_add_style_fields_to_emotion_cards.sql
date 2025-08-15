-- Add style_profile and style_analysis columns to emotion_cards table
ALTER TABLE public.emotion_cards
ADD COLUMN IF NOT EXISTS style_profile jsonb,
ADD COLUMN IF NOT EXISTS style_analysis text;

COMMENT ON COLUMN emotion_cards.style_profile IS 'AI 추천 스타일 프로필 (JSON 형태)';
COMMENT ON COLUMN emotion_cards.style_analysis IS 'AI 분석 근거 및 설명';

CREATE INDEX IF NOT EXISTS idx_emotion_cards_style_profile 
ON emotion_cards USING GIN (style_profile);
