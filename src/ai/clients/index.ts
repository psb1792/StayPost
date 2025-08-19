import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// LLM 클라이언트 초기화 - API 키는 동적으로 설정됨
export const createLLM = (apiKey: string) => new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0.2,
  apiKey: apiKey, // openAIApiKey가 아닌 apiKey 사용
});

// 임베딩 모델 초기화 - API 키는 동적으로 설정됨
export const createEmbeddingModel = (apiKey: string) => new OpenAIEmbeddings({
  model: 'text-embedding-3-large',
  apiKey: apiKey, // openAIApiKey가 아닌 apiKey 사용
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
