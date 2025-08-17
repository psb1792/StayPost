// 스타일 preset 타입 정의
export interface StylePreset {
  tone: string;
  context: string;
  rhythm: string;
  self_projection: string;
  vocab_color: {
    generation: string;
    genderStyle: string;
    internetLevel: string;
  };
}

// 대안 패턴 상세 정보 타입
export interface CandidatePattern {
  key: string;
  name: string;
  confidence: number;
  reasoning: string;
  description: string;
  preview?: string; // 미리보기 이미지 URL
  features: string[];
  scenarios: string[];
  isAIRecommendation?: boolean; // AI 추천 여부
  colorPalette?: {
    primary: string;
    accent: string;
    background: string;
  };
  fontStyle?: {
    title: string;
    body: string;
  };
}

// AI 추천 패턴 정보 타입 (확장)
export interface AIRecommendation {
  recipeKey: string;
  candidates: string[];
  confidence: number;
  textHints: string[];
  // 대안 패턴 상세 정보 추가
  candidateDetails?: CandidatePattern[];
}

// 대안 패턴 상태 관리 타입
export interface AlternativePatternsState {
  primaryRecommendation: CandidatePattern | null;
  alternatives: CandidatePattern[];
  selectedPattern: CandidatePattern | null;
  showAlternatives: boolean;
  previewMode: 'hover' | 'modal' | 'comparison';
  loading: boolean;
  error: string | null;
}

// AI 스타일 분석 결과 타입
export interface StyleProfile {
  emotion: string;
  emotion_level: string;
  tone: string;
  context: string;
  rhythm: string;
  self_projection: string;
  vocab_color: {
    generation: string;
    genderStyle: string;
    internetLevel: string;
  };
  // AI 추천 패턴 정보 추가
  aiRecommendation?: AIRecommendation;
}

// 기본 스타일 preset
export function getDefaultPreset(): StylePreset {
  return {
    tone: 'friendly',
    context: 'general',
    rhythm: 'balanced',
    self_projection: 'modest',
    vocab_color: {
      generation: 'millennial',
      genderStyle: 'neutral',
      internetLevel: 'moderate'
    }
  };
}

// 기존 store 정보 타입
export interface StoreProfile {
  slug: string;
  store_name: string;
  tone?: string;
  context?: string;
  rhythm?: string;
  self_projection?: string;
  vocab_color?: StylePreset['vocab_color'];
} 