// 기본 텍스트 블록 타입
export type CanvasTextBlock = {
  text: string;
  align?: 'left' | 'center' | 'right';
  maxWidthPct?: number;   // 0~1, 기본 0.9
  fontSize?: number;      // px
  fontWeight?: number;    // 400~900
  lineClamp?: number;     // 줄 수 제한
  withOutline?: boolean;  // 외곽선 그리기
};

// 새로운 AI 시스템용 간단한 캡션 결과 타입
export interface SimpleCaptionResult {
  caption: string;
  hashtags: string[];
}

// 가게 정보 타입
export interface StoreInfo {
  slug: string;
  name: string;
  phone: string;
  location: string;
  customerProfile: string;  // 손님들 특징
  metaInfo: string;         // 가게 메타정보
  instagramStyle: string;   // 인스타 스타일
}

// AI 템플릿 추천 타입
export interface AITemplateRecommendation {
  font: string;
  color: string;
  layout: string;
  confidence: number;
}

// AI 응답 공통 타입
export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  reasoning?: string;
}
