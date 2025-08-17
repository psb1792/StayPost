import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// OpenAI API 키 확인 (프론트엔드와 서버 모두 지원)
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  throw new Error('The OPENAI_API_KEY environment variable is missing or empty');
}

// LLM 클라이언트 초기화
export const llm = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0.2,
  openAIApiKey: openaiApiKey,
});

// 임베딩 모델 초기화
export const embeddingModel = new OpenAIEmbeddings({
  model: 'text-embedding-3-large',
  openAIApiKey: openaiApiKey,
});

// AI 시스템 설정
export const AI_CONFIG = {
  // 벡터 저장소 설정
  vectorStore: {
    tableName: 'ai_kb_vectors',
    queryName: 'match_vectors',
  },
  // 캐싱 설정
  cache: {
    enabled: true,
    ttl: 3600, // 1시간
  },
  // 로깅 설정
  logging: {
    enabled: true,
    level: 'info',
  },
} as const;
