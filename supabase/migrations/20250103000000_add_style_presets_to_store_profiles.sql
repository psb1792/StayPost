-- Add style preset fields to store_profiles table
ALTER TABLE store_profiles 
ADD COLUMN IF NOT EXISTS tone text,
ADD COLUMN IF NOT EXISTS context text,
ADD COLUMN IF NOT EXISTS rhythm text,
ADD COLUMN IF NOT EXISTS self_projection text,
ADD COLUMN IF NOT EXISTS vocab_color jsonb;

-- Add comment for documentation
COMMENT ON COLUMN store_profiles.tone IS 'Content tone style (e.g., friendly, professional, casual)';
COMMENT ON COLUMN store_profiles.context IS 'Content context style (e.g., marketing, personal, informative)';
COMMENT ON COLUMN store_profiles.rhythm IS 'Content rhythm style (e.g., short, medium, long)';
COMMENT ON COLUMN store_profiles.self_projection IS 'Self projection style (e.g., confident, humble, enthusiastic)';
COMMENT ON COLUMN store_profiles.vocab_color IS 'Vocabulary color settings as JSON object';

-- Update existing RLS policies to include new columns
-- (Assuming the table already has RLS enabled from the original migration) 