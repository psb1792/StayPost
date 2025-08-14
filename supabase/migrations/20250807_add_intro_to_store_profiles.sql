-- 20250807_add_intro_to_store_profiles.sql

ALTER TABLE store_profiles
ADD COLUMN IF NOT EXISTS intro text;

COMMENT ON COLUMN store_profiles.intro IS '펜션 소개 문장 (프롬프트에 활용됨)'; 