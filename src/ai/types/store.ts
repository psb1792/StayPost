import { z } from 'zod';

// 가게 프로필 스키마
export const StoreProfileSchema = z.object({
  id: z.string().uuid().optional(),
  store_slug: z.string().min(1),
  store_name: z.string().min(1),
  user_id: z.string().uuid().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  customer_profile: z.string().optional(), // 손님들 특징
  meta_info: z.string().optional(), // 가게 메타정보
  instagram_style: z.string().optional(), // 인스타 스타일
  pension_introduction: z.string().optional(),
  default_style_profile: z.record(z.any()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type StoreProfile = z.infer<typeof StoreProfileSchema>;

// 가게 정책 스키마
export const StorePolicySchema = z.object({
  id: z.string().uuid().optional(),
  store_slug: z.string(),
  forbidden_words: z.array(z.string()).optional(), // 금지어
  required_words: z.array(z.string()).optional(), // 필수어
  brand_names: z.array(z.string()).optional(), // 브랜드명
  location_names: z.array(z.string()).optional(), // 지역명
  tone_preferences: z.array(z.string()).optional(), // 톤 선호도
  target_audience: z.array(z.string()).optional(), // 타겟 고객
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type StorePolicy = z.infer<typeof StorePolicySchema>;

// AI 인덱스 문서 스키마
export const AIDocumentSchema = z.object({
  id: z.string().uuid().optional(),
  store_slug: z.string(),
  content: z.string(),
  type: z.enum(['profile', 'policy', 'style', 'keyword']),
  axis: z.enum(['emotion', 'tone', 'target', 'general']).optional(),
  metadata: z.record(z.any()).optional(),
  embedding: z.array(z.number()).optional(),
  created_at: z.string().optional(),
});

export type AIDocument = z.infer<typeof AIDocumentSchema>;

// 가게 정보 통합 타입
export interface StoreInfo {
  profile: StoreProfile;
  policy: StorePolicy;
  documents: AIDocument[];
}

// AI 검색 결과 타입
export interface SearchResult {
  document: AIDocument;
  score: number;
  reasons: string[];
}

// AI 시스템 응답 타입
export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    model: string;
    latency_ms: number;
    tokens_used?: number;
    retry_count?: number;
  };
}
