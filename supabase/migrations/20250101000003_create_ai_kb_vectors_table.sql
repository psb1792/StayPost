-- AI 벡터 저장소 테이블 생성 (pgvector 확장 필요)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS ai_kb_vectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  embedding vector(1536), -- OpenAI text-embedding-3-large 차원
  created_at timestamptz DEFAULT timezone('utc'::text, now())
);

-- 벡터 인덱스 생성 (HNSW 알고리즘 사용)
CREATE INDEX IF NOT EXISTS idx_ai_kb_vectors_embedding 
  ON ai_kb_vectors 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 벡터 유사도 검색 함수
CREATE OR REPLACE FUNCTION match_vectors(
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  filter jsonb DEFAULT '{}'
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ai_kb_vectors.id,
    ai_kb_vectors.content,
    ai_kb_vectors.metadata,
    1 - (ai_kb_vectors.embedding <=> query_embedding) AS similarity
  FROM ai_kb_vectors
  WHERE ai_kb_vectors.embedding IS NOT NULL
    AND (filter = '{}' OR ai_kb_vectors.metadata @> filter)
  ORDER BY ai_kb_vectors.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Enable RLS
ALTER TABLE ai_kb_vectors ENABLE ROW LEVEL SECURITY;

-- Create policies (벡터 데이터는 읽기 전용으로 설정)
CREATE POLICY "ai_kb_vectors_select_all"
  ON ai_kb_vectors
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "ai_kb_vectors_insert_authenticated"
  ON ai_kb_vectors
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 벡터 데이터 정리 함수 (오래된 데이터 삭제)
CREATE OR REPLACE FUNCTION cleanup_old_vectors(days_old int DEFAULT 30)
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count int;
BEGIN
  DELETE FROM ai_kb_vectors 
  WHERE created_at < now() - interval '1 day' * days_old;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
