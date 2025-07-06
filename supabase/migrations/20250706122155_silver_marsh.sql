/*
  # Enhanced processed_images table with StayPost content

  1. New Columns
    - `content_text` (text) - Generated StayPost content
    - `hashtags` (text) - Generated hashtags
    - `pattern_used` (text) - Content pattern that was used

  2. Security
    - Maintains existing RLS policies
    - Adds content-related fields for complete workflow
*/

-- Add new columns for StayPost content
ALTER TABLE processed_images 
ADD COLUMN IF NOT EXISTS content_text text,
ADD COLUMN IF NOT EXISTS hashtags text,
ADD COLUMN IF NOT EXISTS pattern_used text;

-- Update the table comment
COMMENT ON TABLE processed_images IS 'Stores processed images with AI analysis, lighting enhancement, and generated StayPost content';

-- Add column comments
COMMENT ON COLUMN processed_images.content_text IS 'AI-generated StayPost content text';
COMMENT ON COLUMN processed_images.hashtags IS 'Generated hashtags for social media';
COMMENT ON COLUMN processed_images.pattern_used IS 'Content pattern used for generation';