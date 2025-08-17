-- AI 지식베이스 문서 테이블 생성
CREATE TABLE IF NOT EXISTS ai_kb_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_slug text NOT NULL REFERENCES store_profiles(store_slug) ON DELETE CASCADE,
  content text NOT NULL,
  type text NOT NULL CHECK (type IN ('profile', 'policy', 'style', 'keyword')),
  axis text CHECK (axis IN ('emotion', 'tone', 'target', 'general')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz DEFAULT timezone('utc'::text, now())
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_ai_kb_documents_store_slug ON ai_kb_documents(store_slug);
CREATE INDEX IF NOT EXISTS idx_ai_kb_documents_type ON ai_kb_documents(type);
CREATE INDEX IF NOT EXISTS idx_ai_kb_documents_axis ON ai_kb_documents(axis);
CREATE INDEX IF NOT EXISTS idx_ai_kb_documents_content ON ai_kb_documents USING gin(to_tsvector('english', content));

-- Enable RLS
ALTER TABLE ai_kb_documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "ai_kb_documents_insert_own"
  ON ai_kb_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM store_profiles 
      WHERE store_slug = ai_kb_documents.store_slug 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "ai_kb_documents_update_own"
  ON ai_kb_documents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_profiles 
      WHERE store_slug = ai_kb_documents.store_slug 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "ai_kb_documents_select_all"
  ON ai_kb_documents
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_ai_kb_documents_updated_at 
  BEFORE UPDATE ON ai_kb_documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
