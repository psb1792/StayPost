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